using AIHub.API.Models;

namespace AIHub.API.Repositories
{
    public interface IConversationRepository
    {
        Task<Conversation?> GetByIdAsync(string id);
        Task<Conversation?> GetByIdForUpdateAsync(string id);
        Task<IEnumerable<Conversation>> GetByChatSessionIdAsync(string chatSessionId);
        Task<Conversation> CreateAsync(Conversation conversation);
        Task<Conversation> UpdateAsync(Conversation conversation);
        Task DeleteAsync(string id);
    }
}
