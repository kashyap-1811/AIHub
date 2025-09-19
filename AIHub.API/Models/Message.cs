using System.ComponentModel.DataAnnotations;

namespace AIHub.API.Models
{
    public class Message
    {
        public int Id { get; set; }
        
        [Required]
        public int ChatSessionId { get; set; }
        
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
