namespace LifeOS.Domain;

public interface IWorkspaceService
{
    Task<DashboardSnapshot> GetDashboardAsync(CancellationToken cancellationToken = default);
    Task AddTaskAsync(string title, AreaKey area, int durationMinutes = 30, CancellationToken cancellationToken = default);
    Task ToggleTaskAsync(Guid taskId, CancellationToken cancellationToken = default);
    Task AddNoteAsync(string content, CancellationToken cancellationToken = default);
    Task ToggleRoutineAsync(Guid routineId, CancellationToken cancellationToken = default);
}
