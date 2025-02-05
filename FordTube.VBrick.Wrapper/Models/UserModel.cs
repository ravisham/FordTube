// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System;
using System.Collections.Generic;

namespace FordTube.VBrick.Wrapper.Models
{
    public class UserModel
    {

        public string UserId { get; set; }

        public string UserName { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Email { get; set; }

        public string Title { get; set; }

        public string PhoneNumber { get; set; }

        public string Language { get; set; }

        public List<UserGroupModel> Groups { get; set; }

        public List<string> GroupIds { get; set; }

        public List<RoleModel> Roles { get; set; }

        public List<UserTeamModel> Teams { get; set; }

        public DateTime Expiration { get; set; }

    }

}