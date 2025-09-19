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

        public async Task<ChatSession?> GetByIdAsync(int id)
        {
            return await _context.ChatSessions
                .Include(cs => cs.Messages)
                .FirstOrDefaultAsync(cs => cs.Id == id);
        }

        public async Task<IEnumerable<ChatSession>> GetByUserIdAsync(int userId)
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

        public async Task DeleteAsync(int id)
        {
            var chatSession = await _context.ChatSessions.FindAsync(id);
            if (chatSession != null)
            {
                _context.ChatSessions.Remove(chatSession);
                await _context.SaveChangesAsync();
            }
        }
    }
}
