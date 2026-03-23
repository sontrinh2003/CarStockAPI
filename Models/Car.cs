namespace CarStockAPI.Models
{
    public class Car
    {
        public int Id { get; set; }
        public int DealerId { get; set; }
        public string Make { get; set; } = null!;
        public string Model { get; set; } = null!;
        public int Year { get; set; }
        public int Stock { get; set; }
    }
}
