using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Garante que apenas usuários autenticados podem acessar este controlador
    public class AdminController : ControllerBase
    {
        [HttpGet("dashboard")]
        public IActionResult GetDashboardData()
        {
            // O acesso a esta rota só é possível com um token JWT válido.
            // Aqui você pode adicionar lógica para retornar dados de administrador.

            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            return Ok(new
            {
                message = $"Bem-vindo, {username}! Você acessou a área de administrador com sucesso.",
                userRole = role
            });
        }
    }
}
