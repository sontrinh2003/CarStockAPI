using CarStockAPI.Repositories;
using FastEndpoints;
using FastEndpoints.Swagger;
using Microsoft.Data.Sqlite;
using SQLitePCL;
using System.Data;

// To access the database file
Batteries.Init();

var builder = WebApplication.CreateBuilder();

builder.Services.AddFastEndpoints();
builder.Services.SwaggerDocument();

builder.Services.AddScoped<CarRepository>();

var app = builder.Build();

app.UseFastEndpoints();
app.UseSwaggerGen();

app.Run();