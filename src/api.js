const USER_ID = 1;
const API_BASE_URL = "http://superapp-e4td-alb-822218788.us-east-1.elb.amazonaws.com/api";

// Cách gọi chuẩn của Vite
const apiUrl = import.meta.env.VITE_API_URL;

console.log("🔥 API URL hien tai la:", apiUrl); // Thêm dòng này để debug

// Helper function to handle API responses and throw errors for non-OK statuses
async function handleResponse(response) {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  if (!response.ok) {
    let errorDetail = `HTTP error! status: ${response.status}`;
    if (isJson) {
      try {
        const errorBody = await response.json();
        if (errorBody.detail) {
          errorDetail = errorBody.detail;
        }
      } catch {
        // Parsing failed
      }
    }
    throw new Error(errorDetail);
  }

  if (!isJson) {
    // If we get 200 OK but it's not JSON, it's likely the HTML fallback (CloudFront/SPA issue)
    const text = await response.text();
    console.error("Received non-JSON response from API:", text.substring(0, 100)); // Log first 100 chars
    throw new Error("API returned non-JSON response (likely HTML). Check CloudFront configuration.");
  }

  return response.json();
}

// --- Voices ---
/**
 * @typedef {Object} Voice
 * @property {string} id
 * @property {string} name
 * @property {string} gender
 * @property {string} language_code
 * @property {string} language_name
 */

/**
 * Fetches all available voices from the API.
 * @returns {Promise<Voice[]>} A promise that resolves to an array of voice objects.
 */
export async function getVoices() {
  try {
    const response = await fetch(`${API_BASE_URL}/voices`, {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching voices:", error);
    throw error;
  }
}


// --- Persona CRUD ---

/**
 * @typedef {Object} Persona
 * @property {number} prompt_id
 * @property {string} role_name
 * @property {string} prompt_content
 * @property {string} [gradient]
 */

/**
 * Fetches all personas from the API.
 * @returns {Promise<Persona[]>} A promise that resolves to an array of persona objects.
 */
export async function getPersonas() {
  try {
    const response = await fetch(`${API_BASE_URL}/personas/`, {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status} when fetching personas`);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Network or unexpected error fetching personas:", error);
    return [];
  }
}

/**
 * Creates a new persona.
 * @param {Omit<Persona, 'prompt_id'>} personaData - The data for the new persona.
 * @returns {Promise<Persona>} A promise that resolves to the created persona object.
 */
export async function createPersona(personaData) {
  try {
    const response = await fetch(`${API_BASE_URL}/personas`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(personaData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error creating persona:", error);
    throw error;
  }
}

/**
 * Updates an existing persona.
 * @param {number} personaId - The ID of the persona to update.
 * @param {Partial<Persona>} personaData - The updated data for the persona.
 * @returns {Promise<Persona>} A promise that resolves to the updated persona object.
 */
export async function updatePersona(personaId, personaData) {
  try {
    const response = await fetch(`${API_BASE_URL}/personas/${personaId}`, {
      method: 'PUT',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(personaData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error updating persona:", error);
    throw error;
  }
}

/**
 * Deletes a persona.
 * @param {number} personaId - The ID of the persona to delete.
 * @returns {Promise<{success: boolean}>} A promise that resolves to an object indicating success.
 */
export async function deletePersona(personaId) {
  try {
    const response = await fetch(`${API_BASE_URL}/personas/${personaId}`, {
      method: 'DELETE',
      headers: { 'accept': 'application/json' },
    });
    // DELETE often returns a 204 No Content, so we might not have a body
    if (!response.ok) {
      await handleResponse(response); // This will throw the error
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting persona:", error);
    throw error;
  }
}


// --- Chat Session Management ---

/**
 * @typedef {Object} ConversationMeta
 * @property {string} session_id
 * @property {string} updated_at
 * @property {string} title
 * @property {number} user_id
 * @property {number} persona_id
 */

/**
 * Fetches conversation metadata for the current user.
 * @returns {Promise<ConversationMeta[]>} A promise that resolves to an array of conversation metadata objects.
 */
export async function getConversations() {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${USER_ID}/sessions`, {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status} when fetching conversations`);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Network or unexpected error fetching conversation history:", error);
    return [];
  }
}

/**
 * @typedef {Object} Message
 * @property {'user' | 'model'} role
 * @property {string} content
 */

/**
 * @typedef {Object} ChatSessionData
 * @property {string} session_id
 * @property {number} user_id
 * @property {number | null} persona_id
 * @property {Message[]} history
 */

/**
 * Starts a new chat session.
 * @param {number} persona_id - The ID of the persona to use for the new chat.
 * @returns {Promise<ChatSessionData>} A promise that resolves to the new chat session data.
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
    return await handleResponse(response);
  } catch (error) {
    console.error("Error in startNewChat:", error);
    throw error;
  }
}

/**
 * Fetches the chat history for a given session.
 * @param {string} sessionId - The ID of the chat session.
 * @returns {Promise<ChatSessionData>} A promise that resolves to the chat session data including history.
 */
export async function getChatHistory(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/${sessionId}`, {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status} when getting chat history for session ${sessionId}`);
      // Return a complete ChatSessionData object with placeholder values
      return {
        session_id: sessionId,
        user_id: USER_ID,
        persona_id: null, // Persona ID is unknown in this error path
        history: [],
      };
    }
    return await response.json();
  } catch (error) {
    console.error(`Network or unexpected error getting chat history for session ${sessionId}:`, error);
    // Return a complete ChatSessionData object with placeholder values
    return {
      session_id: sessionId,
      user_id: USER_ID,
      persona_id: null, // Persona ID is unknown in this error path
      history: [],
    };
  }
}

/**
 * Sends a message in a chat session.
 * @param {string} sessionId - The ID of the chat session.
 * @param {string} message - The message content.
 * @param {number | null} persona_id - Optional. The ID of the persona to use for this message.
 * @returns {Promise<ChatSessionData>} A promise that resolves to the updated chat session data.
 */
export async function sendMessage(sessionId, message, persona_id = null) {
  try {
    const body = { message };
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
      console.error(`HTTP error! status: ${response.status} when sending message to session ${sessionId}`);
      // The JSDoc for sendMessage indicates it returns ChatSessionData,
      // so returning a complete object here to match the type.
      return { 
        session_id: sessionId, 
        user_id: USER_ID, 
        persona_id: persona_id, 
        history: [{ role: 'model', content: "Error: Could not get a response from the server." }] 
      };
    }
    
    return await response.json();

  } catch (error) {
    console.error(`Network or unexpected error sending message to session ${sessionId}:`, error);
    // Returning a complete object to match the JSDoc type on network errors as well.
    return { 
      session_id: sessionId, 
      user_id: USER_ID, 
      persona_id: persona_id, 
      history: [{ role: 'model', content: "Error: Could not get a response from the server." }] 
    };
  }
}
