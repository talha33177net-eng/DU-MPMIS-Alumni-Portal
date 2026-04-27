namespace AlumniPortal.API.DTOs.Blogs;

public class BlogDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public string? CoverImage { get; set; }
    public string? AuthorName { get; set; }
    public string? AuthorPhoto { get; set; }
    public string? Category { get; set; }
    public string? Tags { get; set; }
    public int ViewCount { get; set; }
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public int? AuthorId { get; set; }
    public int Likes { get; set; }
    public int Comments { get; set; }
    public bool IsLiked { get; set; }
}

public class BlogDetailDto : BlogDto
{
    public string Content { get; set; } = string.Empty;
}

public class CreateBlogRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? CoverImage { get; set; }    // was missing
    public string? AuthorName { get; set; }
    public string? AuthorPhoto { get; set; }   // was missing
    public string? Category { get; set; }
    public string? Tags { get; set; }
    public bool IsPublished { get; set; } = false;
}

public class UpdateBlogRequest : CreateBlogRequest { }
