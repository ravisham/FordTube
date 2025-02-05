// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System.Collections.Generic;

namespace FordTube.VBrick.Wrapper.Models
{

    public class AddTranscriptionFilesModel
    {

        public List<AddTranscriptionFileModel> Files { get; set; }

        public AddTranscriptionFilesModel(string fileName)
        {
            Files = new List<AddTranscriptionFileModel>() { new AddTranscriptionFileModel(fileName) };
        }
    }

}