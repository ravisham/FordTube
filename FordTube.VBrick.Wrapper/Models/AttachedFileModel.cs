using System;
using System.Collections.Generic;
using System.Text;

namespace FordTube.VBrick.Wrapper.Models
{
    public class AttachedFileModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public byte[] Content { get; set; }
    }
}
