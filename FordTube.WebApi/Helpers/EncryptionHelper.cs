using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

using Microsoft.Extensions.Configuration;

namespace FordTube.WebApi.Helpers
{
    public class EncryptionHelper
    {
        private readonly byte[] _aesKey;

        public EncryptionHelper(IConfiguration configuration)
        {
            var aesKeyBase64 = configuration["Encryption:AesKey"];
            if (string.IsNullOrWhiteSpace(aesKeyBase64))
            {
                throw new Exception("AES key is not configured.");
            }
            _aesKey = Convert.FromBase64String(aesKeyBase64);
            if (_aesKey.Length != 32)
            {
                throw new Exception("Invalid AES key length. Key must be 32 bytes for AES-256 encryption.");
            }
        }

        public string Encrypt(string data)
        {
            using var aesAlg = Aes.Create();
            aesAlg.Key = _aesKey;
            aesAlg.GenerateIV();

            var encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

            using var msEncrypt = new MemoryStream();
            using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                using (var swEncrypt = new StreamWriter(csEncrypt))
                {
                    swEncrypt.Write(data);
                }

            var iv               = aesAlg.IV;
            var encryptedContent = msEncrypt.ToArray();
            var combinedContent  = new byte[iv.Length + encryptedContent.Length];

            Buffer.BlockCopy(iv, 0, combinedContent, 0, iv.Length);
            Buffer.BlockCopy(encryptedContent, 0, combinedContent, iv.Length, encryptedContent.Length);

            return Convert.ToBase64String(combinedContent);
        }


        private static byte[] ReadByteArray(Stream s)
        {
            var rawLength = new byte[sizeof(int)];
            if (s.Read(rawLength, 0, rawLength.Length) != rawLength.Length)
            {
                throw new SystemException("Stream did not contain properly formatted byte array");
            }

            var buffer = new byte[BitConverter.ToInt32(rawLength, 0)];
            if (s.Read(buffer, 0, buffer.Length) != buffer.Length)
            {
                throw new SystemException("Did not read byte array properly");
            }

            return buffer;
        }
    }
}
