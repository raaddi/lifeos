using LifeOS.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace LifeOS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddLifeOsInfrastructure(this IServiceCollection services, string connectionString)
    {
        services.AddPooledDbContextFactory<LifeOsDbContext>(options => options.UseSqlite(connectionString));
        services.AddScoped<IWorkspaceService, WorkspaceService>();
        return services;
    }
}
