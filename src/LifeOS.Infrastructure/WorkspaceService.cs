using LifeOS.Domain;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Infrastructure;

public sealed class WorkspaceService(IDbContextFactory<LifeOsDbContext> contextFactory) : IWorkspaceService
{
    public async Task<DashboardSnapshot> GetDashboardAsync(CancellationToken cancellationToken = default)
    {
        await using var database = await contextFactory.CreateDbContextAsync(cancellationToken);
        var tasks = (await database.Tasks.AsNoTracking().ToListAsync(cancellationToken))
            .OrderBy(task => task.IsCompleted)
            .ThenBy(task => task.CreatedAt)
            .ToList();
        var routines = await database.Routines.OrderBy(routine => routine.Name).ToListAsync(cancellationToken);
        var notes = (await database.Notes.AsNoTracking().ToListAsync(cancellationToken))
            .OrderByDescending(note => note.CreatedAt)
            .Take(30)
            .ToList();
        var shoppingItems = (await database.ShoppingItems.AsNoTracking().ToListAsync(cancellationToken))
            .OrderBy(item => item.IsPurchased)
            .ThenBy(item => item.Category)
            .ThenBy(item => item.CreatedAt)
            .ToList();
        var areas = await database.Areas.OrderBy(area => area.Name).ToListAsync(cancellationToken);
        return new DashboardSnapshot(tasks, routines, notes, shoppingItems, areas);
    }

    public async Task AddTaskAsync(string title, AreaKey area, int durationMinutes = 30, CancellationToken cancellationToken = default)
    {
        await using var database = await contextFactory.CreateDbContextAsync(cancellationToken);
        database.Tasks.Add(new LifeTask(title, area, durationMinutes));
        await database.SaveChangesAsync(cancellationToken);
    }

    public async Task ToggleTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        await using var database = await contextFactory.CreateDbContextAsync(cancellationToken);
        var task = await database.Tasks.FindAsync([taskId], cancellationToken) ?? throw new KeyNotFoundException("Task was not found.");
        task.ToggleCompletion();
        await database.SaveChangesAsync(cancellationToken);
    }

    public async Task AddNoteAsync(string content, CancellationToken cancellationToken = default)
    {
        await using var database = await contextFactory.CreateDbContextAsync(cancellationToken);
        database.Notes.Add(new Note(content));
        await database.SaveChangesAsync(cancellationToken);
    }

    public async Task ToggleRoutineAsync(Guid routineId, CancellationToken cancellationToken = default)
    {
        await using var database = await contextFactory.CreateDbContextAsync(cancellationToken);
        var routine = await database.Routines.FindAsync([routineId], cancellationToken) ?? throw new KeyNotFoundException("Routine was not found.");
        routine.ToggleToday();
        await database.SaveChangesAsync(cancellationToken);
    }

    public async Task AddShoppingItemAsync(string name, ShoppingCategory category, string quantity = "1 szt.", CancellationToken cancellationToken = default)
    {
        await using var database = await contextFactory.CreateDbContextAsync(cancellationToken);
        database.ShoppingItems.Add(new ShoppingItem(name, category, quantity));
        await database.SaveChangesAsync(cancellationToken);
    }

    public async Task ToggleShoppingItemAsync(Guid itemId, CancellationToken cancellationToken = default)
    {
        await using var database = await contextFactory.CreateDbContextAsync(cancellationToken);
        var item = await database.ShoppingItems.FindAsync([itemId], cancellationToken) ?? throw new KeyNotFoundException("Shopping item was not found.");
        item.TogglePurchased();
        await database.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveShoppingItemAsync(Guid itemId, CancellationToken cancellationToken = default)
    {
        await using var database = await contextFactory.CreateDbContextAsync(cancellationToken);
        var item = await database.ShoppingItems.FindAsync([itemId], cancellationToken) ?? throw new KeyNotFoundException("Shopping item was not found.");
        database.ShoppingItems.Remove(item);
        await database.SaveChangesAsync(cancellationToken);
    }

    public async Task ClearPurchasedShoppingItemsAsync(CancellationToken cancellationToken = default)
    {
        await using var database = await contextFactory.CreateDbContextAsync(cancellationToken);
        var purchased = await database.ShoppingItems.Where(item => item.IsPurchased).ToListAsync(cancellationToken);
        database.ShoppingItems.RemoveRange(purchased);
        await database.SaveChangesAsync(cancellationToken);
    }
}
