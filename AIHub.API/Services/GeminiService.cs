using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AIHub.API.Services
{
    public class GeminiService : IAIService
    {
        public string ServiceName => "OpenRouter";
        private readonly HttpClient _httpClient;

        private const string BaseUrl = "https://openrouter.ai/api/v1";

        public GeminiService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string> SendMessageAsync(string message, string apiKey, string? conversationId = null)
        {
            try
            {
                // request body
                var requestBody = new
                {
                    model = "google/gemini-2.0-flash-exp:free",
                    messages = new[]
                    {
                        new { role = "user", content = message }
                    },
                    max_tokens = 1000,
                    temperature = 0.7
                };

                var json = JsonConvert.SerializeObject(requestBody);
                using var request = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/chat/completions");
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                // Required headers for OpenRouter
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                // request.Headers.Add("HTTP-Referer", "http://localhost"); // ⚠️ must be a real site in production
                // request.Headers.Add("X-Title", "AIHub App");

                using var response = await _httpClient.SendAsync(request);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return $"Error: {response.StatusCode} - {responseContent}";
                }

                // Parse OpenRouter response (same as OpenAI)
                var j = JObject.Parse(responseContent);
                var text = j["choices"]?.First?["message"]?["content"]?.ToString();

                return text ?? "No response received";
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }

        public async Task<bool> ValidateApiKeyAsync(string apiKey)
        {
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Get, $"{BaseUrl}/key");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                // request.Headers.Add("HTTP-Referer", "http://localhost");
                // request.Headers.Add("X-Title", "AIHub App");

                using var response = await _httpClient.SendAsync(request);
                var responseText = await response.Content.ReadAsStringAsync();

                Console.WriteLine($"OpenRouter /key response: {response.StatusCode} - {responseText}");

                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ValidateApiKeyAsync exception: {ex.Message}");
                return false;
            }
        }
    }
}
