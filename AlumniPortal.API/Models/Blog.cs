using System.ComponentModel.DataAnnotations;

namespace AlumniPortal.API.Models;

public class Blog
{
    public int Id { get; set; }

    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(350)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Excerpt { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    public string? CoverImage { get; set; }

    [MaxLength(150)]
    public string? AuthorName { get; set; }

    public string? AuthorPhoto { get; set; }

    public int? AuthorId { get; set; }
    public User? Author { get; set; }
    
    public int Likes { get; set; } = 0;

    [MaxLength(100)]
    public string? Category { get; set; }

    public string? Tags { get; set; } // comma-separated

    public bool IsPublished { get; set; } = false;
    public int ViewCount { get; set; } = 0;

    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
