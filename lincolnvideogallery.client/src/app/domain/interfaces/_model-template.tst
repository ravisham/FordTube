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
            var FinalFileName = file.Name.Replace("Model", "");
            FinalFileName = FinalFileName.Replace(".cs", "");
            return $"{FinalFileName.ToLower()}.interface.ts";
        };
    }


    string Imports(Class _class) {
      var properties = (from property in _class.Properties where !property.Type.IsPrimitive select property);
      List<string> neededImports = properties.Select(property => "import { " + property.Type.Name.TrimEnd('[', ']') + " } from './" + property.Type.Name.ToLower().TrimEnd('[', ']').Replace("model", ".interface") + "';").ToList();
      return String.Join("\n", neededImports.Distinct());
    }

    string EnumImports(Class _class){
      var enums = (from _enum in _class.Properties where _enum.Type.IsEnum select _enum);
      List<string> neededImports = enums.Select(_enum => "import { " + _enum.Type.Name.TrimEnd('[', ']') + " } from '../enums/" + _enum.Type.Name.ToLower().TrimEnd('[', ']') + ".enum" + "';").ToList();
      return String.Join("\n", neededImports.Distinct());
    }

    string TypeFormatted(Property property)
    {
        var type = property.Type;
        if (type.IsNullable)
        {
            return  $"?";
        }
        else
        {
            return  $"";
        }
    }

    string Inherit(Class c) {
      if (c.BaseClass!=null)
	      return " extends " + c.BaseClass.ToString();
        else
	       return  "";
    }
}
$Classes(*Model)[
$Imports
$EnumImports
/**
  * Model/Interface for: $FullName
  */
export interface $Name$TypeParameters$Inherit {
$Properties[
  $name$TypeFormatted: $Type;]
}
]
