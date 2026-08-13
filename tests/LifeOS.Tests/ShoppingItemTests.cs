using LifeOS.Domain;

namespace LifeOS.Tests;

public sealed class ShoppingItemTests
{
    [Fact]
    public void Constructor_NormalizesNameAndDefaultQuantity()
    {
        var item = new ShoppingItem("  płatki owsiane  ", ShoppingCategory.Food, " ");

        Assert.Equal("płatki owsiane", item.Name);
        Assert.Equal("1 szt.", item.Quantity);
        Assert.False(item.IsPurchased);
    }

    [Fact]
    public void TogglePurchased_RecordsAndClearsPurchaseTime()
    {
        var item = new ShoppingItem("Magnez", ShoppingCategory.Supplements);

        item.TogglePurchased();
        Assert.True(item.IsPurchased);
        Assert.NotNull(item.PurchasedAt);

        item.TogglePurchased();
        Assert.False(item.IsPurchased);
        Assert.Null(item.PurchasedAt);
    }
}
