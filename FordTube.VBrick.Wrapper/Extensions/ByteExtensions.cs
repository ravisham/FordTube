using System;
using System.IO;

namespace FordTube.VBrick.Wrapper.Extensions
{
    public static class ByteExtensions
    {

        public static string ToBase64(this byte[] file)
        {
            return Convert.ToBase64String(file);
        }

        public static string ToConteudoString(this byte[] file)
        {
            return System.Text.Encoding.UTF8.GetString(file);
        }

        public static Stream ToStream(this byte[] file)
        {
            MemoryStream theMemStream = new MemoryStream();

            theMemStream.Write(file, 0, file.Length);

            return theMemStream;
        }

    }
}
