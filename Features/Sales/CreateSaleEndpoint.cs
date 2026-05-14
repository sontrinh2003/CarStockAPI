using CarStockAPI.Models;
using CarStockAPI.Repositories;
using FastEndpoints;

namespace CarStockAPI.Features.Sales
{
    public class CreateSaleRequest
    {
        public int CustomerId { get; set; }
        public int CarId { get; set; }
        public decimal SaleAmount { get; set; }
    }

    public class CreateSaleEndpoint : Endpoint<CreateSaleRequest>
    {
        private readonly SalesRepository _repo;
        public CreateSaleEndpoint(SalesRepository repo) { _repo = repo; }

        public override void Configure() { Post("/api/sales"); }

        public override async Task HandleAsync(CreateSaleRequest req, CancellationToken ct)
        {
            if (req.SaleAmount <= 0)
            {
                AddError(r => r.SaleAmount, "Sale amount must be positive");
                await Send.ErrorsAsync(); return;
            }

            var dealerId = int.Parse(User.FindFirst("dealerId")!.Value);
            var sale = new Sale
            {
                DealerId = dealerId,
                CarId = req.CarId,
                CustomerId = req.CustomerId,
                SaleAmount = req.SaleAmount,
            };

            try
            {
                var id = await _repo.CreateSale(sale);
                await Send.CreatedAtAsync<GetSalesEndpoint>(null, new { id });
            }
            catch (InvalidOperationException ex)
            {
                // Out of stock
                AddError("sale", ex.Message);
                await Send.ErrorsAsync(400);
            }
            catch (KeyNotFoundException ex)
            {
                await Send.NotFoundAsync();
            }
        }
    }
}