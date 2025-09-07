using backend.Models;
using System.Linq; // Garante que a extensão Any() está disponível

namespace backend.Data
{
    public static class SeedData
    {
        public static void Initialize(AppDbContext context)
        {
            // Verifica se já existem usuários na base de dados para evitar duplicação.
            if (!context.Users.Any())
            {
                // Adiciona o usuário administrador padrão
                context.Users.Add(new User
                {
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Role = "Admin"
                });

                // Adiciona um usuário atendente para testes
                context.Users.Add(new User
                {
                    Username = "atendente",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Role = "Atendente"
                });

                // Salva as mudanças no banco de dados.
                context.SaveChanges();
            }
        }
    }
}
