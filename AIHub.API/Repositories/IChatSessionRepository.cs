using AIHub.API.Models;

namespace AIHub.API.Repositories
{
    public interface IChatSessionRepository
    {
        Task<ChatSession?> GetByIdAsync(int id);
        Task<IEnumerable<ChatSession>> GetByUserIdAsync(int userId);
        Task<ChatSession> CreateAsync(ChatSession chatSession);
        Task<ChatSession> UpdateAsync(ChatSession chatSession);
        Task DeleteAsync(int id);
    }
}
