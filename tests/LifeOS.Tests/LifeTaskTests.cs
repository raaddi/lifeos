using LifeOS.Domain;

namespace LifeOS.Tests;

public sealed class LifeTaskTests
{
    [Fact]
    public void ToggleCompletion_RecordsAndClearsCompletionTime()
    {
        var task = new LifeTask("Przygotować ofertę", AreaKey.Business, 45);

        task.ToggleCompletion();

        Assert.True(task.IsCompleted);
        Assert.NotNull(task.CompletedAt);

        task.ToggleCompletion();

        Assert.False(task.IsCompleted);
        Assert.Null(task.CompletedAt);
    }

    [Fact]
    public void Constructor_NormalizesDurationAndTitle()
    {
        var task = new LifeTask("  Zadanie dnia  ", AreaKey.Work, 2);

        Assert.Equal("Zadanie dnia", task.Title);
        Assert.Equal(5, task.DurationMinutes);
    }
}
