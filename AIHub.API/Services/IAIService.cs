namespace AIHub.API.Services
{
    public interface IAIService
    {
        string ServiceName { get; }
        Task<string> SendMessageAsync(string message, string apiKey, string serviceName);
        Task<bool> ValidateApiKeyAsync(string apiKey);
    }
}
