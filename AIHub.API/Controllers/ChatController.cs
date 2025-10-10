using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AIHub.API.Services;
using AIHub.API.Repositories;
using AIHub.API.Models;
using AIHub.API.Data;

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
        private readonly AIHubDbContext _context;
        private readonly EncryptionService _encryptionService;

        public ChatController(
            IChatSessionRepository chatSessionRepository,
            IMessageRepository messageRepository,
            IApiKeyRepository apiKeyRepository,
            IContextService contextService,
            AIHubDbContext context,
            EncryptionService encryptionService)
        {
            _chatSessionRepository = chatSessionRepository;
            _messageRepository = messageRepository;
            _apiKeyRepository = apiKeyRepository;
            _contextService = contextService;
            _context = context;
            _encryptionService = encryptionService;
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
                
                // Get session first
                var session = await _chatSessionRepository.GetByIdAsync(id);
                if (session == null || session.UserId != userId)
                {
                    return NotFound(new { message = "Chat session not found" });
                }

                // Use simple transaction for the one operation that needs it
                using var transaction = await _context.Database.BeginTransactionAsync();
                
                try
                {
                    // Derive service from session
                    var serviceName = await _chatSessionRepository.GetServiceNameByIdAsync(id);
                    if (string.IsNullOrWhiteSpace(serviceName))
                    {
                        return BadRequest(new { message = "Chat session has no associated service" });
                    }

                    // 1. Save user message
                    var userMessage = new Message
                    {
                        ChatSessionId = id,
                        ServiceName = serviceName,
                        Content = request.Message,
                        Role = "user"
                    };
                    await _messageRepository.CreateAsync(userMessage);

                    // 2. Get recent messages for context
                    var recentMessages = (await _messageRepository.GetByChatSessionIdAsync(id))
                        .OrderBy(m => m.CreatedAt)
                        .TakeLast(15)
                        .ToList();

                    // 3. Update context summary
                    await _contextService.UpdateContextSummaryAsync(id, recentMessages);

                    // 4. Get context summary for AI
                    var contextSummary = await _contextService.GetContextSummaryAsync(id);

                    // 5. Get API key and call AI service
                    var apiKey = await _apiKeyRepository.GetByUserAndServiceAsync(userId, serviceName);
                    string response;
                    
                    if (apiKey == null)
                    {
                        response = $"I'm {serviceName}, but I need an API key to respond. Please add your {serviceName} API key in Settings to start chatting!";
                    }
                    else
                    {
                        var aiService = GetAIService(serviceName);
                        if (aiService == null)
                        {
                            return BadRequest(new { message = "Invalid service name" });
                        }

                        var messageWithContext = string.IsNullOrEmpty(contextSummary) 
                            ? request.Message 
                            : $"{contextSummary}\n\nUser: {request.Message}";

                        // Cast to UnifiedAIService to use the overloaded method
                        var unifiedService = (UnifiedAIService)aiService;
                        var plainKey = _encryptionService.Decrypt(apiKey.EncryptedKey);
                        response = await unifiedService.SendMessageAsync(messageWithContext, plainKey, serviceName);
                    }

                    // 6. Save AI response
                    var aiMessage = new Message
                    {
                        ChatSessionId = id,
                        ServiceName = serviceName,
                        Content = response,
                        Role = "assistant"
                    };
                    await _messageRepository.CreateAsync(aiMessage);

                    // 7. Update session timestamp
                    session.UpdatedAt = DateTime.UtcNow;
                    await _chatSessionRepository.UpdateAsync(session);

                    // 8. Commit transaction
                    await transaction.CommitAsync();

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
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
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
            return HttpContext.RequestServices.GetService<UnifiedAIService>();
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
