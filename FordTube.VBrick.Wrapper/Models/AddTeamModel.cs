// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System.Collections.Generic;

namespace FordTube.VBrick.Wrapper.Models
{

    public class AddTeamModel
    {

        public string Name { get; set; }

        public string Description { get; set; }

        public List<TeamMemberModel> TeamMembers { get; set; } = new List<TeamMemberModel>();

        public List<string> UserIds { get; set; } = new List<string>();

        public List<string> GroupIds { get; set; } = new List<string>();

    }

}