using Microsoft.EntityFrameworkCore;
using AIHub.API.Data;
using AIHub.API.Models;

namespace AIHub.API.Repositories
{
    public class MessageRepository : IMessageRepository
    {
        private readonly AIHubDbContext _context;

        public MessageRepository(AIHubDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Message>> GetByChatSessionIdAsync(string chatSessionId)
        {
            return await _context.Messages
                .Where(m => m.ChatSessionId == chatSessionId)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task<Message> CreateAsync(Message message)
        {
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
            return message;
        }

        public async Task<Message> UpdateAsync(Message message)
        {
            _context.Messages.Update(message);
            await _context.SaveChangesAsync();
            return message;
        }

        public async Task DeleteAsync(string id)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message != null)
            {
                _context.Messages.Remove(message);
                await _context.SaveChangesAsync();
            }
        }
    }
}
