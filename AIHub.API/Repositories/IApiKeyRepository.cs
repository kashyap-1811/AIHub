using AIHub.API.Models;

namespace AIHub.API.Repositories
{
    public interface IApiKeyRepository
    {
        Task<ApiKey?> GetByUserAndServiceAsync(int userId, string serviceName);
        Task<IEnumerable<ApiKey>> GetByUserIdAsync(int userId);
        Task<ApiKey> CreateAsync(ApiKey apiKey);
        Task<ApiKey> UpdateAsync(ApiKey apiKey);
        Task DeleteAsync(int id);
    }
}
