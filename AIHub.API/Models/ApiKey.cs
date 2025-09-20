using System.ComponentModel.DataAnnotations;

namespace AIHub.API.Models
{
    public class ApiKey
    {
        [Key]
        [MaxLength(36)]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [MaxLength(36)]
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string ServiceName { get; set; } = string.Empty; // ChatGPT, Gemini, Claude, DeepSeek
        
        [Required]
        public string EncryptedKey { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
    }
}
