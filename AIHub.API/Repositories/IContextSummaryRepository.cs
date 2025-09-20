using AIHub.API.Models;

namespace AIHub.API.Repositories
{
    public interface IContextSummaryRepository
    {
        Task<ContextSummary?> GetByChatSessionIdAsync(string chatSessionId);
        Task<ContextSummary> CreateAsync(ContextSummary contextSummary);
        Task<ContextSummary> UpdateAsync(ContextSummary contextSummary);
        Task DeleteAsync(string id);
    }
}
