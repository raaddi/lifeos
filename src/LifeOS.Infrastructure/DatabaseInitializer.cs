using LifeOS.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace LifeOS.Infrastructure;

public static class DatabaseInitializer
{
    public static async Task InitializeLifeOsAsync(this IServiceProvider services, CancellationToken cancellationToken = default)
    {
        await using var scope = services.CreateAsyncScope();
        var factory = scope.ServiceProvider.GetRequiredService<IDbContextFactory<LifeOsDbContext>>();
        await using var database = await factory.CreateDbContextAsync(cancellationToken);
        await database.Database.EnsureCreatedAsync(cancellationToken);

        if (await database.Tasks.AnyAsync(cancellationToken)) return;

        database.Tasks.AddRange(
            new LifeTask("Ustalić najważniejszy wynik dnia", AreaKey.Work, 10),
            new LifeTask("Przygotować ofertę usługi dla klienta", AreaKey.Business, 50),
            new LifeTask("Sesja nauki bez rozpraszaczy", AreaKey.Learning, 45),
            new LifeTask("Trening lub szybki spacer", AreaKey.Health, 30));

        database.Routines.AddRange(
            new Routine("Poranny przegląd planu", "08:00"),
            new Routine("Ruch i regeneracja", "30 min"),
            new Routine("Zamknięcie dnia", "21:30"));

        database.Areas.AddRange(
            new LifeArea(AreaKey.Work, "Praca", "Dowozić wyniki bez przeciążenia.", 72, "#3158d6"),
            new LifeArea(AreaKey.Health, "Zdrowie", "Dbać o sen, ruch, dietę i energię.", 64, "#23856b"),
            new LifeArea(AreaKey.Business, "Biznes", "Rozwijać usługi i regularnie pozyskiwać klientów.", 46, "#c96b2d"),
            new LifeArea(AreaKey.Learning, "Nauka", "Kończyć studia i rozwijać kompetencje.", 58, "#7256b8"),
            new LifeArea(AreaKey.Finance, "Finanse", "Budować bezpieczeństwo i kontrolę nad przepływami.", 61, "#267c9b"),
            new LifeArea(AreaKey.Relations, "Relacje", "Dawać uwagę ludziom, którzy są ważni.", 69, "#a84f6d"),
            new LifeArea(AreaKey.Environment, "Otoczenie", "Utrzymywać porządek i dobre warunki do pracy.", 78, "#66776d"));

        await database.SaveChangesAsync(cancellationToken);
    }
}
