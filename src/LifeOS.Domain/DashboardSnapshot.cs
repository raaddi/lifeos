namespace LifeOS.Domain;

public sealed record DashboardSnapshot(
    IReadOnlyList<LifeTask> Tasks,
    IReadOnlyList<Routine> Routines,
    IReadOnlyList<Note> Notes,
    IReadOnlyList<LifeArea> Areas)
{
    public int CompletedTasks => Tasks.Count(task => task.IsCompleted);
    public int OpenTasks => Tasks.Count - CompletedTasks;
    public int TaskProgress => Tasks.Count == 0 ? 0 : (int)Math.Round(CompletedTasks * 100d / Tasks.Count);
    public int CompletedRoutines => Routines.Count(routine => routine.IsCompletedToday);
    public int Balance => Areas.Count == 0 ? 0 : (int)Math.Round(Areas.Average(area => area.Score));
}
