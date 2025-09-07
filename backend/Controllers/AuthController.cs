using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        // Classes de requisição para login e registro
        public class LoginRequest
        {
            public string Username { get; set; } = default!;
            public string Password { get; set; } = default!;
        }

        public class RegisterRequest
        {
            public string Username { get; set; } = default!;
            public string Password { get; set; } = default!;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            // Busca o usuário pelo nome de usuário
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == req.Username);
            
            // Verifica se o usuário existe e se a senha está correta usando BCrypt
            if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Unauthorized("Usuário ou senha inválidos.");

            // Configurações e credenciais para o token JWT
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "minha_chave_super_secreta_123"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Cria os claims (declarações) do usuário para o token
            var claims = new[]
            {
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, user.Username),
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, user.Role)
            };

            // Cria o token JWT
            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"] ?? "backend",
                audience: _config["Jwt:Audience"] ?? "frontend",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            // Retorna o token para o frontend
            return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            // Verifica se o usuário já existe no banco de dados
            if (await _db.Users.AnyAsync(u => u.Username == req.Username))
                return BadRequest("Usuário já existe.");

            // Cria um novo usuário com a senha hasheada com BCrypt e define a Role
            var user = new User
            {
                Username = req.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                Role = "Admin" // cria sempre como Admin
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Administrador criado com sucesso!" });
        }
    }
}
