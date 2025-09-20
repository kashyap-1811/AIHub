using AIHub.API.Models;

namespace AIHub.API.Repositories
{
    public interface IMessageRepository
    {
        Task<IEnumerable<Message>> GetByChatSessionIdAsync(string chatSessionId);
        Task<Message> CreateAsync(Message message);
        Task<Message> UpdateAsync(Message message);
        Task DeleteAsync(string id);
    }
}
