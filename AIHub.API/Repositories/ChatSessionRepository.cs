using Microsoft.EntityFrameworkCore;
using AIHub.API.Data;
using AIHub.API.Models;

namespace AIHub.API.Repositories
{
    public class ChatSessionRepository : IChatSessionRepository
    {
        private readonly AIHubDbContext _context;

        public ChatSessionRepository(AIHubDbContext context)
        {
            _context = context;
        }

        public async Task<ChatSession?> GetByIdAsync(string id)
        {
            return await _context.ChatSessions
                .Include(cs => cs.Messages)
                .FirstOrDefaultAsync(cs => cs.Id == id);
        }

        public async Task<ChatSession?> GetByIdForUpdateAsync(string id)
        {
            return await _context.ChatSessions
                .FirstOrDefaultAsync(cs => cs.Id == id);
        }

        public async Task<IEnumerable<ChatSession>> GetByUserIdAsync(string userId)
        {
            return await _context.ChatSessions
                .Where(cs => cs.UserId == userId)
                .OrderByDescending(cs => cs.UpdatedAt)
                .ToListAsync();
        }

        public async Task<ChatSession> CreateAsync(ChatSession chatSession)
        {
            _context.ChatSessions.Add(chatSession);
            await _context.SaveChangesAsync();
            return chatSession;
        }

        public async Task<ChatSession> UpdateAsync(ChatSession chatSession)
        {
            chatSession.UpdatedAt = DateTime.UtcNow;
            _context.ChatSessions.Update(chatSession);
            await _context.SaveChangesAsync();
            return chatSession;
        }

        public async Task DeleteAsync(string id)
        {
            var chatSession = await _context.ChatSessions.FindAsync(id);
            if (chatSession != null)
            {
                // Delete all conversations and their messages first
                var conversations = await _context.Conversations
                    .Where(c => c.ChatSessionId == id)
                    .ToListAsync();
                
                foreach (var conversation in conversations)
                {
                    // Delete all messages for this conversation
                    var messages = await _context.Messages
                        .Where(m => m.ConversationId == conversation.Id)
                        .ToListAsync();
                    _context.Messages.RemoveRange(messages);
                }
                
                // Delete all conversations
                _context.Conversations.RemoveRange(conversations);
                
                // Delete all messages directly associated with the chat session
                var sessionMessages = await _context.Messages
                    .Where(m => m.ChatSessionId == id)
                    .ToListAsync();
                _context.Messages.RemoveRange(sessionMessages);
                
                // Finally delete the chat session
                _context.ChatSessions.Remove(chatSession);
                await _context.SaveChangesAsync();
            }
        }
    }
}
