// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

namespace FordTube.VBrick.Wrapper.Models
{

    public class CommentModel
    {

        public string Id { get; set; }

        public string Title { get; set; }

        public CommentItemModel[] Comments { get; set; }

    }

}