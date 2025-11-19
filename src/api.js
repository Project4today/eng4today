const USER_ID = 1;
const API_BASE_URL = "http://localhost:8000/api";

/**
 * Fetches the list of all available personas.
 * GET /api/personas/
 */
export async function getPersonas() {
  try {
    const response = await fetch(`${API_BASE_URL}/personas/`, {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching personas:", error);
    return [];
  }
}

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
    return await response.json();
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    return [];
  }
}

/**
 * Starts a new chat session with a specific persona.
 * POST /api/chat/start
 */
export async function startNewChat(persona_id) {
  try {
    const body = { 
      user_id: USER_ID,
      persona_id: persona_id 
    };

    const response = await fetch(`${API_BASE_URL}/chat/start`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
        const errorBody = await response.json();
        console.error("Error creating chat session:", errorBody.detail || `Status: ${response.status}`);
        throw new Error(errorBody.detail || `Failed to start chat. Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in startNewChat:", error);
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
    // Assuming the session details (like persona_id) are returned with the history
    return data;
  } catch (error) {
    console.error("Error getting chat history:", error);
    return { history: [] };
  }
}

/**
 * Sends a message to a specific chat session.
 * Can optionally include a persona_id to update the session's default persona.
 * POST /api/chat/{session_id}/message
 */
export async function sendMessage(sessionId, message, persona_id = null) {
  try {
    const body = {
      message,
    };
    if (persona_id) {
      body.persona_id = persona_id;
    }

    const response = await fetch(`${API_BASE_URL}/chat/${sessionId}/message`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();

  } catch (error) {
    console.error("Error sending message:", error);
    return { role: 'model', content: "Error: Could not get a response from the server. Please ensure the backend is running and CORS is configured." };
  }
}
