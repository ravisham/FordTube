${
 // Enable extension methods by adding using Typewriter.Extensions.*
 using System.Reflection;
 using Typewriter.Extensions.Types;
 using Typewriter.Extensions.WebApi;
 using System.Text.RegularExpressions;

 // Uncomment the constructor to change template settings.
 Template(Settings settings) {
  settings.IncludeProject("FordTube.WebApi");
  settings.OutputExtension = ".ts";
  settings.OutputFilenameFactory = file => {
   var FinalFileName = file.Name.Replace("ControllerBase", "").Replace("Controller", "");
   FinalFileName = FinalFileName.Replace(".cs", "");
   return $"{FinalFileName.ToLower()}.service.ts";
  };
 }

 string ServiceName(Class c) => c.Name.Replace("Controller", "Service");

 string Imports(Class _class) {
  var methods =  _class.Methods;
  var parameters = (from method in methods from parameter in method.Parameters where !parameter.Type.IsPrimitive && !parameter.Type.name.Equals("any") select parameter);
  List<string> neededImports = parameters.Select(property => "import { " + property.Type.Name.TrimEnd('[', ']') + " } from '../interfaces/" + property.Type.Name.ToLower().TrimEnd('[', ']').Replace("model", ".interface") + "';").ToList();
  return String.Join("\n", neededImports.Distinct());
 }

  string AppendQueryString(Method method, string route)
  {
      var prefix = route.Contains("?") ? "&" : "?";

      foreach (Parameter parameter in method.Parameters.Where(p => !p.Type.IsPrimitive && p.Attributes.Any(a => a.Name == "FromQuery") == true))
      {
                foreach (Property modelProperty in parameter.Type.Properties) {

                    if (route.Contains($"${{{GetPropertyValue(method, modelProperty.Name)}}}") == false)
                    {
                        route += $"{prefix}{modelProperty.name}=${{{parameter.name}.{GetPropertyValue(method, modelProperty.name)}}}";
                        prefix = "&";
                    }
                }
      }
      return route;
  }

  string GetPropertyValue(Method method, string name)
  {
      var parameter = method.Type.Properties.FirstOrDefault(p => p.Name == name);
      if (parameter?.Type.Name == "string")
      {
          return $"encodeURIComponent({name})";
      }

      return name;
  }

  string GetParameterValue(Method method, string name)
  {
      var parameter = method.Parameters.FirstOrDefault(p => p.Name == name);
      if (parameter?.Type.Name == "string")
      {
          return $"encodeURIComponent({name})";
      }

      return name;
  }

  string ToQueryString(Parameter parameter)
  {
      List<string> neededImports = parameter.GetType().GetProperties().Select(p => $"{Uri.EscapeDataString(parameter.name)}={Uri.EscapeDataString(p.Name)}").ToList();
      return "?" + string.Join("&", neededImports);
  }

    string GetRequestWithQueryStringUrl(Method objMethod){
    var nonPrimitiveParameter = objMethod.Parameters.FirstOrDefault(p => !p.Type.IsPrimitive);
    return ToQueryString(nonPrimitiveParameter);
 }

 string DetermineParameterOutput(ParameterCollection collection, int index){
  if(collection.Count < index || collection.ElementAtOrDefault(index) == null) {
    return "null";
  }else return collection[index].name;
 }

 string ToAngularHttp(Method objMethod) {
  var _url = objMethod.Url().ToString();
  var _method = objMethod.HttpMethod();
  var _envStrTemplate = "${environment.maApiUrl}";
  switch(_method) {
    case "get":
      if (objMethod.Parameters.Any(p => p.Attributes.All(a => a.Name.Contains("FromQuery")) && objMethod.Parameters.Any(p => !p.Type.IsPrimitive))) {
        return _method + $"(`{_envStrTemplate}{AppendQueryString(objMethod, _url)}`)";
      } else {
        return _method + $"(`{_envStrTemplate}{_url}`)";
      }
    case "post":
      return _method + $"(`{_envStrTemplate}{_url}`, {DetermineParameterOutput(objMethod.Parameters, 0)})";
    case "put":
      var takeParameter = objMethod.Parameters.Count > 1 ? 1 : 0;
      if (objMethod.Parameters.Count == 1 && objMethod.Parameters[0].name.ToLower() == "id") {
        takeParameter = -1;
      }
      return _method + $"(`{_envStrTemplate}{_url}`, {DetermineParameterOutput(objMethod.Parameters, takeParameter)})";
    case "delete":
      return _method + $"(`{_envStrTemplate}{_url}`)";
  }
  return $"";
 }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';

$Classes(: Controller*)[
$Imports

/**
  * Angular Service For for: $FullName
  */
@Injectable()
export class $ServiceName {
  constructor(private httpClient: HttpClient) {}
$Methods[
  $name($Parameters[$name: $Type][, ]): Observable<any> {
  return this.httpClient.$ToAngularHttp;
  }
]
}
]
