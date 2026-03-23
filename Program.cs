using CarStockAPI.Repositories;
using FastEndpoints;
using FastEndpoints.Swagger;
using Microsoft.Data.Sqlite;
using System.Data;

var builder = WebApplication.CreateBuilder();

builder.Services
    .AddAuthorization()
    .AddFastEndpoints()
    .SwaggerDocument();

// SQLite connection
var dbPath = builder.Configuration.GetConnectionString("SqliteDb");
builder.Services.AddScoped<IDbConnection>(_ => new SqliteConnection(dbPath));

builder.Services.AddScoped<CarRepository>();

var app = builder.Build();

app.UseAuthorization()
    .UseFastEndpoints()
    .UseSwaggerGen();

app.Run();
