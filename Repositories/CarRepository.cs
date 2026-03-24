using CarStockAPI.Models;
using Dapper;
using Microsoft.Data.Sqlite;
using System.Data;

namespace CarStockAPI.Repositories
{
    public class CarRepository
    {
        private readonly string _connectionString;

        public CarRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        private IDbConnection GetConnection()
        {
            return new SqliteConnection(_connectionString);
        }

        // List cars and stock levels
        public async Task<IEnumerable<Car>> GetAll(int dealerId)
        {
            using IDbConnection conn = GetConnection();

            var cars = await conn.QueryAsync<Car>(
                "SELECT * FROM Cars WHERE DealerId = @DealerId",
                new { DealerId = dealerId });

            return cars;
        }

        // Add a new car
        public async Task Add(Car car)
        {
            using IDbConnection conn = GetConnection();

            var sql = @"INSERT INTO Cars (DealerId, Make, Model, Year, Stock)
                    VALUES (@DealerId, @Make, @Model, @Year, @Stock)";

            await conn.ExecuteAsync(sql, car);
        }
        
        // Update car stock level 
        public async Task UpdateStock(int id, int dealerId, int stock)
        {
            using IDbConnection conn = GetConnection();

            await conn.ExecuteAsync(
                "UPDATE Cars SET Stock = @Stock WHERE Id = @Id AND DealerId = @DealerId",
                new { Id = id, DealerId = dealerId, Stock = stock });
        }

        // Remove car
        public async Task Delete(int id, int dealerId)
        {
            using IDbConnection conn = GetConnection();

            await conn.ExecuteAsync(
                "DELETE FROM Cars WHERE Id = @Id AND DealerId = @DealerId",
                new { Id = id, DealerId = dealerId });
        }

        // Search car by make and model 
        public async Task<IEnumerable<Car>> Search(int dealerId, string make, string model)
        {
            using IDbConnection conn = GetConnection();

            return await conn.QueryAsync<Car>(
                "SELECT * FROM Cars WHERE DealerId = @DealerId AND Make LIKE @Make AND Model LIKE @Model",
                new { DealerId = dealerId, Make = $"%{make}%", Model = $"%{model}%" });
        }
    }
}
