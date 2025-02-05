using System.IO;

using Microsoft.AspNetCore.Html;

using Microsoft.AspNetCore.Mvc.Rendering;

namespace FordTube.Web.Extensions
{

  public static class HtmlExtensions
  {

    public static IHtmlContent LoadSpaScripts(this IHtmlHelper helper)
    {
      var html = File.ReadAllText(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html"));

      return helper.Raw(html);

    }

  }
}
