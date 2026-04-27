namespace AlumniPortal.API.DTOs.Notices;

public class NoticeDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
    public string? Category { get; set; }
    public bool IsPinned { get; set; }
    public DateTime PublishedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class CreateNoticeRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }  // file URL after upload
    public string? Category { get; set; }
    public bool IsPinned { get; set; } = false;
    public bool IsPublished { get; set; } = true;
    public DateTime? ExpiresAt { get; set; }
}

public class CommitteeMemberDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string? Photo { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Batch { get; set; }
    public string? CurrentDesignation { get; set; }
    public string? CurrentOrganization { get; set; }
    public string? FacebookUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? CommitteeYear { get; set; }
    public int SortOrder { get; set; }
}

public class CreateCommitteeMemberRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Batch { get; set; }
    public string? CurrentDesignation { get; set; }
    public string? CurrentOrganization { get; set; }
    public string? FacebookUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? CommitteeYear { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;  // allows deactivating without deleting
}
