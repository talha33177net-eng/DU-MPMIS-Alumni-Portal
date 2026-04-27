namespace AlumniPortal.API.DTOs.Gallery;

public class GalleryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string MediaUrl { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string MediaType { get; set; } = string.Empty;
    public string? Album { get; set; }
    public bool IsPublished { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateGalleryRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string MediaUrl { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string MediaType { get; set; } = "Photo";
    public string? Album { get; set; }
    public bool IsPublished { get; set; } = true;
    public int SortOrder { get; set; } = 0;
}
