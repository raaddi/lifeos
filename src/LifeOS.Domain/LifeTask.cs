namespace LifeOS.Domain;

public sealed class LifeTask
{
    private LifeTask() { }

    public LifeTask(string title, AreaKey area, int durationMinutes = 30)
    {
        Id = Guid.NewGuid();
        Rename(title);
        Area = area;
        DurationMinutes = Math.Clamp(durationMinutes, 5, 480);
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public AreaKey Area { get; private set; }
    public int DurationMinutes { get; private set; }
    public bool IsCompleted { get; private set; }
    public DateOnly? DueDate { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? CompletedAt { get; private set; }

    public void ToggleCompletion()
    {
        IsCompleted = !IsCompleted;
        CompletedAt = IsCompleted ? DateTimeOffset.UtcNow : null;
    }

    public void Rename(string title)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);
        Title = title.Trim();
    }

    public void Schedule(DateOnly? dueDate) => DueDate = dueDate;
}
