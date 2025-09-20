using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AIHub.API.Services;
using AIHub.API.Models;

namespace AIHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var user = await _authService.RegisterAsync(request.Username, request.Email, request.Password);
                if (user == null)
                {
                    return BadRequest(new { message = "Username or email already exists" });
                }

                var token = _authService.GenerateJwtToken(user);
                return Ok(new { token, user = new { user.Id, user.Username, user.Email } });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _authService.LoginAsync(request.Username, request.Password);
                if (user == null)
                {
                    return Unauthorized(new { message = "Invalid credentials" });
                }

                var token = _authService.GenerateJwtToken(user);
                return Ok(new { token, user = new { user.Id, user.Username, user.Email } });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthRequest request)
        {
            try
            {
                var user = await _authService.GetOrCreateGoogleUserAsync(request.GoogleId, request.Email, request.Name);
                if (user == null)
                {
                    return BadRequest(new { message = "Failed to authenticate with Google" });
                }

                var token = _authService.GenerateJwtToken(user);
                return Ok(new { token, user = new { user.Id, user.Username, user.Email } });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public IActionResult GetCurrentUser()
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value;
                var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)!.Value;
                var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)!.Value;
                
                return Ok(new { 
                    user = new { 
                        id = userId, 
                        username = username, 
                        email = email 
                    } 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class GoogleAuthRequest
    {
        public string GoogleId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
