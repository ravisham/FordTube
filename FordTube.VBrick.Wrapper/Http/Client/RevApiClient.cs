using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

using Flurl;
using Flurl.Http;
using Flurl.Http.Content;

using FordTube.VBrick.Wrapper.Extensions;
using FordTube.VBrick.Wrapper.Http.Extensions;
using FordTube.VBrick.Wrapper.Models;
using FordTube.VBrick.Wrapper.Services;

using Microsoft.AspNetCore.Http;

using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

using NullValueHandling = Newtonsoft.Json.NullValueHandling;


namespace FordTube.VBrick.Wrapper.Http.Client;

public class RevApiClient : IRevApiClient {

    private readonly IRevAuthenticationService _revAuthService;


    public RevApiClient(IRevAuthenticationService revAuthService) { _revAuthService = revAuthService; }


    #region GetStringAsync


    public async Task<string> GetStringAsync(string endpoint, object queryParameters, string accessToken) { return await endpoint.WithAuthentication().WithVbrickRevApiToken(_revAuthService.AccessToken).SetQueryParams(queryParameters).GetStringAsync(); }


    #endregion


    public HttpWebResponse MultipartFormDataPost(string url, Dictionary<string, object> postParameters, HttpMethod method)
    {
        if (method == null) method = HttpMethod.Post;

        var formDataBoundary = $"----------{Guid.NewGuid():N}";
        var contentType      = "multipart/form-data; boundary=" + formDataBoundary;

        var formData = GetMultipartFormData(postParameters, formDataBoundary);

        return PostRevForm(url, method, contentType, formData);
    }


    public async Task<string> MultipartFormDataPostAsync<T>(string url, Dictionary<string, object> postParameters, HttpMethod method)
    {
        await _revAuthService.AuthenticateAsync();

        if (method == null) method = HttpMethod.Post;

        var formDataBoundary = $"----------{Guid.NewGuid():N}";
        var contentType      = "multipart/form-data; boundary=" + formDataBoundary;

        var formData = GetMultipartFormData(postParameters, formDataBoundary);

        return await PostRevFormAsync(url, method, contentType, formData);
    }


    private static async Task<T> ValidateVbrickResponse<T>(IFlurlResponse httpResponse)
    {
        var responseString = await httpResponse.GetStringAsync();

        T      response;

        try
        {
            response = JsonConvert.DeserializeObject<T>(responseString);
        }
        catch (JsonSerializationException ex)
        {
            Console.WriteLine("Error deserializing response: " + ex.Message);
            Console.WriteLine("Response content: "             + responseString);
            throw;
        }

        return response ?? default;
    }


    private HttpWebResponse PostRevForm(string url, HttpMethod method, string contentType, byte[] formData)
    {
        var request = (HttpWebRequest) WebRequest.Create(url);

        request.ReadWriteTimeout = 600000;
        request.Headers.Add("Authorization", "Vbrick " + _revAuthService.AccessToken);
        request.Timeout = 600000;
        request.Method = method.ToString();
        request.ContentType = contentType;
        request.ContentLength = formData.Length;

        // Send the form data to the request.
        using (var requestStream = request.GetRequestStream()) { requestStream.Write(formData, 0, formData.Length); }

        HttpWebResponse response = null;

        try { response = request.GetResponse() as HttpWebResponse; }
        catch (WebException ex)
        {
            using var stream = ex.Response?.GetResponseStream();

            if (stream != null)
            {
                using var reader = new StreamReader(stream);

                reader.ReadToEnd();
            }
        }

        return response;
    }


    private async Task<string> PostRevFormAsync(string url, HttpMethod method, string contentType, byte[] formData)
    {
        var request = WebRequest.Create(url);

        request.Timeout = int.MaxValue;
        request.Method = method.ToString();
        request.Headers.Add("Authorization", "Vbrick " + _revAuthService.AccessToken);
        request.ContentType = contentType;
        request.ContentLength = formData.Length;

        // Send the form data to the request asynchronously.
        using (var requestStream = await request.GetRequestStreamAsync()) { await requestStream.WriteAsync(formData, 0, formData.Length); }

        WebResponse response = null;

        try { response = await request.GetResponseAsync(); }
        catch (WebException ex)
        {
            using var stream = ex.Response?.GetResponseStream();

            if (stream != null)
            {
                using var reader = new StreamReader(stream);

                await reader.ReadToEndAsync();
            }
        }

        return response?.ToString();
    }


    private static byte[] GetMultipartFormData(Dictionary<string, object> postParameters, string boundary)
    {
        using var formDataStream = new MemoryStream();

        var needsClrf = false;

        foreach (var (key, value) in postParameters)
        {
            if (needsClrf) formDataStream.Write(Encoding.UTF8.GetBytes("\r\n"), 0, Encoding.UTF8.GetByteCount("\r\n"));

            needsClrf = true;

            if (value is RevFileParameterModel fileToUpload)
            {
                // Add just the first part of this param, since we will write the file data directly to the Stream
                var header = $"--{boundary}\r\nContent-Disposition: form-data; name=\"{key}\"; filename=\"{fileToUpload.FileName ?? key}\";\r\nContent-Type: {fileToUpload.ContentType ?? "application/octet-stream"}\r\n\r\n";

                formDataStream.Write(Encoding.UTF8.GetBytes(header), 0, Encoding.UTF8.GetByteCount(header));

                // Write the file data directly to the Stream, rather than serializing it to a string.
                formDataStream.Write(fileToUpload.File, 0, fileToUpload.File.Length);
            }
            else
            {
                var postData = $"--{boundary}\r\nContent-Disposition: form-data; name=\"{key}\"\r\n\r\n{value}";

                formDataStream.Write(Encoding.UTF8.GetBytes(postData), 0, Encoding.UTF8.GetByteCount(postData));
            }
        }

        // Add the end of the request.  Start with a newline
        var footer = "\r\n--" + boundary + "--\r\n";
        formDataStream.Write(Encoding.UTF8.GetBytes(footer), 0, Encoding.UTF8.GetByteCount(footer));

        // Dump the Stream into a byte[]
        formDataStream.Position = 0;
        var formData = new byte[formDataStream.Length];
        formDataStream.Read(formData, 0, formData.Length);
        formDataStream.Close();

        return formData;
    }


    #region PostAsync<T>


    public async Task<T> PostAsync<T>(string endpoint) { return await PostAsyncInternal<T>(endpoint, null, null, _revAuthService.AccessToken); }


    public async Task<T> PostAnonymousAsync<T>(string endpoint) { return await PostAsyncInternal<T>(endpoint, null, null, null); }


    public async Task<T> PostAsync<T>(string endpoint, object inputDto) { return await PostAsyncInternal<T>(endpoint, inputDto, null, _revAuthService.AccessToken); }


    public async Task<T> PostAsync<T>(string endpoint, object inputDto, object queryParameters) { return await PostAsyncInternal<T>(endpoint, inputDto, queryParameters, _revAuthService.AccessToken); }


    public async Task<byte[]> DownloadAsync(string url)
    {
        using var stream = await url.GetStreamAsync();

        using var ms = new MemoryStream();

        await stream.CopyToAsync(ms);

        return ms.ToArray();
    }


    public async Task<Stream> DownloadFileAsync(string url)
    {
        var request = url.WithAuthentication().WithVbrickRevApiToken(_revAuthService.AccessToken);

        var result = await request.GetStreamAsync();

        return result;
    }

    /// <summary>
    ///     Makes POST request without authentication token.
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="endpoint"></param>
    /// <param name="inputDto"></param>
    /// <returns></returns>
    public async Task<T> PostAnonymousAsync<T>(string endpoint, object inputDto) { return await PostAsyncInternal<T>(endpoint, inputDto, null, null); }


    private static async Task<T> PostAsyncInternal<T>(string endpoint, object body, object queryParameters, string accessToken)
    {
        var jsonContent = JsonConvert.SerializeObject(body);
        var content     = new StringContent(jsonContent, Encoding.UTF8, "application/json");

        try
        {
            Console.WriteLine("Sending request to endpoint: " + endpoint);

            var httpResponse = await endpoint
                                           .SetQueryParams(queryParameters)
                                           .WithAuthentication()
                                           .WithVbrickRevApiToken(accessToken)
                                           .WithTimeout(TimeSpan.FromSeconds(30)).PostAsync(content);

            Console.WriteLine("Received response from endpoint: " + endpoint);

            return await ValidateVbrickResponse<T>(httpResponse);
        }
        catch (FlurlHttpException ex)
        {
            var errorContent = await ex.GetResponseStringAsync();
            Console.WriteLine("Error occurred while sending request: " + ex.Message);
            Console.WriteLine("Response content: "                     + errorContent);
            throw;
        }
    }


    public async Task<T> PostMultipartAsync<T>(string endpoint, Action<CapturedMultipartContent> buildContent)
    {
        var httpResponse = await endpoint.WithVbrickRevApiToken(_revAuthService.AccessToken).WithAuthentication().PostMultipartAsync(buildContent);

        return await ValidateVbrickResponse<T>(httpResponse);
    }


    public async Task<T> PostMultipartAsync<T>(string endpoint, MemoryStream stream, string fileName, string fileKey)
    {
        var httpResponse = await endpoint.WithVbrickRevApiToken(_revAuthService.AccessToken).WithAuthentication().PostMultipartAsync(multiPartContent => multiPartContent.AddFile(fileKey, stream, fileName));

        return await ValidateVbrickResponse<T>(httpResponse);
    }


    public async Task<T> PostMultipartAsync<T>(string endpoint, Stream stream, string fileName)
    {
        var httpResponse = await endpoint.WithVbrickRevApiToken(_revAuthService.AccessToken).WithAuthentication().PostMultipartAsync(multiPartContent => multiPartContent.AddFile("file", stream, fileName));

        return await ValidateVbrickResponse<T>(httpResponse);
    }


    public async Task<T> PostMultipartAsync<T>(string endpoint, string filePath)
    {
        var httpResponse = await endpoint.WithVbrickRevApiToken(_revAuthService.AccessToken).WithAuthentication().PostMultipartAsync(multiPartContent => multiPartContent.AddFile("file", filePath));

        return await ValidateVbrickResponse<T>(httpResponse);
    }


    public async Task<T> PostMultipartAsync<T>(string endpoint, byte[] fileBytes, string fileName, object data, string fileNameParameter = "File")
    {
        var postResponse = await endpoint.WithVbrickRevApiToken(_revAuthService.AccessToken).WithAuthentication().PostMultipartAsync(mp => mp.AddFile($"{fileNameParameter}{fileBytes}", fileBytes.ToStream(), fileName).AddStringParts(data));

        return await postResponse.GetJsonAsync<T>();
    }


    public async Task<bool> PostMultipartAsync(string endpoint, byte[] fileBytes, string fileName, object data, string fileNameParameter)
    {
        var postResponse = await endpoint.WithVbrickRevApiToken(_revAuthService.AccessToken).WithAuthentication().PostMultipartAsync(mp => mp.AddFile($"{fileNameParameter}{fileBytes}", fileBytes.ToStream(), fileName).AddStringParts(data));

        return postResponse.StatusCode.Equals(StatusCodes.Status200OK);
    }


    #endregion


    #region PostAsync


    public async Task PostAsync(string endpoint) { await PostAsync(endpoint, null, null, _revAuthService.AccessToken, true); }


    public async Task PostAsync(string endpoint, object inputDto) { await PostAsync(endpoint, inputDto, null, _revAuthService.AccessToken, true); }


    /// <summary>
    ///     Makes POST request without authentication token.
    /// </summary>
    /// <param name="endpoint"></param>
    /// <param name="inputDto"></param>
    /// <returns></returns>
    public async Task PostAnonymousAsync(string endpoint, object inputDto) { await PostAsync(endpoint, inputDto, null, null, true); }


    public async Task PostAsync(string endpoint, object inputDto, object queryParameters) { await PostAsync(endpoint, inputDto, queryParameters, _revAuthService.AccessToken, true); }


    public async Task PostAsync(string endpoint, object inputDto, object queryParameters, string accessToken, bool stripAjaxResponseWrapper) { await PostAsyncInternal<object>(endpoint, inputDto, queryParameters, _revAuthService.AccessToken); }


    #endregion


    #region GetAsync<T>


    public async Task<T> GetAsync<T>(string endpoint) { return await GetAsync<T>(endpoint, null); }


    /// <summary>
    ///     Makes GET request without authentication token.
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="endpoint"></param>
    /// <returns></returns>
    public async Task<T> GetAnonymousAsync<T>(string endpoint) { return await GetAsync<T>(endpoint, null, null); }


    public async Task<T> GetAsync<T>(string endpoint, object queryParameters) { return await GetAsync<T>(endpoint, queryParameters, _revAuthService.AccessToken); }


    public async Task<T> GetAsync<T>(string endpoint, object queryParameters, string accessToken)
    {
        var httpResponse = await endpoint.SetQueryParams(queryParameters).WithAuthentication().WithVbrickRevApiToken(_revAuthService.AccessToken).GetAsync();

        return await ValidateVbrickResponse<T>(httpResponse);
    }


    #endregion


    #region GetAsync


    public async Task GetAsync(string endpoint) { await GetAsync(endpoint, null); }


    public async Task GetAsync(string endpoint, object queryParameters) { await GetAsync(endpoint, queryParameters, _revAuthService.AccessToken); }


    public async Task GetAsync(string endpoint, object queryParameters, string accessToken) { await GetAsync<object>(endpoint, queryParameters, _revAuthService.AccessToken); }


    #endregion


    #region DeleteAsync


    public async Task DeleteAsync(string endpoint) { await DeleteAsync(endpoint, null, _revAuthService.AccessToken); }


    public async Task DeleteAsync(string endpoint, object queryParameters) { await DeleteAsync(endpoint, queryParameters, _revAuthService.AccessToken); }


    public async Task DeleteAsync(string endpoint, object queryParameters, string accessToken) { await DeleteAsync<object>(endpoint, queryParameters, _revAuthService.AccessToken); }


    #endregion


    #region DeleteAsync<T>


    public async Task<T> DeleteAsync<T>(string endpoint) { return await DeleteAsync<T>(endpoint, null); }


    public async Task<T> DeleteAsync<T>(string endpoint, object queryParameters) { return await DeleteAsync<T>(endpoint, queryParameters, _revAuthService.AccessToken); }


    public async Task<T> DeleteAsync<T>(string endpoint, object queryParameters, string accessToken)
    {
        var httpResponse = await endpoint.WithAuthentication().WithVbrickRevApiToken(_revAuthService.AccessToken).SetQueryParams(queryParameters).DeleteAsync();

        return await ValidateVbrickResponse<T>(httpResponse);
    }


    #endregion


    #region PutAsync<T>


    public async Task<T> PutAsync<T>(string endpoint) { return await PutAsync<T>(endpoint, null, null, _revAuthService.AccessToken); }


    public async Task<T> PutAsync<T>(string endpoint, object inputDto) { return await PutAsync<T>(endpoint, inputDto, null, _revAuthService.AccessToken); }


    public async Task<T> PutAsync<T>(string endpoint, object inputDto, object queryParameters) { return await PutAsync<T>(endpoint, inputDto, queryParameters, _revAuthService.AccessToken); }


    public async Task<T> PutAsync<T>(string endpoint, object inputDto, object queryParameters, string accessToken)
    {
        var httpResponse = await endpoint.WithAuthentication().WithVbrickRevApiToken(_revAuthService.AccessToken).SetQueryParams(queryParameters).PutJsonAsync(inputDto);

        return await ValidateVbrickResponse<T>(httpResponse);
    }


    #endregion


    #region PutAsync


    public async Task PutAsync(string endpoint) { await PutAsync(endpoint, null, null, _revAuthService.AccessToken); }


    public async Task PutAsync(string endpoint, object inputDto) { await PutAsync(endpoint, inputDto, null, _revAuthService.AccessToken); }


    public async Task PutAsync(string endpoint, object inputDto, object queryParameters) { await PutAsync(endpoint, inputDto, queryParameters, _revAuthService.AccessToken); }


    public async Task PutAsync(string endpoint, object inputDto, object queryParameters, string accessToken) { await PutAsync<object>(endpoint, inputDto, queryParameters, _revAuthService.AccessToken); }


    #endregion

}