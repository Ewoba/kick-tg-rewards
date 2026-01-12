using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

var rewards = new List<Reward>
{
    new Reward
    {
        Id = Guid.NewGuid(),
        Title = "Welcome Airdrop",
        Description = "First time viewer bonus",
        Token = "USDC",
        Amount = 5
    }
};

app.MapGet("/health", () => Results.Ok(new { ok = true, service = "csharp-api" }));

app.MapGet("/rewards", () => Results.Ok(rewards));

app.MapPost("/rewards", ([FromBody] RewardCreate payload) =>
{
    var reward = new Reward
    {
        Id = Guid.NewGuid(),
        Title = payload.Title,
        Description = payload.Description,
        Token = payload.Token ?? "USDC",
        Amount = payload.Amount
    };
    rewards.Add(reward);
    return Results.Created($"/rewards/{reward.Id}", reward);
});

app.MapGet("/rewards/{id:guid}", (Guid id) =>
{
    var reward = rewards.FirstOrDefault(r => r.Id == id);
    return reward is null ? Results.NotFound() : Results.Ok(reward);
});

app.MapDelete("/rewards/{id:guid}", (Guid id) =>
{
    var removed = rewards.RemoveAll(r => r.Id == id);
    return removed == 0 ? Results.NotFound() : Results.NoContent();
});

app.Run();

record Reward
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Token { get; set; } = "USDC";
    public decimal Amount { get; set; }
}

record RewardCreate(string Title, string? Description, string Token, decimal Amount);
