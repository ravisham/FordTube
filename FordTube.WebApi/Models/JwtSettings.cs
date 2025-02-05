namespace FordTube.WebApi.Models;

public class JwtSettings {

    public string Key { get; set; }


    public string Issuer { get; set; }


    public List<string> Audiences { get; set; }


    public int DurationInMinutes { get; set; }

}