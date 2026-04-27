using AlumniPortal.API.DTOs.Common;
using Microsoft.EntityFrameworkCore;

namespace AlumniPortal.API.Helpers;

public static class PaginationHelper
{
    public static async Task<PaginatedResponse<T>> PaginateAsync<T>(
        IQueryable<T> query,
        int page,
        int perPage)
    {
        page = Math.Max(1, page);
        perPage = Math.Clamp(perPage, 1, 100);

        var total = await query.CountAsync();
        var data = await query.Skip((page - 1) * perPage).Take(perPage).ToListAsync();

        return new PaginatedResponse<T>
        {
            Data = data,
            CurrentPage = page,
            PerPage = perPage,
            Total = total
        };
    }
}
