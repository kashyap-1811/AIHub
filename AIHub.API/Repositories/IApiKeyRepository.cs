using AIHub.API.Models;

namespace AIHub.API.Repositories
{
    public interface IApiKeyRepository
    {
        Task<ApiKey?> GetByUserAndServiceAsync(string userId, string serviceName);
        Task<IEnumerable<ApiKey>> GetByUserIdAsync(string userId);
        Task<ApiKey> CreateAsync(ApiKey apiKey);
        Task<ApiKey> UpdateAsync(ApiKey apiKey);
        Task DeleteAsync(string id);
    }
}
