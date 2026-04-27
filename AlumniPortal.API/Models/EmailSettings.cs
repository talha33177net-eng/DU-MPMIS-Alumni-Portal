namespace AlumniPortal.API.Models;

public class EmailSettings
{
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; }
    public string SmtpUser { get; set; } = string.Empty;
    public string SmtpPass { get; set; } = string.Empty;
    public string FromEmail { get; set; } = "noreply@MIST.com";
    public string FromName { get; set; } = "Alumni Portal Admin";
}
