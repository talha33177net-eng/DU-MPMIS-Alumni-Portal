namespace AlumniPortal.API.DTOs.Misc;

// Donation DTOs
public class DonationRequest
{
    public string DonorName { get; set; } = string.Empty;
    public string? DonorEmail { get; set; }
    public string? DonorPhone { get; set; }
    public decimal Amount { get; set; }
    public string? Message { get; set; }
    public string PaymentMethod { get; set; } = "Manual";
    public string? TransactionId { get; set; }
}

public class DonationDto
{
    public int Id { get; set; }
    public string DonorName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "BDT";
    public string? Message { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime DonatedAt { get; set; }
}

// Career DTOs
public class CareerDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Organization { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? JobType { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Requirements { get; set; }
    public string? Salary { get; set; }
    public string? ApplyEmail { get; set; }
    public string? ApplyUrl { get; set; }
    public DateTime? Deadline { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateCareerRequest
{
    public string Title { get; set; } = string.Empty;
    public string Organization { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? JobType { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Requirements { get; set; }
    public string? Salary { get; set; }
    public string? ApplyEmail { get; set; }
    public string? ApplyUrl { get; set; }
    public DateTime? Deadline { get; set; }
    public bool IsPublished { get; set; } = true;
}

// Contact DTOs
public class ContactRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class ContactMessageDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime SubmittedAt { get; set; }
    public DateTime? ReadAt { get; set; }
}


// Alumni Needs DTOs
public class AlumniNeedDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ContactInfo { get; set; }
    public bool IsAnonymous { get; set; }
    public string? PostedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class CreateAlumniNeedRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "General";
    public string? ContactInfo { get; set; }
    public bool IsAnonymous { get; set; } = false;
    public DateTime? ExpiresAt { get; set; }
}

// Website Content DTOs
public class WebsiteContentDto
{
    public string? HeroTitle { get; set; }
    public string? HeroSubtitle { get; set; }
    public string? HeroBannerImage { get; set; }
    public string? HeroBannersJson { get; set; }
    public string? AboutTitle { get; set; }
    public string? AboutContent { get; set; }
    public string? AboutImage { get; set; }
    public string? MissionText { get; set; }
    public string? VisionText { get; set; }
    public string? HistoryContent { get; set; }
    public string? ConstitutionFileUrl { get; set; }
    public string? ConstitutionContent { get; set; }
    public string? FinanceReportsJson { get; set; }
    public string? AgmReportsJson { get; set; }
    public int? TotalMembers { get; set; }
    public int? TotalLifeMembers { get; set; }
    public int? TotalEvents { get; set; }
    public int? YearsActive { get; set; }
    public string? OfficeAddress { get; set; }
    public string? OfficePhone { get; set; }
    public string? OfficeEmail { get; set; }
    public string? SmtpSenderEmail { get; set; }
    public string? SmtpSenderAppPassword { get; set; }
    public string? FacebookUrl { get; set; }
    public string? YoutubeUrl { get; set; }
    public string? TwitterUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? LogoUrl { get; set; }
    public string? FaviconUrl { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
