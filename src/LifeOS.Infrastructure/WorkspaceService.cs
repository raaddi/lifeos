using LifeOS.Domain;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Infrastructure;

public sealed class WorkspaceService(IDbContextFactory<LifeOsDbContext> contextFactory) : IWorkspaceService
{
    public async Task<DashboardSnapshot> GetDashboardAsync(CancellationToken cancellationToken = default)
    {
        await using var database = await contextFactory.CreateDbContextAsync(cancellationToken);
        var tasks = await database.Tasks.OrderBy(task => task.IsCompleted).ThenBy(task => task.CreatedAt).ToListAsync(cancellationToken);
        var routines = await database.Routines.OrderBy(routine => routine.Name).ToListAsync(cancellationToken);
        var notes = await database.Notes.OrderByDescending(note => note.CreatedAt).Take(30).ToListAsync(cancellationToken);
        var areas = await database.Areas.OrderBy(area => area.Name).ToListAsync(cancellationToken);
        return new DashboardSnapshot(tasks, routines, notes, areas);
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
}
