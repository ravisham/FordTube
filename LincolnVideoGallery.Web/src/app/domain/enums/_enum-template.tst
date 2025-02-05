${
    // Enable extension methods by adding using Typewriter.Extensions.*
    using Typewriter.Extensions.Types;
    using System.Reflection;

    // Uncomment the constructor to change template settings.
    Template(Settings settings)
    {
        settings.IncludeProject("FordTube.VBrick.Wrapper");
        settings.IncludeProject("FordTube.WebApi");
        settings.IncludeProject("FordTube.DB");
        settings.OutputExtension = ".ts";
        settings.OutputFilenameFactory = file => 
        {
            var FinalFileName = file.Name;
            FinalFileName = FinalFileName.Replace(".cs", "");
            return $"{FinalFileName.ToLower()}.enum.ts";
        };
    }
}
$Enums(*)[
/**
 * Enum for: $FullName
 */
export enum $Name {
$Values[
  $Name = $Value,]
}
] 


