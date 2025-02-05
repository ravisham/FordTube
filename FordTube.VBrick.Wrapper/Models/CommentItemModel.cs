// Copyright (c) OneMagnify.  All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited

using System;

namespace FordTube.VBrick.Wrapper.Models
{

    public class CommentItemModel
    {

        public string Id { get; set; }

        public string Text { get; set; }

        public string UserName { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public DateTime Date { get; set; }
		
		public DateTime? RelativeDate { get; set; }

        public bool? IsRemoved { get; set; }

        public CommentItemModel[] ChildComments { get; set; }

    }

}