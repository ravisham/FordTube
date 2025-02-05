// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited


using System;
using System.Globalization;
using System.Threading.Tasks;

using Flurl.Http;
using Flurl.Http.Configuration;

using FordTube.VBrick.Wrapper.Http;
using FordTube.VBrick.Wrapper.Repositories;
using FordTube.VBrick.Wrapper.Services;

#pragma warning disable CS1998


namespace FordTube.VBrick.Wrapper{

    public class VBrickSettings {

        public string BaseUrl { get; set; }


        public string ApiKey { get; set; }


        public string Secret { get; set; }

    }

}