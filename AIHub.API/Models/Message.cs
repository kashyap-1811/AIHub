using System.ComponentModel.DataAnnotations;

namespace AIHub.API.Models
{
    public class Message
    {
        [Key]
        [MaxLength(36)]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [MaxLength(36)]
        public string ChatSessionId { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string ServiceName { get; set; } = string.Empty; // ChatGPT, Gemini, Claude, DeepSeek
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = string.Empty; // user, assistant, system
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ChatSession ChatSession { get; set; } = null!;
    }
}
