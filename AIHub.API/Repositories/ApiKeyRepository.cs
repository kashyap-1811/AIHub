using Microsoft.EntityFrameworkCore;
using AIHub.API.Data;
using AIHub.API.Models;

namespace AIHub.API.Repositories
{
    public class ApiKeyRepository : IApiKeyRepository
    {
        private readonly AIHubDbContext _context;

        public ApiKeyRepository(AIHubDbContext context)
        {
            _context = context;
        }

        public async Task<ApiKey?> GetByUserAndServiceAsync(int userId, string serviceName)
        {
            return await _context.ApiKeys
                .FirstOrDefaultAsync(ak => ak.UserId == userId && ak.ServiceName == serviceName);
        }

        public async Task<IEnumerable<ApiKey>> GetByUserIdAsync(int userId)
        {
            return await _context.ApiKeys
                .Where(ak => ak.UserId == userId)
                .ToListAsync();
        }

        public async Task<ApiKey> CreateAsync(ApiKey apiKey)
        {
            _context.ApiKeys.Add(apiKey);
            await _context.SaveChangesAsync();
            return apiKey;
        }

        public async Task<ApiKey> UpdateAsync(ApiKey apiKey)
        {
            apiKey.UpdatedAt = DateTime.UtcNow;
            _context.ApiKeys.Update(apiKey);
            await _context.SaveChangesAsync();
            return apiKey;
        }

        public async Task DeleteAsync(int id)
        {
            var apiKey = await _context.ApiKeys.FindAsync(id);
            if (apiKey != null)
            {
                _context.ApiKeys.Remove(apiKey);
                await _context.SaveChangesAsync();
            }
        }
    }
}
