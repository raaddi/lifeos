using LifeOS.Domain;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Infrastructure;

public sealed class LifeOsDbContext(DbContextOptions<LifeOsDbContext> options) : DbContext(options)
{
    public DbSet<LifeTask> Tasks => Set<LifeTask>();
    public DbSet<Routine> Routines => Set<Routine>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<LifeArea> Areas => Set<LifeArea>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LifeTask>(entity =>
        {
            entity.HasKey(task => task.Id);
            entity.Property(task => task.Title).HasMaxLength(240);
            entity.Property(task => task.Area).HasConversion<string>().HasMaxLength(32);
        });

        modelBuilder.Entity<Routine>(entity =>
        {
            entity.HasKey(routine => routine.Id);
            entity.Property(routine => routine.Name).HasMaxLength(160);
            entity.Property(routine => routine.Schedule).HasMaxLength(80);
        });

        modelBuilder.Entity<Note>(entity =>
        {
            entity.HasKey(note => note.Id);
            entity.Property(note => note.Content).HasMaxLength(4000);
        });

        modelBuilder.Entity<LifeArea>(entity =>
        {
            entity.HasKey(area => area.Key);
            entity.Property(area => area.Key).HasConversion<string>().HasMaxLength(32);
            entity.Property(area => area.Name).HasMaxLength(80);
            entity.Property(area => area.Objective).HasMaxLength(300);
            entity.Property(area => area.Color).HasMaxLength(16);
        });
    }
}
