using AIHub.API.Models;

namespace AIHub.API.Repositories
{
    public interface IChatSessionRepository
    {
        Task<ChatSession?> GetByIdAsync(string id);
        Task<IEnumerable<ChatSession>> GetByUserIdAsync(string userId);
        Task<ChatSession> CreateAsync(ChatSession chatSession);
        Task<ChatSession> UpdateAsync(ChatSession chatSession);
        Task DeleteAsync(string id);
    }
}
