using AIHub.API.Models;

namespace AIHub.API.Services
{
    public interface IContextService
    {
        Task<string> GetContextSummaryAsync(string chatSessionId);
        Task UpdateContextSummaryAsync(string chatSessionId, List<Message> recentMessages);
        string GenerateContextSummary(List<Message> messages);
    }
}
