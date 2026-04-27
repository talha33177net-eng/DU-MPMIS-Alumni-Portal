using System.Text.RegularExpressions;

namespace AlumniPortal.API.Helpers;

public static class SlugHelper
{
    public static string GenerateSlug(string title)
    {
        var slug = title.ToLowerInvariant();
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-+", "-");
        slug = slug.Trim('-');
        return slug;
    }

    public static string GenerateUniqueSlug(string title, Func<string, bool> slugExists)
    {
        var baseSlug = GenerateSlug(title);
        var slug = baseSlug;
        var counter = 1;
        while (slugExists(slug))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }
        return slug;
    }
}
