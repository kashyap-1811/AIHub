using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AIHub.API.Services;
using AIHub.API.Repositories;
using AIHub.API.Models;

namespace AIHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ApiKeyController : ControllerBase
    {
        private readonly IApiKeyRepository _apiKeyRepository;
        private readonly IServiceProvider _serviceProvider;

        public ApiKeyController(IApiKeyRepository apiKeyRepository, IServiceProvider serviceProvider)
        {
            _apiKeyRepository = apiKeyRepository;
            _serviceProvider = serviceProvider;
        }

        private string? GetUserId()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            return claim?.Value;
        }

        [HttpGet]
        public async Task<IActionResult> GetApiKeys()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "User not authenticated" });

            var apiKeys = await _apiKeyRepository.GetByUserIdAsync(userId);

            var result = apiKeys.Select(ak => new
            {
                ak.Id,
                ak.ServiceName,
                ApiKey = ak.EncryptedKey, // ⚠️ consider hiding in production
                HasKey = !string.IsNullOrEmpty(ak.EncryptedKey),
                ak.CreatedAt,
                ak.UpdatedAt
            });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> SaveApiKey([FromBody] SaveApiKeyRequest request)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "User not authenticated" });

            if (string.IsNullOrWhiteSpace(request.ApiKey))
                return BadRequest(new { message = "API key cannot be empty" });

            if (string.IsNullOrWhiteSpace(request.ServiceName))
                return BadRequest(new { message = "Service name cannot be empty" });

            var existingApiKey = await _apiKeyRepository.GetByUserAndServiceAsync(userId, request.ServiceName);

            if (existingApiKey != null)
            {
                existingApiKey.EncryptedKey = request.ApiKey; // ⚠️ still plain text
                existingApiKey.UpdatedAt = DateTime.UtcNow;
                await _apiKeyRepository.UpdateAsync(existingApiKey);
            }
            else
            {
                var apiKey = new ApiKey
                {
                    UserId = userId,
                    ServiceName = request.ServiceName,
                    EncryptedKey = request.ApiKey, // ⚠️ still plain text
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _apiKeyRepository.CreateAsync(apiKey);
            }

            return Ok(new { message = "API key saved successfully" });
        }

        [HttpDelete("{serviceName}")]
        public async Task<IActionResult> DeleteApiKey(string serviceName)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "User not authenticated" });

            var apiKey = await _apiKeyRepository.GetByUserAndServiceAsync(userId, serviceName);
            if (apiKey == null)
                return NotFound(new { message = "API key not found" });

            await _apiKeyRepository.DeleteAsync(apiKey.Id);
            return Ok(new { message = "API key deleted successfully" });
        }

        [HttpPost("validate")]
        public async Task<IActionResult> ValidateApiKey([FromBody] ValidateApiKeyRequest request)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "User not authenticated" });

            var apiKey = await _apiKeyRepository.GetByUserAndServiceAsync(userId, request.ServiceName);
            if (apiKey == null)
                return NotFound(new { message = "API key not found" });

            var aiService = GetAIService(request.ServiceName);
            if (aiService == null)
                return BadRequest(new { message = "Invalid service name" });

            var isValid = await aiService.ValidateApiKeyAsync(apiKey.EncryptedKey);
            return Ok(new { isValid });
        }

        [HttpGet("test")]
        public async Task<IActionResult> TestDatabase()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "User not authenticated" });

            var allKeys = await _apiKeyRepository.GetByUserIdAsync(userId);

            var testKey = new ApiKey
            {
                UserId = userId,
                ServiceName = "TEST_SERVICE",
                EncryptedKey = "test-key-123",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var created = await _apiKeyRepository.CreateAsync(testKey);
            var retrieved = await _apiKeyRepository.GetByUserAndServiceAsync(userId, "TEST_SERVICE");
            await _apiKeyRepository.DeleteAsync(created.Id);

            return Ok(new
            {
                message = "Database test successful",
                userKeys = allKeys.Count(),
                testKeyCreated = created.Id,
                testKeyRetrieved = retrieved?.EncryptedKey
            });
        }

        private IAIService? GetAIService(string serviceName) =>
            serviceName switch
            {
                "ChatGPT" => _serviceProvider.GetService<ChatGPTService>(),
                "Gemini" => _serviceProvider.GetService<GeminiService>(),
                "Claude" => _serviceProvider.GetService<ClaudeService>(),
                "DeepSeek" => _serviceProvider.GetService<DeepSeekService>(),
                _ => null
            };
    }

    public class SaveApiKeyRequest
    {
        public string ServiceName { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
    }

    public class ValidateApiKeyRequest
    {
        public string ServiceName { get; set; } = string.Empty;
    }
}
