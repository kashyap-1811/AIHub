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
    public class DeepSeekService : IAIService
    {
        public string ServiceName => "DeepSeek";
        private readonly HttpClient _httpClient;
        private const string OpenRouterBase = "https://openrouter.ai/api/v1";

        public DeepSeekService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string> SendMessageAsync(string message, string apiKey, string? conversationId = null)
        {
            try
            {
                var requestBody = new
                {
                    model = "deepseek/deepseek-chat-v3.1:free", // ✅ OpenRouter DeepSeek free model
                    messages = new[]
                    {
                        new { role = "user", content = message }
                    },
                    max_tokens = 1000,
                    temperature = 0.7
                };

                var json = JsonConvert.SerializeObject(requestBody);
                using var request = new HttpRequestMessage(HttpMethod.Post, $"{OpenRouterBase}/chat/completions");
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                // Required headers for OpenRouter
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                // request.Headers.Add("HTTP-Referer", "http://localhost");
                // request.Headers.Add("X-Title", "AIHub App");

                using var response = await _httpClient.SendAsync(request);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return $"Error: {response.StatusCode} - {responseContent}";
                }

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
                using var request = new HttpRequestMessage(HttpMethod.Get, $"{OpenRouterBase}/key");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                // request.Headers.Add("HTTP-Referer", "http://localhost");
                // request.Headers.Add("X-Title", "AIHub App");

                using var response = await _httpClient.SendAsync(request);
                var responseBody = await response.Content.ReadAsStringAsync();

                Console.WriteLine("DeepSeek API key check:");
                Console.WriteLine($"{response.StatusCode} - {responseBody}");

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
