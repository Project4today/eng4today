const USER_ID = 1;
const API_BASE_URL = "http://localhost:8000/api";

// --- Persona CRUD ---

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
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error creating persona:", error);
    throw error;
  }
}

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
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error updating persona:", error);
    throw error;
  }
}

export async function deletePersona(personaId) {
  try {
    const response = await fetch(`${API_BASE_URL}/personas/${personaId}`, {
      method: 'DELETE',
      headers: { 'accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    // DELETE often returns a 204 No Content, so we might not have a body
    return { success: true };
  } catch (error) {
    console.error("Error deleting persona:", error);
    throw error;
  }
}


// --- Chat Session Management ---

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

export async function getChatHistory(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/${sessionId}`, {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error getting chat history:", error);
    return { history: [] };
  }
}

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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();

  } catch (error) {
    console.error("Error sending message:", error);
    return { role: 'model', content: "Error: Could not get a response from the server." };
  }
}
