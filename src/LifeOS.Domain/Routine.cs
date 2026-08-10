namespace LifeOS.Domain;

public sealed class Routine
{
    private Routine() { }

    public Routine(string name, string schedule)
    {
        Id = Guid.NewGuid();
        Name = string.IsNullOrWhiteSpace(name) ? throw new ArgumentException("Routine name is required.", nameof(name)) : name.Trim();
        Schedule = string.IsNullOrWhiteSpace(schedule) ? "Codziennie" : schedule.Trim();
    }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Schedule { get; private set; } = string.Empty;
    public bool IsCompletedToday { get; private set; }

    public void ToggleToday() => IsCompletedToday = !IsCompletedToday;
}
