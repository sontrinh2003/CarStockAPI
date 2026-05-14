using CarStockAPI.Models;
using CarStockAPI.Repositories;
using FastEndpoints;

namespace CarStockAPI.Features.Customers
{
    public class AddCustomerRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
    }

    public class AddCustomerEndpoint : Endpoint<AddCustomerRequest>
    {
        private readonly CustomerRepository _repo;
        public AddCustomerEndpoint(CustomerRepository repo) { _repo = repo; }

        public override void Configure()
        {
            Post("/api/customers");
        }

        public override async Task HandleAsync(AddCustomerRequest req, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(req.Name))
            {
                AddError(r => r.Name, "Name is required");
                await Send.ErrorsAsync(); return;
            }
            if (string.IsNullOrWhiteSpace(req.Email))
            {
                AddError(r => r.Email, "Email is required");
                await Send.ErrorsAsync(); return;
            }

            var dealerId = int.Parse(User.FindFirst("dealerId")!.Value);
            var customer = new Customer
            {
                DealerId = dealerId,
                Name = req.Name,
                Email = req.Email,
                Phone = req.Phone ?? string.Empty,
                CreatedAt = DateTime.UtcNow,
            };

            var id = await _repo.Add(customer);
            await Send.CreatedAtAsync<GetCustomersEndpoint>(null, new { id });
        }
    }
}