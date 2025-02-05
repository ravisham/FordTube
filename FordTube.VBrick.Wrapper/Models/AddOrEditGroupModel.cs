// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System.Collections.Generic;

namespace FordTube.VBrick.Wrapper.Models
{

    public class AddOrEditGroupModel
    {

        public string Name { get; set; }

        public List<string> UserIds { get; set; } = new List<string>();

        public List<string> RoleIds { get; set; } = new List<string>();

    }

}