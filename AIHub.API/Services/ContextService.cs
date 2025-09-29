using AIHub.API.Models;
using AIHub.API.Repositories;
using System.Text;

namespace AIHub.API.Services
{
    public class ContextService : IContextService
    {
        private readonly IContextSummaryRepository _contextSummaryRepository;
        private readonly IMessageRepository _messageRepository;

        public ContextService(IContextSummaryRepository contextSummaryRepository, IMessageRepository messageRepository)
        {
            _contextSummaryRepository = contextSummaryRepository;
            _messageRepository = messageRepository;
        }

        public async Task<string> GetContextSummaryAsync(string chatSessionId)
        {
            var contextSummary = await _contextSummaryRepository.GetByChatSessionIdAsync(chatSessionId);
            return contextSummary?.Summary ?? string.Empty;
        }

        public async Task UpdateContextSummaryAsync(string chatSessionId, List<Message> recentMessages)
        {
            // Get the last 15 messages for context
            var last15Messages = recentMessages
                .OrderBy(m => m.CreatedAt)
                .TakeLast(15)
                .ToList();

            if (last15Messages.Count == 0)
                return;

            // Generate new context summary
            var newSummary = GenerateContextSummary(last15Messages);

            // Get or create context summary
            var contextSummary = await _contextSummaryRepository.GetByChatSessionIdAsync(chatSessionId);
            
            if (contextSummary == null)
            {
                contextSummary = new ContextSummary
                {
                    ChatSessionId = chatSessionId,
                    Summary = newSummary,
                    MessageCount = last15Messages.Count
                };
                await _contextSummaryRepository.CreateAsync(contextSummary);
            }
            else
            {
                contextSummary.Summary = newSummary;
                contextSummary.MessageCount = last15Messages.Count;
                await _contextSummaryRepository.UpdateAsync(contextSummary);
            }
        }

        public string GenerateContextSummary(List<Message> messages)
        {
            if (messages.Count == 0)
                return string.Empty;

            var summary = new StringBuilder();
            var userMessages = new List<string>();
            var aiMessages = new List<string>();

            // Separate user and AI messages
            foreach (var message in messages)
            {
                if (message.Role == "user")
                {
                    userMessages.Add(message.Content);
                }
                else if (message.Role == "assistant")
                {
                    aiMessages.Add(message.Content);
                }
            }

            // Create a concise summary
            summary.Append("Recent conversation context: ");

            // Add key topics from user messages
            if (userMessages.Count > 0)
            {
                var userTopics = ExtractKeyTopics(userMessages);
                if (!string.IsNullOrEmpty(userTopics))
                {
                    summary.Append($"User discussed: {userTopics}. ");
                }
            }

            // Add key topics from AI responses
            if (aiMessages.Count > 0)
            {
                var aiTopics = ExtractKeyTopics(aiMessages);
                if (!string.IsNullOrEmpty(aiTopics))
                {
                    summary.Append($"AI provided: {aiTopics}. ");
                }
            }

            // Add conversation flow
            summary.Append($"Total messages: {messages.Count}. ");

            // Add recent user intent
            var lastUserMessage = messages.LastOrDefault(m => m.Role == "user");
            if (lastUserMessage != null)
            {
                var intent = ExtractIntent(lastUserMessage.Content);
                if (!string.IsNullOrEmpty(intent))
                {
                    summary.Append($"Current focus: {intent}.");
                }
            }

            var result = summary.ToString();
            
            // Ensure summary is max 500 characters
            if (result.Length > 500)
            {
                result = result.Substring(0, 497) + "...";
            }

            return result;
        }

        private string ExtractKeyTopics(List<string> messages)
        {
            var topics = new List<string>();
            var commonWords = new HashSet<string> { "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "can", "this", "that", "these", "those", "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them" };

            foreach (var message in messages)
            {
                var words = message.ToLower()
                    .Split(new char[] { ' ', '\n', '\r', '\t', '.', ',', '!', '?', ';', ':', '(', ')', '[', ']', '{', '}', '"', '\'' }, StringSplitOptions.RemoveEmptyEntries)
                    .Where(w => w.Length > 3 && !commonWords.Contains(w))
                    .GroupBy(w => w)
                    .OrderByDescending(g => g.Count())
                    .Take(3)
                    .Select(g => g.Key);

                topics.AddRange(words);
            }

            return string.Join(", ", topics.Distinct().Take(5));
        }

        private string ExtractIntent(string message)
        {
            var lowerMessage = message.ToLower();
            
            if (lowerMessage.Contains("explain") || lowerMessage.Contains("what is") || lowerMessage.Contains("how does"))
                return "seeking explanation";
            if (lowerMessage.Contains("help") || lowerMessage.Contains("how to"))
                return "requesting help";
            if (lowerMessage.Contains("code") || lowerMessage.Contains("programming") || lowerMessage.Contains("function"))
                return "programming assistance";
            if (lowerMessage.Contains("error") || lowerMessage.Contains("problem") || lowerMessage.Contains("issue"))
                return "troubleshooting";
            if (lowerMessage.Contains("create") || lowerMessage.Contains("build") || lowerMessage.Contains("make"))
                return "creation request";
            if (lowerMessage.Contains("compare") || lowerMessage.Contains("difference") || lowerMessage.Contains("vs"))
                return "comparison request";
            if (lowerMessage.Contains("example") || lowerMessage.Contains("show me"))
                return "example request";

            // Extract first few words as intent
            var words = message.Split(' ', StringSplitOptions.RemoveEmptyEntries).Take(4);
            return string.Join(" ", words).ToLower();
        }
    }
}
