namespace CarStockAPI.Models
{
    public class Sale
    {
        public int Id { get; set; }
        public int DealerId { get; set; }
        public int CarId { get; set; }
        public int CustomerId { get; set; }
        public decimal SaleAmount { get; set; }
        public DateTime SaleDate { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Pending";

        // Joined fields (populated by SELECT with JOIN)
        public string? CustomerName { get; set; }
        public string? Make { get; set; }
        public string? Model { get; set; }
    }
}
