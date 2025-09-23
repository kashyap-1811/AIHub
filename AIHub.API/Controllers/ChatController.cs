using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
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

        public ChatController(
            IChatSessionRepository chatSessionRepository,
            IMessageRepository messageRepository,
            IApiKeyRepository apiKeyRepository,
            IContextService contextService,
            AIHubDbContext context)
        {
            _chatSessionRepository = chatSessionRepository;
            _messageRepository = messageRepository;
            _apiKeyRepository = apiKeyRepository;
            _contextService = contextService;
            _context = context;
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
                    s.UpdatedAt
                }).OrderByDescending(s => s.UpdatedAt);
                
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
                
                await _chatSessionRepository.CreateAsync(session);
                
                return Ok(new
                {
                    session.Id,
                    session.Title,
                    session.ServiceName,
                    session.CreatedAt,
                    session.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("sessions/{id}")]
        public async Task<IActionResult> UpdateChatSession(string id, [FromBody] UpdateChatSessionRequest request)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value;
                var session = await _chatSessionRepository.GetByIdForUpdateAsync(id);
                
                if (session == null || session.UserId != userId)
                {
                    return NotFound(new { message = "Chat session not found" });
                }
                
                session.Title = request.Title;
                session.ServiceName = request.ServiceName;
                session.UpdatedAt = DateTime.UtcNow;
                
                await _chatSessionRepository.UpdateAsync(session);
                
                return Ok(new
                {
                    session.Id,
                    session.Title,
                    session.ServiceName,
                    session.CreatedAt,
                    session.UpdatedAt
                });
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
                var session = await _chatSessionRepository.GetByIdForUpdateAsync(id);
                
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
                    m.Content,
                    m.Role,
                    m.ServiceName,
                    m.CreatedAt
                }).OrderBy(m => m.CreatedAt);
                
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
                    ServiceName = session.ServiceName,
                    Content = request.Message,
                    Role = "user"
                };
                
                await _messageRepository.CreateAsync(userMessage);

                // Get AI service
                var aiService = GetAIService(session.ServiceName);
                if (aiService == null)
                {
                    return BadRequest(new { message = $"AI service '{session.ServiceName}' not found" });
                }

                // Get API key
                var apiKey = await _apiKeyRepository.GetByUserAndServiceAsync(userId, session.ServiceName);
                if (apiKey == null)
                {
                    return BadRequest(new { message = $"API key for {session.ServiceName} not found" });
                }

                // Get conversation history
                var messages = await _messageRepository.GetByChatSessionIdAsync(id);
                var conversationHistory = messages.Select(m => new
                {
                    role = m.Role,
                    content = m.Content
                }).ToList();

                // Send to AI service
                var aiResponse = await aiService.SendMessageAsync(request.Message, apiKey.EncryptedKey);

                // Save AI response
                var assistantMessage = new Message
                {
                    ChatSessionId = id,
                    ServiceName = session.ServiceName,
                    Content = aiResponse,
                    Role = "assistant"
                };
                
                await _messageRepository.CreateAsync(assistantMessage);

                // Update session timestamp
                session.UpdatedAt = DateTime.UtcNow;
                await _chatSessionRepository.UpdateAsync(session);

                return Ok(new
                {
                    userMessage = new
                    {
                        userMessage.Id,
                        userMessage.Content,
                        userMessage.Role,
                        userMessage.ServiceName,
                        userMessage.CreatedAt
                    },
                    assistantMessage = new
                    {
                        assistantMessage.Id,
                        assistantMessage.Content,
                        assistantMessage.Role,
                        assistantMessage.ServiceName,
                        assistantMessage.CreatedAt
                    }
                });
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
        public string ServiceName { get; set; } = string.Empty;
    }

    public class UpdateChatSessionRequest
    {
        public string Title { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
    }

    public class SendMessageRequest
    {
        public string Message { get; set; } = string.Empty;
    }
}