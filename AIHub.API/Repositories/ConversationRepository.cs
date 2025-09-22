using Microsoft.EntityFrameworkCore;
using AIHub.API.Data;
using AIHub.API.Models;

namespace AIHub.API.Repositories
{
    public class ConversationRepository : IConversationRepository
    {
        private readonly AIHubDbContext _context;

        public ConversationRepository(AIHubDbContext context)
        {
            _context = context;
        }

        public async Task<Conversation?> GetByIdAsync(string id)
        {
            return await _context.Conversations
                .Include(c => c.Messages)
                .Include(c => c.ChatSession)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Conversation?> GetByIdForUpdateAsync(string id)
        {
            return await _context.Conversations
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<IEnumerable<Conversation>> GetByChatSessionIdAsync(string chatSessionId)
        {
            return await _context.Conversations
                .Where(c => c.ChatSessionId == chatSessionId)
                .OrderByDescending(c => c.UpdatedAt)
                .ToListAsync();
        }

        public async Task<Conversation> CreateAsync(Conversation conversation)
        {
            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();
            return conversation;
        }

        public async Task<Conversation> UpdateAsync(Conversation conversation)
        {
            conversation.UpdatedAt = DateTime.UtcNow;
            _context.Conversations.Update(conversation);
            await _context.SaveChangesAsync();
            return conversation;
        }

        public async Task DeleteAsync(string id)
        {
            var conversation = await _context.Conversations.FindAsync(id);
            if (conversation != null)
            {
                _context.Conversations.Remove(conversation);
                await _context.SaveChangesAsync();
            }
        }
    }
}
