using Microsoft.EntityFrameworkCore;
using AIHub.API.Data;
using AIHub.API.Models;

namespace AIHub.API.Repositories
{
    public class ContextSummaryRepository : IContextSummaryRepository
    {
        private readonly AIHubDbContext _context;

        public ContextSummaryRepository(AIHubDbContext context)
        {
            _context = context;
        }

        public async Task<ContextSummary?> GetByChatSessionIdAsync(string chatSessionId)
        {
            return await _context.ContextSummaries
                .FirstOrDefaultAsync(cs => cs.ChatSessionId == chatSessionId);
        }

        public async Task<ContextSummary> CreateAsync(ContextSummary contextSummary)
        {
            _context.ContextSummaries.Add(contextSummary);
            await _context.SaveChangesAsync();
            return contextSummary;
        }

        public async Task<ContextSummary> UpdateAsync(ContextSummary contextSummary)
        {
            contextSummary.UpdatedAt = DateTime.UtcNow;
            _context.ContextSummaries.Update(contextSummary);
            await _context.SaveChangesAsync();
            return contextSummary;
        }

        public async Task DeleteAsync(string id)
        {
            var contextSummary = await _context.ContextSummaries.FindAsync(id);
            if (contextSummary != null)
            {
                _context.ContextSummaries.Remove(contextSummary);
                await _context.SaveChangesAsync();
            }
        }
    }
}
