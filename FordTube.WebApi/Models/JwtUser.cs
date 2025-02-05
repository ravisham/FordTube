using FordTube.VBrick.Wrapper.Enums;
using Newtonsoft.Json;

namespace FordTube.WebApi.Models
{
    /// <summary>
    /// Custom user class that extends the User class with additional properties.
    /// </summary>
    public class JwtUser
    {
        [JsonProperty("franchise")]
        public FranchiseType Franchise { get; set; } = FranchiseType.Both;

        [JsonProperty("userName")]
        public string UserName { get; set; }

        [JsonProperty("firstName")]
        public string FirstName { get; set; }

        [JsonProperty("lastName")]
        public string LastName { get; set; }

        [JsonProperty("dealerId")]
        public int DealerId { get; set; }

        [JsonProperty("emailAddress")]
        public string EmailAddress { get; set; }

        [JsonProperty("phoneNumber")]
        public string PhoneNumber { get; set; }

        [JsonProperty("starsId")]
        public string StarsId { get; set; }

        [JsonProperty("pnaCode")]
        public string PnaCode { get; set; }

        [JsonProperty("userTypeId")]
        public int UserTypeId { get; set; }

        [JsonProperty("userRoleId")]
        public int UserRoleId { get; set; }

        [JsonProperty("starsDateChecked")]
        public DateTime? StarsDateChecked { get; set; }

        [JsonProperty("disclaimerDateChecked")]
        public DateTime? DisclaimerDateChecked { get; set; }
    }
}
