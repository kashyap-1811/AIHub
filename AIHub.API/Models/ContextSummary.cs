using System.ComponentModel.DataAnnotations;

namespace AIHub.API.Models
{
    public class ContextSummary
    {
        [Key]
        [MaxLength(36)]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [MaxLength(36)]
        public string ChatSessionId { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string Summary { get; set; } = string.Empty;
        
        [Required]
        public int MessageCount { get; set; } = 0;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ChatSession ChatSession { get; set; } = null!;
    }
}
