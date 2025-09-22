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
        private readonly IConversationRepository _conversationRepository;
        private readonly IContextService _contextService;
        private readonly AIHubDbContext _context;

        public ChatController(
            IChatSessionRepository chatSessionRepository,
            IMessageRepository messageRepository,
            IApiKeyRepository apiKeyRepository,
            IConversationRepository conversationRepository,
            IContextService contextService,
            AIHubDbContext context)
        {
            _chatSessionRepository = chatSessionRepository;
            _messageRepository = messageRepository;
            _apiKeyRepository = apiKeyRepository;
            _conversationRepository = conversationRepository;
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
                var session = await _chatSessionRepository.GetByIdForUpdateAsync(id);
                
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
                var session = await _chatSessionRepository.GetByIdForUpdateAsync(id);
                
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

        // Conversation endpoints for multi-AI chat
        [HttpPost("sessions/{sessionId}/conversations")]
        public async Task<IActionResult> CreateConversation(string sessionId, [FromBody] CreateConversationRequest request)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value;
                var session = await _chatSessionRepository.GetByIdForUpdateAsync(sessionId);
                
                if (session == null || session.UserId != userId)
                {
                    return NotFound(new { message = "Chat session not found" });
                }

                var conversation = new Conversation
                {
                    ChatSessionId = sessionId,
                    Title = request.Title,
                    ServiceName = request.ServiceName ?? "ChatGPT"
                };

                var createdConversation = await _conversationRepository.CreateAsync(conversation);
                return Ok(new
                {
                    createdConversation.Id,
                    createdConversation.Title,
                    createdConversation.ServiceName,
                    createdConversation.CreatedAt,
                    createdConversation.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("sessions/{sessionId}/conversations")]
        public async Task<IActionResult> GetConversations(string sessionId)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value;
                var session = await _chatSessionRepository.GetByIdForUpdateAsync(sessionId);
                
                if (session == null || session.UserId != userId)
                {
                    return NotFound(new { message = "Chat session not found" });
                }

                var conversations = await _conversationRepository.GetByChatSessionIdAsync(sessionId);
                var conversationDtos = conversations.Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.ServiceName,
                    c.CreatedAt,
                    c.UpdatedAt
                });
                return Ok(conversationDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("conversations/{conversationId}/messages")]
        public async Task<IActionResult> GetConversationMessages(string conversationId)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value;
                var conversation = await _conversationRepository.GetByIdForUpdateAsync(conversationId);
                
                if (conversation == null)
                {
                    return NotFound(new { message = "Conversation not found" });
                }

                // Verify ownership by checking the chat session
                var chatSession = await _chatSessionRepository.GetByIdForUpdateAsync(conversation.ChatSessionId);
                if (chatSession == null || chatSession.UserId != userId)
                {
                    return NotFound(new { message = "Conversation not found" });
                }

                var messages = await _context.Messages
                    .Where(m => m.ConversationId == conversationId)
                    .OrderBy(m => m.CreatedAt)
                    .Select(m => new
                    {
                        m.Id,
                        m.Content,
                        m.Role,
                        m.ServiceName,
                        m.CreatedAt
                    })
                    .ToListAsync();
                return Ok(messages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("conversations/{conversationId}/messages")]
        public async Task<IActionResult> SendMessageToConversation(string conversationId, [FromBody] SendMessageRequest request)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value;
                var conversation = await _conversationRepository.GetByIdForUpdateAsync(conversationId);
                
                if (conversation == null)
                {
                    return NotFound(new { message = "Conversation not found" });
                }

                // Verify ownership by checking the chat session
                var chatSession = await _chatSessionRepository.GetByIdForUpdateAsync(conversation.ChatSessionId);
                if (chatSession == null || chatSession.UserId != userId)
                {
                    return NotFound(new { message = "Conversation not found" });
                }

                // Save user message
                var userMessage = new Message
                {
                    ChatSessionId = conversation.ChatSessionId,
                    ConversationId = conversationId,
                    ServiceName = conversation.ServiceName,
                    Content = request.Message,
                    Role = "user"
                };
                await _messageRepository.CreateAsync(userMessage);

                // Get recent messages for context
                var recentMessages = conversation.Messages
                    .OrderBy(m => m.CreatedAt)
                    .TakeLast(15)
                    .ToList();

                // Update context summary
                await _contextService.UpdateContextSummaryAsync(conversation.ChatSessionId, recentMessages);

                // Get context summary for AI
                var contextSummary = await _contextService.GetContextSummaryAsync(conversation.ChatSessionId);

                // Get API key for the service
                var apiKey = await _apiKeyRepository.GetByUserAndServiceAsync(userId, conversation.ServiceName);
                string response;
                
                if (apiKey == null)
                {
                    response = $"I'm {conversation.ServiceName}, but I need an API key to respond. Please add your {conversation.ServiceName} API key in Settings to start chatting!";
                }
                else
                {
                    var plainTextKey = apiKey.EncryptedKey;
                    var aiService = GetAIService(conversation.ServiceName);
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
                    ChatSessionId = conversation.ChatSessionId,
                    ConversationId = conversationId,
                    ServiceName = conversation.ServiceName,
                    Content = response,
                    Role = "assistant"
                };
                await _messageRepository.CreateAsync(aiMessage);

                // Update conversation timestamp
                conversation.UpdatedAt = DateTime.UtcNow;
                await _conversationRepository.UpdateAsync(conversation);

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
                    aiMessage = new
                    {
                        aiMessage.Id,
                        aiMessage.Content,
                        aiMessage.Role,
                        aiMessage.ServiceName,
                        aiMessage.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("sessions/{sessionId}/broadcast")]
        public async Task<IActionResult> BroadcastMessage(string sessionId, [FromBody] BroadcastMessageRequest request)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value;
                var session = await _chatSessionRepository.GetByIdForUpdateAsync(sessionId);
                
                if (session == null || session.UserId != userId)
                {
                    return NotFound(new { message = "Chat session not found" });
                }

                var results = new List<object>();

                foreach (var serviceName in request.ServiceNames)
                {
                    try
                    {
                        // Find or create conversation for this service
                        var conversation = session.Conversations.FirstOrDefault(c => c.ServiceName == serviceName);
                        if (conversation == null)
                        {
                            conversation = new Conversation
                            {
                                ChatSessionId = sessionId,
                                Title = $"{serviceName} Chat",
                                ServiceName = serviceName
                            };
                            conversation = await _conversationRepository.CreateAsync(conversation);
                        }

                        // Send message to this conversation
                        var messageRequest = new SendMessageRequest
                        {
                            ServiceName = serviceName,
                            Message = request.Message
                        };

                        var result = await SendMessageToConversation(conversation.Id, messageRequest);
                        if (result is OkObjectResult okResult)
                        {
                            results.Add(new { serviceName, success = true, data = okResult.Value });
                        }
                        else
                        {
                            results.Add(new { serviceName, success = false, error = "Failed to send message" });
                        }
                    }
                    catch (Exception ex)
                    {
                        results.Add(new { serviceName, success = false, error = ex.Message });
                    }
                }

                return Ok(new { results });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }


        [HttpPut("conversations/{conversationId}")]
        public async Task<IActionResult> UpdateConversation(string conversationId, [FromBody] UpdateConversationRequest request)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value;
                var conversation = await _conversationRepository.GetByIdForUpdateAsync(conversationId);
                
                if (conversation == null)
                {
                    return NotFound(new { message = "Conversation not found" });
                }

                // Verify ownership by checking the chat session
                var chatSession = await _chatSessionRepository.GetByIdForUpdateAsync(conversation.ChatSessionId);
                if (chatSession == null || chatSession.UserId != userId)
                {
                    return NotFound(new { message = "Conversation not found" });
                }

                conversation.Title = request.Title;
                conversation.UpdatedAt = DateTime.UtcNow;

                await _conversationRepository.UpdateAsync(conversation);

                return Ok(new
                {
                    Id = conversation.Id,
                    Title = conversation.Title,
                    ServiceName = conversation.ServiceName,
                    CreatedAt = conversation.CreatedAt,
                    UpdatedAt = conversation.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("conversations/{conversationId}")]
        public async Task<IActionResult> DeleteConversation(string conversationId)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value;
                var conversation = await _conversationRepository.GetByIdForUpdateAsync(conversationId);
                
                if (conversation == null)
                {
                    return NotFound(new { message = "Conversation not found" });
                }

                // Verify ownership by checking the chat session
                var chatSession = await _chatSessionRepository.GetByIdForUpdateAsync(conversation.ChatSessionId);
                if (chatSession == null || chatSession.UserId != userId)
                {
                    return NotFound(new { message = "Conversation not found" });
                }

                await _conversationRepository.DeleteAsync(conversationId);

                return Ok(new { message = "Conversation deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class CreateChatSessionRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? ServiceName { get; set; }
    }

    public class CreateConversationRequest
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

    public class UpdateConversationRequest
    {
        public string Title { get; set; } = string.Empty;
    }
}
