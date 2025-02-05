using System;
using System.Collections.Generic;
using System.Text;

namespace FordTube.VBrick.Wrapper.Models
{
    public class SupplementalFilesResponseModel
    {

        public List<SupplementalFileModel> SupplementalFiles { get; set; }
       

    }

    public class SupplementalFileModel
    {
        public string FileId { get; set; }
        public string FileName { get; set; }
        public int Size { get; set; }
        public string DownloadURL { get; set; }


    }
}
