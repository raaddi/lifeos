namespace LifeOS.Domain;

public sealed class Note
{
    private Note() { }

    public Note(string content)
    {
        Id = Guid.NewGuid();
        Content = string.IsNullOrWhiteSpace(content) ? throw new ArgumentException("Note content is required.", nameof(content)) : content.Trim();
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }
    public string Content { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }
}
