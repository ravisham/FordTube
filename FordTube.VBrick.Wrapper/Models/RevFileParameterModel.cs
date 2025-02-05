using System;
using System.Collections.Generic;
using System.Text;


namespace FordTube.VBrick.Wrapper.Models {

    class RevFileParameterModel {

        public RevFileParameterModel(byte[] file) : this(file, null) { }


        public RevFileParameterModel(byte[] file, string filename) : this(file, filename, null) { }


        public RevFileParameterModel(byte[] file, string filename, string contenttype)
        {
            File = file;
            FileName = filename;
            ContentType = contenttype;
        }


        public byte[] File { get; set; }


        public string FileName { get; set; }


        public string ContentType { get; set; }



    }

}
