namespace LifeOS.Domain;

public interface IWorkspaceService
{
    Task<DashboardSnapshot> GetDashboardAsync(CancellationToken cancellationToken = default);
    Task AddTaskAsync(string title, AreaKey area, int durationMinutes = 30, CancellationToken cancellationToken = default);
    Task ToggleTaskAsync(Guid taskId, CancellationToken cancellationToken = default);
    Task AddNoteAsync(string content, CancellationToken cancellationToken = default);
    Task ToggleRoutineAsync(Guid routineId, CancellationToken cancellationToken = default);
    Task AddShoppingItemAsync(string name, ShoppingCategory category, string quantity = "1 szt.", CancellationToken cancellationToken = default);
    Task ToggleShoppingItemAsync(Guid itemId, CancellationToken cancellationToken = default);
    Task RemoveShoppingItemAsync(Guid itemId, CancellationToken cancellationToken = default);
    Task ClearPurchasedShoppingItemsAsync(CancellationToken cancellationToken = default);
}
