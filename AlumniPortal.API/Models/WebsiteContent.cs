using System.ComponentModel.DataAnnotations;

namespace AlumniPortal.API.Models;

public class WebsiteContent
{
    public int Id { get; set; }

    // Hero / Banner
    public string? HeroTitle { get; set; }
    public string? HeroSubtitle { get; set; }
    public string? HeroBannerImage { get; set; }
    public string? HeroBannersJson { get; set; }

    // About
    public string? AboutTitle { get; set; }
    public string? AboutContent { get; set; }
    public string? AboutImage { get; set; }

    // Mission & Vision
    public string? MissionText { get; set; }
    public string? VisionText { get; set; }

    // History
    public string? HistoryContent { get; set; }

    // Constitution
    public string? ConstitutionFileUrl { get; set; }
    public string? ConstitutionContent { get; set; }

    // Finance / AGM Reports (JSON array of {year, fileUrl, title})
    public string? FinanceReportsJson { get; set; }
    public string? AgmReportsJson { get; set; }

    // Statistics
    public int? TotalMembers { get; set; }
    public int? TotalLifeMembers { get; set; }
    public int? TotalEvents { get; set; }
    public int? YearsActive { get; set; }

    // Contact Info
    public string? OfficeAddress { get; set; }
    public string? OfficePhone { get; set; }
    public string? OfficeEmail { get; set; }

    // SMTP Configuration
    public string? SmtpSenderEmail { get; set; }
    public string? SmtpSenderAppPassword { get; set; }

    // Social Media
    public string? FacebookUrl { get; set; }
    public string? YoutubeUrl { get; set; }
    public string? TwitterUrl { get; set; }
    public string? LinkedInUrl { get; set; }

    // SEO
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? LogoUrl { get; set; }
    public string? FaviconUrl { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
