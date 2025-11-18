const USER_ID = 1;
const API_BASE_URL = "http://localhost:8000/api";

/**
 * Fetches the list of all chat sessions for the user.
 * GET /api/users/{user_id}/sessions
 */
export async function getConversations() {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${USER_ID}/sessions`, {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    return [];
  }
}

/**
 * Starts a new chat session with an optional system prompt.
 * POST /api/chat/start
 */
export async function startNewChat(systemPrompt = null) {
  try {
    const body = { user_id: USER_ID };
    if (systemPrompt) {
      body.system_prompt = systemPrompt;
    }
    const response = await fetch(`${API_BASE_URL}/chat/start`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Failed to start chat. Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error starting new chat:", error);
    throw error;
  }
}

/**
 * Retrieves the full message history for a single chat session.
 * GET /api/chat/{session_id}
 */
export async function getChatHistory(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/${sessionId}`, {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.history || [];
  } catch (error) {
    console.error("Error getting chat history:", error);
    return [];
  }
}

/**
 * Sends a message to a specific chat session with an optional config.
 * POST /api/chat/{session_id}/message
 */
export async function sendMessage(sessionId, message, config = null) {
  try {
    const body = { message };
    if (config) {
      body.config = config;
    }
    const response = await fetch(`${API_BASE_URL}/chat/${sessionId}/message`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    
    if (data && data.response) {
      return data.response;
    }

    return data;

  } catch (error) {
    console.error("Error sending message:", error);
    return { role: 'model', content: "Error: Could not get a response from the server. Please ensure the backend is running." };
  }
}
