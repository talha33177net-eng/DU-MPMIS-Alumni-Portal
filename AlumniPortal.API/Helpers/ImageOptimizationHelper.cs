using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

namespace AlumniPortal.API.Helpers;

public static class ImageOptimizationHelper
{
    /// <summary>
    /// Processes an uploaded file. If it is a raster image, it compresses and converts it to WebP.
    /// Otherwise, it performs a standard file copy.
    /// </summary>
    public static async Task<string> ProcessAndSaveFileAsync(IFormFile file, string uploadFolder, string urlPrefix)
    {
        Directory.CreateDirectory(uploadFolder);
        
        bool isImage = !string.IsNullOrEmpty(file.ContentType) && file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase) && !file.ContentType.Contains("svg", StringComparison.OrdinalIgnoreCase);
        
        if (isImage)
        {
            var fileName = $"{Guid.NewGuid()}.webp";
            var filePath = Path.Combine(uploadFolder, fileName);
            
            using var stream = file.OpenReadStream();
            using var image = await Image.LoadAsync(stream);
            
            // Convert to WEBP with highly efficient 80% quality compression configuration
            await image.SaveAsWebpAsync(filePath, new WebpEncoder { Quality = 80 });
            
            return $"{urlPrefix.TrimEnd('/')}/{fileName}";
        }
        else
        {
            // Standard fallback for PDFs or non-raster files
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadFolder, fileName);
            
            await using var stream = File.Create(filePath);
            await file.CopyToAsync(stream);
            
            return $"{urlPrefix.TrimEnd('/')}/{fileName}";
        }
    }
}
