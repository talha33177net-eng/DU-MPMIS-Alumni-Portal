using System.Net;
using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using AlumniPortal.API.Data;

namespace AlumniPortal.API.Services;

public class EmailService : IEmailService
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<EmailService> _logger;

    public EmailService(ApplicationDbContext db, ILogger<EmailService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        try
        {
            var config = await _db.WebsiteContents.FirstOrDefaultAsync();
            if (config == null || string.IsNullOrEmpty(config.SmtpSenderEmail) || string.IsNullOrEmpty(config.SmtpSenderAppPassword))
            {
                _logger.LogWarning("SMTP Configuration missing in the WebsiteContents database. Falling back to console logging.");
                _logger.LogInformation($"[Simulation] To: {toEmail} | Subject: {subject}");
                return;
            }

            using var smtpClient = new SmtpClient("smtp.gmail.com", 587)
            {
                Credentials = new NetworkCredential(config.SmtpSenderEmail, config.SmtpSenderAppPassword),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(config.SmtpSenderEmail, "MIST Alumni Admin"),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);

            await smtpClient.SendMailAsync(mailMessage);
            _logger.LogInformation($"Email sent successfully to {toEmail} via configured database SMTP.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning($"Failed to send email to {toEmail}. Reason: {ex.Message}");
        }
    }
}
