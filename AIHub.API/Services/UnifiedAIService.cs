using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AIHub.API.Services
{
    public class UnifiedAIService : IAIService
    {
        public string ServiceName => "UnifiedAI";
        private readonly HttpClient _httpClient;
        private const string OpenRouterBase = "https://openrouter.ai/api/v1";

        // Model configurations for different AI services
        private static readonly Dictionary<string, (string ModelName, int MaxTokens, double Temperature)> ModelConfigs = new()
        {
            ["ChatGPT"] = ("openai/gpt-oss-20b:free", 1000, 0.7),
            ["Gemini"] = ("google/gemini-2.5-flash", 1000, 0.7),
            ["Claude"] = ("anthropic/claude-sonnet-4", 1000, 0.7),
            ["DeepSeek"] = ("deepseek/deepseek-chat-v3.1:free", 1000, 0.7)  
        };

        public UnifiedAIService(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient("Default");
        }

        public async Task<string> SendMessageAsync(string message, string apiKey, string serviceName)
        {
            // Extract service name from conversationId or use default
            var config = ModelConfigs[serviceName];

            try
            {
                var requestBody = new
                {
                    model = config.ModelName,
                    messages = new[]
                    {
                        new { role = "user", content = message }
                    },
                    max_tokens = config.MaxTokens,
                    temperature = config.Temperature
                };

                var json = JsonConvert.SerializeObject(requestBody);
                using var request = new HttpRequestMessage(HttpMethod.Post, $"{OpenRouterBase}/chat/completions");
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                // Required headers for OpenRouter
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                request.Headers.Add("HTTP-Referer", "http://localhost");
                request.Headers.Add("X-Title", "AIHub App");

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
                request.Headers.Add("HTTP-Referer", "http://localhost");
                request.Headers.Add("X-Title", "AIHub App");

                using var response = await _httpClient.SendAsync(request);
                var responseBody = await response.Content.ReadAsStringAsync();

                Console.WriteLine($"API key validation:");
                Console.WriteLine($"{response.StatusCode} - {responseBody}");

                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ValidateApiKeyAsync exception: {ex.Message}");
                return false;
            }
        }

        // Method to send message with specific service configuration
        public async Task<string> SendMessageAsync(string message, string apiKey, string serviceName, int? maxTokens = null, double? temperature = null)
        {
            if (!ModelConfigs.TryGetValue(serviceName, out var config))
            {
                throw new ArgumentException($"Unknown service: {serviceName}");
            }

            var (modelName, defaultMaxTokens, defaultTemperature) = config;

            try
            {
                var requestBody = new
                {
                    model = modelName,
                    messages = new[]
                    {
                        new { role = "user", content = message }
                    },
                    max_tokens = maxTokens ?? defaultMaxTokens,
                    temperature = temperature ?? defaultTemperature
                };

                var json = JsonConvert.SerializeObject(requestBody);
                using var request = new HttpRequestMessage(HttpMethod.Post, $"{OpenRouterBase}/chat/completions");
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                // Required headers for OpenRouter
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                request.Headers.Add("HTTP-Referer", "http://localhost");
                request.Headers.Add("X-Title", "AIHub App");

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
    }
}
