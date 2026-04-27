using Microsoft.EntityFrameworkCore;
using AlumniPortal.API.Models;

namespace AlumniPortal.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Member> Members { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<EventRegistration> EventRegistrations { get; set; }
    public DbSet<Blog> Blogs { get; set; }
    public DbSet<Gallery> Galleries { get; set; }
    public DbSet<Election> Elections { get; set; }
    public DbSet<Candidate> Candidates { get; set; }
    public DbSet<Notice> Notices { get; set; }
    public DbSet<Publication> Publications { get; set; }
    public DbSet<CommitteeMember> CommitteeMembers { get; set; }
    public DbSet<Donation> Donations { get; set; }
    public DbSet<Career> Careers { get; set; }
    public DbSet<ContactMessage> ContactMessages { get; set; }
    public DbSet<AlumniNeed> AlumniNeeds { get; set; }
    public DbSet<WebsiteContent> WebsiteContents { get; set; }

    // New DbSets from ExtendedModels
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<MembershipPlan> MembershipPlans { get; set; }
    public DbSet<MembershipApplication> MembershipApplications { get; set; }
    public DbSet<EventComponent> EventComponents { get; set; }
    public DbSet<EventTicket> EventTickets { get; set; }
    public DbSet<CareerApplication> CareerApplications { get; set; }
    public DbSet<BlogCategory> BlogCategories { get; set; }
    public DbSet<BlogComment> BlogComments { get; set; }
    public DbSet<BlogLike> BlogLikes { get; set; }
    public DbSet<Position> Positions { get; set; }
    public DbSet<CommitteeApplication> CommitteeApplications { get; set; }
    public DbSet<PublicPage> PublicPages { get; set; }
    public DbSet<InMemoriam> InMemoriams { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<Message> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasDefaultValue("Member");
        });

        // Member
        modelBuilder.Entity<Member>(e =>
        {
            e.HasIndex(m => m.MemberType);
        });

        // Event
        modelBuilder.Entity<Event>(e =>
        {
            e.Property(ev => ev.RegistrationFee).HasPrecision(18, 2);
        });

        // Blog
        modelBuilder.Entity<Blog>(e =>
        {
            e.HasIndex(b => b.Slug).IsUnique();
        });

        // EventRegistration
        modelBuilder.Entity<EventRegistration>(e =>
        {
            e.HasOne(er => er.Event)
             .WithMany(ev => ev.Registrations)
             .HasForeignKey(er => er.EventId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(er => er.User)
             .WithMany(u => u.EventRegistrations)
             .HasForeignKey(er => er.UserId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // Candidate → Election
        modelBuilder.Entity<Candidate>(e =>
        {
            e.HasOne(c => c.Election)
             .WithMany(el => el.Candidates)
             .HasForeignKey(c => c.ElectionId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Donation → User
        modelBuilder.Entity<Donation>(e =>
        {
            e.HasOne(d => d.User)
             .WithMany(u => u.Donations)
             .HasForeignKey(d => d.UserId)
             .OnDelete(DeleteBehavior.SetNull);

            e.Property(d => d.Amount).HasPrecision(18, 2);
            e.Property(d => d.Currency).HasDefaultValue("BDT");
        });

        // Candidate nomination fee
        modelBuilder.Entity<Candidate>(e =>
        {
            e.Property(c => c.NominationFee).HasPrecision(18, 2);
        });

        // AlumniNeed → User
        modelBuilder.Entity<AlumniNeed>(e =>
        {
            e.HasOne(a => a.User)
             .WithMany(u => u.AlumniNeeds)
             .HasForeignKey(a => a.UserId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // WebsiteContent — only ever one row
        modelBuilder.Entity<WebsiteContent>(e =>
        {
            e.HasData(new WebsiteContent
            {
                Id = 1,
                HeroTitle = "DU Mass Communication & Journalism Alumni Association",
                HeroSubtitle = "Connecting Alumni, Building Community",
                AboutTitle = "About MIST",
                AboutContent = "The Alumni Association of the Department of Mass Communication and Journalism, University of Dhaka.",
                MissionText = "To foster a strong network among alumni.",
                VisionText = "To be the leading alumni association in Bangladesh.",
                OfficeAddress = "Department of Mass Communication and Journalism, University of Dhaka",
                OfficeEmail = "info@MIST.com",
                UpdatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            });
        });

        // New Extended Model Configurations
        
        // Transaction relationships
        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // MembershipApplication relationships
        modelBuilder.Entity<MembershipApplication>()
            .HasOne(ma => ma.User)
            .WithMany()
            .HasForeignKey(ma => ma.UserId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<MembershipApplication>()
            .HasOne(ma => ma.Transaction)
            .WithMany()
            .HasForeignKey(ma => ma.TransactionId)
            .OnDelete(DeleteBehavior.SetNull);

        // EventComponent relationships
        modelBuilder.Entity<EventComponent>()
            .HasOne(ec => ec.Event)
            .WithMany()
            .HasForeignKey(ec => ec.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        // EventTicket relationships
        modelBuilder.Entity<EventTicket>()
            .HasOne(et => et.EventRegistration)
            .WithMany()
            .HasForeignKey(et => et.EventRegistrationId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<EventTicket>()
            .HasOne(et => et.Transaction)
            .WithMany()
            .HasForeignKey(et => et.TransactionId)
            .OnDelete(DeleteBehavior.SetNull);

        // CareerApplication relationships
        modelBuilder.Entity<CareerApplication>()
            .HasOne(ca => ca.Career)
            .WithMany()
            .HasForeignKey(ca => ca.CareerId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<CareerApplication>()
            .HasOne(ca => ca.User)
            .WithMany()
            .HasForeignKey(ca => ca.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Blog relationships
        modelBuilder.Entity<Blog>()
            .HasOne<BlogCategory>()
            .WithMany(bc => bc.Blogs)
            .HasForeignKey("BlogCategoryId")
            .OnDelete(DeleteBehavior.SetNull);
            
        modelBuilder.Entity<Blog>()
            .HasOne(b => b.Author)
            .WithMany()
            .HasForeignKey(b => b.AuthorId)
            .OnDelete(DeleteBehavior.SetNull);

        // BlogLike relationships
        modelBuilder.Entity<BlogLike>()
            .HasOne(bl => bl.Blog)
            .WithMany()
            .HasForeignKey(bl => bl.BlogId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<BlogLike>()
            .HasOne(bl => bl.User)
            .WithMany()
            .HasForeignKey(bl => bl.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // BlogComment relationships
        modelBuilder.Entity<BlogComment>()
            .HasOne(bc => bc.Blog)
            .WithMany()
            .HasForeignKey(bc => bc.BlogId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<BlogComment>()
            .HasOne(bc => bc.User)
            .WithMany()
            .HasForeignKey(bc => bc.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // CommitteeApplication relationships
        modelBuilder.Entity<CommitteeApplication>()
            .HasOne(ca => ca.Election)
            .WithMany()
            .HasForeignKey(ca => ca.ElectionId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<CommitteeApplication>()
            .HasOne(ca => ca.User)
            .WithMany()
            .HasForeignKey(ca => ca.UserId)
            .OnDelete(DeleteBehavior.Restrict);
            
        modelBuilder.Entity<CommitteeApplication>()
            .HasOne(ca => ca.Position)
            .WithMany()
            .HasForeignKey(ca => ca.PositionId)
            .OnDelete(DeleteBehavior.Restrict);
            
        modelBuilder.Entity<CommitteeApplication>()
            .HasOne(ca => ca.Transaction)
            .WithMany()
            .HasForeignKey(ca => ca.TransactionId)
            .OnDelete(DeleteBehavior.SetNull);

        // PublicPage relationships
        modelBuilder.Entity<PublicPage>()
            .HasIndex(p => p.Slug)
            .IsUnique();

        // Message relationships
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany()
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);
            
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Receiver)
            .WithMany()
            .HasForeignKey(m => m.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

    }
}
