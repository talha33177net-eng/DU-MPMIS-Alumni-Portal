using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AlumniPortal.API.Data;
using AlumniPortal.API.DTOs.Common;
using AlumniPortal.API.DTOs.Misc;
using AlumniPortal.API.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/website-content")]
public class WebsiteContentController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public WebsiteContentController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var content = await _db.WebsiteContents.FirstOrDefaultAsync();
        if (content == null) return NotFound(ApiResponse.Fail("Content not found."));
        
        var dto = MapToDto(content);
        
        // Auto-calculate structural system stats so the UI can render them automatically
        dto.TotalMembers = await _db.Users.CountAsync();
        dto.TotalEvents = await _db.Events.CountAsync();
        dto.TotalLifeMembers = await _db.Careers.CountAsync();
        
        return Ok(ApiResponse<WebsiteContentDto>.Ok(dto));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Update([FromBody] WebsiteContentDto req)
    {
        var content = await _db.WebsiteContents.FirstOrDefaultAsync();
        if (content == null)
        {
            content = new WebsiteContent();
            _db.WebsiteContents.Add(content);
        }
        content.HeroTitle = req.HeroTitle; content.HeroSubtitle = req.HeroSubtitle;
        content.HeroBannerImage = req.HeroBannerImage; content.HeroBannersJson = req.HeroBannersJson;
        content.AboutTitle = req.AboutTitle; content.AboutContent = req.AboutContent;
        content.AboutImage = req.AboutImage;
        content.MissionText = req.MissionText; content.VisionText = req.VisionText;
        content.HistoryContent = req.HistoryContent;
        content.ConstitutionFileUrl = req.ConstitutionFileUrl; content.ConstitutionContent = req.ConstitutionContent;
        content.FinanceReportsJson = req.FinanceReportsJson;
        content.AgmReportsJson = req.AgmReportsJson;
        content.TotalMembers = req.TotalMembers; content.TotalLifeMembers = req.TotalLifeMembers;
        content.TotalEvents = req.TotalEvents; content.YearsActive = req.YearsActive;
        content.OfficeAddress = req.OfficeAddress; content.OfficePhone = req.OfficePhone;
        content.OfficeEmail = req.OfficeEmail;
        content.SmtpSenderEmail = req.SmtpSenderEmail; content.SmtpSenderAppPassword = req.SmtpSenderAppPassword;
        content.FacebookUrl = req.FacebookUrl; content.YoutubeUrl = req.YoutubeUrl;
        content.TwitterUrl = req.TwitterUrl; content.LinkedInUrl = req.LinkedInUrl;
        content.MetaTitle = req.MetaTitle; content.MetaDescription = req.MetaDescription;
        content.LogoUrl = req.LogoUrl; content.FaviconUrl = req.FaviconUrl;
        content.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Website content updated."));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile(IFormFile file, [FromQuery] string purpose = "general")
    {
        if (file == null || file.Length == 0) return BadRequest(ApiResponse.Fail("No file provided."));
        var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", purpose);
        var resultUrl = await AlumniPortal.API.Helpers.ImageOptimizationHelper.ProcessAndSaveFileAsync(file, uploadPath, $"/uploads/{purpose}");
        return Ok(ApiResponse<string>.Ok(resultUrl, "File uploaded."));
    }

    private static WebsiteContentDto MapToDto(WebsiteContent c) => new()
    {
        HeroTitle = c.HeroTitle, HeroSubtitle = c.HeroSubtitle, HeroBannerImage = c.HeroBannerImage,
        HeroBannersJson = c.HeroBannersJson, AboutTitle = c.AboutTitle, AboutContent = c.AboutContent, AboutImage = c.AboutImage,
        MissionText = c.MissionText, VisionText = c.VisionText, HistoryContent = c.HistoryContent,
        ConstitutionFileUrl = c.ConstitutionFileUrl, ConstitutionContent = c.ConstitutionContent, FinanceReportsJson = c.FinanceReportsJson,
        AgmReportsJson = c.AgmReportsJson, TotalMembers = c.TotalMembers, TotalLifeMembers = c.TotalLifeMembers,
        TotalEvents = c.TotalEvents, YearsActive = c.YearsActive,
        OfficeAddress = c.OfficeAddress, OfficePhone = c.OfficePhone, OfficeEmail = c.OfficeEmail,
        SmtpSenderEmail = c.SmtpSenderEmail, SmtpSenderAppPassword = c.SmtpSenderAppPassword,
        FacebookUrl = c.FacebookUrl, YoutubeUrl = c.YoutubeUrl, TwitterUrl = c.TwitterUrl, LinkedInUrl = c.LinkedInUrl,
        MetaTitle = c.MetaTitle, MetaDescription = c.MetaDescription, LogoUrl = c.LogoUrl, FaviconUrl = c.FaviconUrl,
        UpdatedAt = c.UpdatedAt
    };

    [Authorize(Roles = "Admin")]
    [HttpPost("optimize-legacy-images")]
    public async Task<IActionResult> OptimizeLegacyImages()
    {
        int convertedCount = 0;
        var wwwroot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

        async Task<string> ConvertToWebP(string relativePath)
        {
            if (string.IsNullOrEmpty(relativePath) || relativePath.EndsWith(".webp") || relativePath.EndsWith(".svg")) return relativePath;
            var path = relativePath.TrimStart('/');
            var absolutePath = Path.Combine(wwwroot, path);
            if (!System.IO.File.Exists(absolutePath)) return relativePath;

            var ext = Path.GetExtension(absolutePath).ToLower();
            if (ext != ".jpg" && ext != ".jpeg" && ext != ".png") return relativePath;

            var newRelativePath = relativePath.Substring(0, relativePath.LastIndexOf('.')) + ".webp";
            var newAbsolutePath = Path.Combine(wwwroot, newRelativePath.TrimStart('/'));

            try
            {
                using var image = await SixLabors.ImageSharp.Image.LoadAsync(absolutePath);
                await image.SaveAsWebpAsync(newAbsolutePath, new SixLabors.ImageSharp.Formats.Webp.WebpEncoder { Quality = 80 });
                System.IO.File.Delete(absolutePath);
                convertedCount++;
                return newRelativePath;
            }
            catch { return relativePath; }
        }

        var users = await _db.Users.ToListAsync();
        foreach (var u in users) { if (!string.IsNullOrEmpty(u.ProfilePhoto)) u.ProfilePhoto = await ConvertToWebP(u.ProfilePhoto); }

        var blogs = await _db.Blogs.ToListAsync();
        foreach (var b in blogs) { if (!string.IsNullOrEmpty(b.CoverImage)) b.CoverImage = await ConvertToWebP(b.CoverImage); }

        var committee = await _db.CommitteeMembers.ToListAsync();
        foreach (var c in committee) { if (!string.IsNullOrEmpty(c.Photo)) c.Photo = await ConvertToWebP(c.Photo); }

        var gallery = await _db.Galleries.ToListAsync();
        foreach (var g in gallery) 
        { 
            if (!string.IsNullOrEmpty(g.MediaUrl)) g.MediaUrl = await ConvertToWebP(g.MediaUrl); 
            if (!string.IsNullOrEmpty(g.ThumbnailUrl)) g.ThumbnailUrl = await ConvertToWebP(g.ThumbnailUrl);
        }

        var wc = await _db.WebsiteContents.FirstOrDefaultAsync();
        if (wc != null)
        {
            if (!string.IsNullOrEmpty(wc.HeroBannerImage)) wc.HeroBannerImage = await ConvertToWebP(wc.HeroBannerImage);
            if (!string.IsNullOrEmpty(wc.AboutImage)) wc.AboutImage = await ConvertToWebP(wc.AboutImage);
            if (!string.IsNullOrEmpty(wc.LogoUrl)) wc.LogoUrl = await ConvertToWebP(wc.LogoUrl);
            if (!string.IsNullOrEmpty(wc.FaviconUrl)) wc.FaviconUrl = await ConvertToWebP(wc.FaviconUrl);
        }

        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok($"Legacy sweep complete! Successfully compressed, converted, and re-linked {convertedCount} existing images into ultra-lightweight WebP format."));
    }
}
