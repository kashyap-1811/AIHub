using System.Text;
using Newtonsoft.Json;

namespace AIHub.API.Services
{
    public class ClaudeService : IAIService
    {
        public string ServiceName => "Claude";
        private readonly HttpClient _httpClient;

        public ClaudeService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string> SendMessageAsync(string message, string apiKey, string? conversationId = null)
        {
            try
            {
                var requestBody = new
                {
                    model = "claude-3-sonnet-20240229",
                    max_tokens = 1000,
                    messages = new[]
                    {
                        new { role = "user", content = message }
                    }
                };

                var json = JsonConvert.SerializeObject(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("x-api-key", apiKey);
                _httpClient.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");

                var response = await _httpClient.PostAsync("https://api.anthropic.com/v1/messages", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseObj = JsonConvert.DeserializeObject<dynamic>(responseContent);
                    return responseObj?.content?[0]?.text ?? "No response received";
                }
                else
                {
                    return $"Error: {response.StatusCode} - {await response.Content.ReadAsStringAsync()}";
                }
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
                var requestBody = new
                {
                    model = "claude-3-sonnet-20240229",
                    max_tokens = 1,
                    messages = new[]
                    {
                        new { role = "user", content = "Hello" }
                    }
                };

                var json = JsonConvert.SerializeObject(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("x-api-key", apiKey);
                _httpClient.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");

                var response = await _httpClient.PostAsync("https://api.anthropic.com/v1/messages", content);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
    }
}
