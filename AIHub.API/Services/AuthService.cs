using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;
using AIHub.API.Models;
using AIHub.API.Repositories;

namespace AIHub.API.Services
{
    public class AuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<User?> RegisterAsync(string username, string email, string password)
        {
            // Check if user already exists
            if (await _userRepository.GetByUsernameAsync(username) != null ||
                await _userRepository.GetByEmailAsync(email) != null)
            {
                return null;
            }

            var user = new User
            {
                Username = username,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
            };

            return await _userRepository.CreateAsync(user);
        }

        public async Task<User?> LoginAsync(string username, string password)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                return null;
            }

            return user;
        }

        public async Task<User?> GetOrCreateGoogleUserAsync(string googleId, string email, string name)
        {
            var user = await _userRepository.GetByGoogleIdAsync(googleId);
            if (user != null)
            {
                return user;
            }

            // Check if user exists with this email
            user = await _userRepository.GetByEmailAsync(email);
            if (user != null)
            {
                // Update existing user with Google ID
                user.GoogleId = googleId;
                user.GoogleEmail = email;
                return await _userRepository.UpdateAsync(user);
            }

            // Create new user
            user = new User
            {
                Username = name.Replace(" ", "").ToLower() + DateTime.UtcNow.Ticks,
                Email = email,
                GoogleId = googleId,
                GoogleEmail = email,
                PasswordHash = "" // No password for Google users
            };

            return await _userRepository.CreateAsync(user);
        }

        public string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
