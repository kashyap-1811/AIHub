using System.Security.Cryptography;
using System.Text;

namespace AIHub.API.Services
{
    public class EncryptionService
    {
        private readonly string _encryptionKey;

        public EncryptionService(IConfiguration configuration)
        {
            _encryptionKey = configuration["Encryption:Key"] ?? "DefaultEncryptionKey123456789012345678901234567890";
        }

        public string Encrypt(string plainText)
        {
            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(_encryptionKey.Substring(0, 32));
            aes.IV = new byte[16]; // Simple IV for demo purposes

            using var encryptor = aes.CreateEncryptor();
            using var msEncrypt = new MemoryStream();
            using var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write);
            using var swEncrypt = new StreamWriter(csEncrypt);

            swEncrypt.Write(plainText);
            swEncrypt.Close();

            return Convert.ToBase64String(msEncrypt.ToArray());
        }

        public string Decrypt(string cipherText)
        {
            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(_encryptionKey.Substring(0, 32));
            aes.IV = new byte[16]; // Simple IV for demo purposes

            using var decryptor = aes.CreateDecryptor();
            using var msDecrypt = new MemoryStream(Convert.FromBase64String(cipherText));
            using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
            using var srDecrypt = new StreamReader(csDecrypt);

            return srDecrypt.ReadToEnd();
        }
    }
}
