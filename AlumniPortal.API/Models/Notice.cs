using System.ComponentModel.DataAnnotations;

namespace AlumniPortal.API.Models;

public class Notice
{
    public int Id { get; set; }

    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    public string? AttachmentUrl { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; } // General | Election | Finance | AGM

    public bool IsPublished { get; set; } = true;
    public bool IsPinned { get; set; } = false;
    public int SortOrder { get; set; } = 0;

    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
