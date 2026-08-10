namespace LifeOS.Domain;

public sealed class LifeArea
{
    private LifeArea() { }

    public LifeArea(AreaKey key, string name, string objective, int score, string color)
    {
        Key = key;
        Name = name;
        Objective = objective;
        Score = Math.Clamp(score, 0, 100);
        Color = color;
    }

    public AreaKey Key { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Objective { get; private set; } = string.Empty;
    public int Score { get; private set; }
    public string Color { get; private set; } = "#3158d6";

    public void UpdateScore(int score) => Score = Math.Clamp(score, 0, 100);
}
