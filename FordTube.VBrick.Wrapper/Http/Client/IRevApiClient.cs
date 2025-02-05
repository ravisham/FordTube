using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

using Flurl.Http;
using Flurl.Http.Content;


namespace FordTube.VBrick.Wrapper.Http.Client {

    public interface IRevApiClient {

        Task<T> PostAsync<T>(string endpoint);


        Task<T> PostAsync<T>(string endpoint, object inputDto);


        Task<T> PostAsync<T>(string endpoint, object inputDto, object queryParameters);


        Task PostAsync(string endpoint);


        Task PostAsync(string endpoint, object inputDto);


        Task PostAsync(string endpoint, object inputDto, object queryParameters);


        Task<T> PostAnonymousAsync<T>(string endpoint);


        /// <summary>
        /// Makes POST request without authentication token.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="endpoint"></param>
        /// <param name="inputDto"></param>
        /// <returns></returns>
        Task<T> PostAnonymousAsync<T>(string endpoint, object inputDto);


        /// <summary>
        /// Makes POST request without authentication token.
        /// </summary>
        /// <param name="endpoint"></param>
        /// <param name="inputDto"></param>
        /// <returns></returns>
        Task PostAnonymousAsync(string endpoint, object inputDto);


        Task<byte[]> DownloadAsync(string url);


        Task<Stream> DownloadFileAsync(string url);


        Task<T> PostMultipartAsync<T>(string endpoint, Action<CapturedMultipartContent> buildContent);


       // Task<T> PostMultipartAsync<T>(string endpoint, CapturedMultipartContent content);


        Task<T> PostMultipartAsync<T>(string endpoint, Stream stream, string fileName);


        Task<T> PostMultipartAsync<T>(string endpoint, MemoryStream stream, string fileName, string fileKey);


        Task<T> PostMultipartAsync<T>(string endpoint, string filePath);


        Task<T> PostMultipartAsync<T>(string endpoint, byte[] fileBytes, string fileName, object data, string fileNameParameter = "File");


        Task<bool> PostMultipartAsync(string endpoint, byte[] fileBytes, string fileName, object data, string fileNameParameter = "File");


        Task<T> GetAsync<T>(string endpoint);


        Task<T> GetAsync<T>(string endpoint, object queryParameters);


        Task<T> GetAsync<T>(string endpoint, object queryParameters, string accessToken);


        Task GetAsync(string endpoint);


        Task GetAsync(string endpoint, object queryParameters);


        Task GetAsync(string endpoint, object queryParameters, string accessToken);


        /// <summary>
        /// Makes GET request without authentication token.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="endpoint"></param>
        /// <returns></returns>
        Task<T> GetAnonymousAsync<T>(string endpoint);


        Task<string> GetStringAsync(string endpoint, object queryParameters, string accessToken);


        Task DeleteAsync(string endpoint);


        Task DeleteAsync(string endpoint, object queryParameters);


        Task DeleteAsync(string endpoint, object queryParameters, string accessToken);


        Task<T> DeleteAsync<T>(string endpoint);


        Task<T> DeleteAsync<T>(string endpoint, object queryParameters);


        Task<T> DeleteAsync<T>(string endpoint, object queryParameters, string accessToken);


        Task<T> PutAsync<T>(string endpoint);


        Task<T> PutAsync<T>(string endpoint, object inputDto);


        Task<T> PutAsync<T>(string endpoint, object inputDto, object queryParameters);


        Task<T> PutAsync<T>(string endpoint, object inputDto, object queryParameters, string accessToken);


        Task PutAsync(string endpoint);


        Task PutAsync(string endpoint, object inputDto);


        Task PutAsync(string endpoint, object inputDto, object queryParameters);


        Task PutAsync(string endpoint, object inputDto, object queryParameters, string accessToken);


        HttpWebResponse MultipartFormDataPost(string url, Dictionary<string, object> postParameters, HttpMethod method);


        Task<string> MultipartFormDataPostAsync<T>(string url, Dictionary<string, object> postParameters, HttpMethod method);

    }

}