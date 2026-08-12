using LifeOS.Domain;
using LifeOS.Infrastructure;
using LifeOS.Web.Components;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();
builder.Services.AddLifeOsInfrastructure(
    builder.Configuration.GetConnectionString("LifeOS") ?? "Data Source=App_Data/lifeos.db");

var app = builder.Build();
Directory.CreateDirectory(Path.Combine(app.Environment.ContentRootPath, "App_Data"));

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseHttpsRedirection();

app.UseAntiforgery();

app.UseStaticFiles();
app.MapStaticAssets();
app.MapGet("/styles/lifeos.css", (IWebHostEnvironment environment) =>
    Results.File(Path.Combine(environment.WebRootPath, "app.css"), "text/css"));
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", service = "LifeOS", runtime = ".NET 10" }));
app.MapGet("/api/workspace", (IWorkspaceService workspace, CancellationToken cancellationToken) =>
    workspace.GetDashboardAsync(cancellationToken));
app.MapPost("/api/tasks", async (CreateTaskRequest request, IWorkspaceService workspace, CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(request.Title)) return Results.BadRequest(new { error = "Title is required." });
    await workspace.AddTaskAsync(request.Title, request.Area, request.DurationMinutes, cancellationToken);
    return Results.NoContent();
});
app.MapPatch("/api/tasks/{taskId:guid}/toggle", async (Guid taskId, IWorkspaceService workspace, CancellationToken cancellationToken) =>
{
    await workspace.ToggleTaskAsync(taskId, cancellationToken);
    return Results.NoContent();
});
app.MapPost("/api/notes", async (CreateNoteRequest request, IWorkspaceService workspace, CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(request.Content)) return Results.BadRequest(new { error = "Content is required." });
    await workspace.AddNoteAsync(request.Content, cancellationToken);
    return Results.NoContent();
});
app.MapPatch("/api/routines/{routineId:guid}/toggle", async (Guid routineId, IWorkspaceService workspace, CancellationToken cancellationToken) =>
{
    await workspace.ToggleRoutineAsync(routineId, cancellationToken);
    return Results.NoContent();
});

await app.Services.InitializeLifeOsAsync();

app.Run();

public sealed record CreateTaskRequest(string Title, AreaKey Area, int DurationMinutes = 30);
public sealed record CreateNoteRequest(string Content);
