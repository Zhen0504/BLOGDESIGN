// The UI intentionally stays offline until a server endpoint is configured.
export const suggestionService = {
  async submitSuggestion() {
    return { available: false, reason: 'suggestion-service-unavailable' }
  },
  async getPublicSuggestions() {
    return { available: false, items: [] }
  },
}

/*
Future server contract:
- validate and normalize message text on the server;
- rate-limit anonymous submissions and protect against abuse;
- persist new suggestions as private by default;
- expose only administrator-approved public entries and replies;
- keep moderation permissions, credentials, and secrets off the client.
*/
