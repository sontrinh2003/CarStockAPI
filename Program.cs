using CarStockAPI.Repositories;
using Dapper;
using FastEndpoints;
using FastEndpoints.Swagger;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.Sqlite;
using Microsoft.IdentityModel.Tokens;
using SQLitePCL;
using System.Text;

// To access the database file
Batteries.Init();

var builder = WebApplication.CreateBuilder();

// FastEndpoint and Swagger
builder.Services.AddFastEndpoints();
builder.Services.SwaggerDocument();

// JWT Authentication
var key = Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:SecretKey"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

builder.Services.AddAuthorization();

builder.Services.AddScoped<CarRepository>();
builder.Services.AddScoped<DealerRepository>();
builder.Services.AddScoped<CustomerRepository>();
builder.Services.AddScoped<SalesRepository>();
builder.Services.AddScoped<DashboardRepository>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
        policy.WithOrigins(
                "http://localhost:5173",   // Vite dev server
                "http://localhost:3000"    // CRA / fallback
              )
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();
app.UseCors("ReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.UseFastEndpoints();
app.UseSwaggerGen();

using (var conn = new SqliteConnection(builder.Configuration.GetConnectionString("DefaultConnection")))
{
    conn.Open();
    var migrationSql = File.ReadAllText("db-migrations.sql");
    await conn.ExecuteAsync(migrationSql);
}

app.Run();