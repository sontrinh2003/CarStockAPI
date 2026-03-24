using CarStockAPI.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CarStockAPI.Controllers
{
    [Route("/api/cars")]
    [ApiController]
    public class CarController : ControllerBase
    {
        private readonly ILogger<CarController> _logger;
        private readonly CarRepository _carRepo;
        public CarController(ILogger<CarController> logger, CarRepository carRepo)
        {
            _logger = logger;
            _carRepo = carRepo;
        }
        [HttpGet]
        public async Task<IActionResult> GetCars()
        {
            try
            {
                var cars = await _carRepo.GetAll(1);
                return Ok(cars);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    statusCode = 500,
                    message = ex.Message
                });
            }
        }
    }
}
