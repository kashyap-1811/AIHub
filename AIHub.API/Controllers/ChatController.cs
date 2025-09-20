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
    public class ChatController : ControllerBase
    {
        private readonly IChatSessionRepository _chatSessionRepository;
        private readonly IMessageRepository _messageRepository;
        private readonly IApiKeyRepository _apiKeyRepository;
        private readonly IContextService _contextService;

        public ChatController(
            IChatSessionRepository chatSessionRepository,
            IMessageRepository messageRepository,
            IApiKeyRepository apiKeyRepository,
            IContextService contextService)
        {
            _chatSessionRepository = chatSessionRepository;
            _messageRepository = messageRepository;
            _apiKeyRepository = apiKeyRepository;
            _contextService = contextService;
        }

        [HttpGet("sessions")]
        public async Task<IActionResult> GetChatSessions()
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value;
                var sessions = await _chatSessionRepository.GetByUserIdAsync(userId);
                
                var result = sessions.Select(s => new
                {
                    s.Id,
                    s.Title,
                    s.ServiceName,
                    s.CreatedAt,
                    s.UpdatedAt,
                    MessageCount = s.Messages?.Count ?? 0
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("sessions")]
        public async Task<IActionResult> CreateChatSession([FromBody] CreateChatSessionRequest request)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value;
                
                var session = new ChatSession
                {
                    UserId = userId,
                    Title = request.Title,
                    ServiceName = request.ServiceName
                };

                var createdSession = await _chatSessionRepository.CreateAsync(session);
                
                return Ok(new
                {
                    createdSession.Id,
                    createdSession.Title,
                    createdSession.ServiceName,
                    createdSession.CreatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("sessions/{id}/messages")]
        public async Task<IActionResult> GetMessages(string id)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value;
                var session = await _chatSessionRepository.GetByIdAsync(id);
                
                if (session == null || session.UserId != userId)
                {
                    return NotFound(new { message = "Chat session not found" });
                }

                var messages = await _messageRepository.GetByChatSessionIdAsync(id);
                
                var result = messages.Select(m => new
                {
                    m.Id,
                    m.ServiceName,
                    m.Content,
                    m.Role,
                    m.CreatedAt
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("sessions/{id}/messages")]
        public async Task<IActionResult> SendMessage(string id, [FromBody] SendMessageRequest request)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value;
                var session = await _chatSessionRepository.GetByIdAsync(id);
                
                if (session == null || session.UserId != userId)
                {
                    return NotFound(new { message = "Chat session not found" });
                }

                // Save user message
                var userMessage = new Message
                {
                    ChatSessionId = id,
                    ServiceName = request.ServiceName,
                    Content = request.Message,
                    Role = "user"
                };
                await _messageRepository.CreateAsync(userMessage);

                // Get recent messages for context
                var recentMessages = (await _messageRepository.GetByChatSessionIdAsync(id))
                    .OrderBy(m => m.CreatedAt)
                    .TakeLast(15)
                    .ToList();

                // Update context summary
                await _contextService.UpdateContextSummaryAsync(id, recentMessages);

                // Get context summary for AI
                var contextSummary = await _contextService.GetContextSummaryAsync(id);

                // Get API key for the service (optional)
                var apiKey = await _apiKeyRepository.GetByUserAndServiceAsync(userId, request.ServiceName);
                string response;
                
                if (apiKey == null)
                {
                    // No API key - return a mock response
                    response = $"I'm {request.ServiceName}, but I need an API key to respond. Please add your {request.ServiceName} API key in Settings to start chatting!";
                }
                else
                {
                    // API key exists - use it
                    var plainTextKey = apiKey.EncryptedKey; // No decryption needed
                    
                    // Get AI service and send message with context
                    var aiService = GetAIService(request.ServiceName);
                    if (aiService == null)
                    {
                        return BadRequest(new { message = "Invalid service name" });
                    }

                    // Prepare message with context
                    var messageWithContext = string.IsNullOrEmpty(contextSummary) 
                        ? request.Message 
                        : $"{contextSummary}\n\nUser: {request.Message}";

                    response = await aiService.SendMessageAsync(messageWithContext, plainTextKey);
                }

                // Save AI response
                var aiMessage = new Message
                {
                    ChatSessionId = id,
                    ServiceName = request.ServiceName,
                    Content = response,
                    Role = "assistant"
                };
                await _messageRepository.CreateAsync(aiMessage);

                // Update session timestamp
                session.UpdatedAt = DateTime.UtcNow;
                await _chatSessionRepository.UpdateAsync(session);

                return Ok(new
                {
                    UserMessage = new
                    {
                        userMessage.Id,
                        userMessage.ServiceName,
                        userMessage.Content,
                        userMessage.Role,
                        userMessage.CreatedAt
                    },
                    AIMessage = new
                    {
                        aiMessage.Id,
                        aiMessage.ServiceName,
                        aiMessage.Content,
                        aiMessage.Role,
                        aiMessage.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("broadcast")]
        public async Task<IActionResult> BroadcastMessage([FromBody] BroadcastMessageRequest request)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value;
                var responses = new List<object>();

                foreach (var serviceName in request.ServiceNames)
                {
                    // Get API key for the service (optional)
                    var apiKey = await _apiKeyRepository.GetByUserAndServiceAsync(userId, serviceName);
                    string response;
                    
                    if (apiKey == null)
                    {
                        // No API key - return a mock response
                        response = $"I'm {serviceName}, but I need an API key to respond. Please add your {serviceName} API key in Settings to start chatting!";
                    }
                    else
                    {
                        // API key exists - use it
                        var plainTextKey = apiKey.EncryptedKey; // No decryption needed
                        
                        // Get AI service and send message
                        var aiService = GetAIService(serviceName);
                        if (aiService == null)
                        {
                            responses.Add(new { ServiceName = serviceName, Error = "Invalid service" });
                            continue;
                        }

                        response = await aiService.SendMessageAsync(request.Message, plainTextKey);
                    }
                    
                    responses.Add(new { ServiceName = serviceName, Response = response });
                }

                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("sessions/{id}")]
        public async Task<IActionResult> DeleteChatSession(string id)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value;
                var session = await _chatSessionRepository.GetByIdAsync(id);
                
                if (session == null || session.UserId != userId)
                {
                    return NotFound(new { message = "Chat session not found" });
                }

                await _chatSessionRepository.DeleteAsync(id);
                return Ok(new { message = "Chat session deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        private IAIService? GetAIService(string serviceName)
        {
            return serviceName switch
            {
                "ChatGPT" => HttpContext.RequestServices.GetService<ChatGPTService>(),
                "Gemini" => HttpContext.RequestServices.GetService<GeminiService>(),
                "Claude" => HttpContext.RequestServices.GetService<ClaudeService>(),
                "DeepSeek" => HttpContext.RequestServices.GetService<DeepSeekService>(),
                _ => null
            };
        }
    }

    public class CreateChatSessionRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? ServiceName { get; set; }
    }

    public class SendMessageRequest
    {
        public string ServiceName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class BroadcastMessageRequest
    {
        public string Message { get; set; } = string.Empty;
        public List<string> ServiceNames { get; set; } = new();
    }
}
