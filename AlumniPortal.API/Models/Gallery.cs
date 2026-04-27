using System.ComponentModel.DataAnnotations;

namespace AlumniPortal.API.Models;

public class Gallery
{
    public int Id { get; set; }

    [Required, MaxLength(250)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    public string MediaUrl { get; set; } = string.Empty;

    public string? ThumbnailUrl { get; set; }

    public string MediaType { get; set; } = "Photo"; // Photo | Video

    [MaxLength(150)]
    public string? Album { get; set; }

    public bool IsPublished { get; set; } = true;
    public int SortOrder { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
