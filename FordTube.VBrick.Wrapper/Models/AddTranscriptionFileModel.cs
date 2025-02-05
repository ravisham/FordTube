// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

namespace FordTube.VBrick.Wrapper.Models
{

    public class AddTranscriptionFileModel
    {

        public string FileName { get; set; }

        public string Language { get; set; } = "en";

        public AddTranscriptionFileModel(string fileName)
        {
            FileName = fileName;
        }

    }

}