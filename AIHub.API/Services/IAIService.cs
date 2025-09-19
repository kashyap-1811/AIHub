namespace AIHub.API.Services
{
    public interface IAIService
    {
        string ServiceName { get; }
        Task<string> SendMessageAsync(string message, string apiKey, string? conversationId = null);
        Task<bool> ValidateApiKeyAsync(string apiKey);
    }
}
