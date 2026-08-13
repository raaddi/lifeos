namespace LifeOS.Domain;

public sealed class ShoppingItem
{
    private ShoppingItem() { }

    public ShoppingItem(string name, ShoppingCategory category, string quantity = "1 szt.")
    {
        Id = Guid.NewGuid();
        Rename(name);
        Category = category;
        Quantity = string.IsNullOrWhiteSpace(quantity) ? "1 szt." : quantity.Trim();
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Quantity { get; private set; } = string.Empty;
    public ShoppingCategory Category { get; private set; }
    public bool IsPurchased { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? PurchasedAt { get; private set; }

    public void TogglePurchased()
    {
        IsPurchased = !IsPurchased;
        PurchasedAt = IsPurchased ? DateTimeOffset.UtcNow : null;
    }

    public void Rename(string name)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        Name = name.Trim();
    }
}
