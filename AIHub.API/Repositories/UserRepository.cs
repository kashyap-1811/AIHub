using Microsoft.EntityFrameworkCore;
using AIHub.API.Data;
using AIHub.API.Models;

namespace AIHub.API.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AIHubDbContext _context;

        public UserRepository(AIHubDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(string id)
        {
            return await _context.Users
                .Include(u => u.ApiKeys)
                .Include(u => u.ChatSessions)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _context.Users
                .Include(u => u.ApiKeys)
                .Include(u => u.ChatSessions)
                .FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.ApiKeys)
                .Include(u => u.ChatSessions)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByGoogleIdAsync(string googleId)
        {
            return await _context.Users
                .Include(u => u.ApiKeys)
                .Include(u => u.ChatSessions)
                .FirstOrDefaultAsync(u => u.GoogleId == googleId);
        }

        public async Task<User> CreateAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User> UpdateAsync(User user)
        {
            user.UpdatedAt = DateTime.UtcNow;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task DeleteAsync(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }
    }
}
