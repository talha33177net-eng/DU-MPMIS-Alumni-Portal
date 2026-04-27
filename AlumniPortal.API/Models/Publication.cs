using System.ComponentModel.DataAnnotations;

namespace AlumniPortal.API.Models;

public class Publication
{
    public int Id { get; set; }

    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    public string? Content { get; set; }

    public string? AttachmentUrl { get; set; }

    [Required, MaxLength(100)]
    public string Category { get; set; } = string.Empty; // AGM_Reports | Souvenirs | Finance_Reports

    public bool IsPublished { get; set; } = true;

    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
