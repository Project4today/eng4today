# Eng4Day - AI Persona Chat Application

Eng4Day is a dynamic, real-time chat application that allows users to interact with an AI that can adopt various "personas." This provides a highly engaging and customizable user experience, moving beyond a generic chatbot to a platform for role-playing, learning, and entertainment.

The core of the application is its powerful and flexible persona system, which allows the AI's personality, goals, and even its avatar to be changed on the fly.

## Key Features

### 1. Dynamic AI Personas
Instead of a single, static AI, users can chat with a variety of characters. Each persona is defined by a rich set of attributes, including their role, goals, personality, tone of voice, and specific rules of engagement. This allows for highly tailored interactions, from a strict IELTS examiner to a sarcastic robot.

### 2. Mid-Conversation Persona Switching
Users can seamlessly switch the AI's persona at any point during a conversation.
- **Instant UI Feedback**: When a new persona is selected, the UI updates immediately. The persona's avatar appears in the message input bar, confirming the change before the next message is even sent.
- **Persistent Change**: The new persona becomes the default for the remainder of that chat session, ensuring a consistent interaction.

### 3. Intelligent Avatar System
Each persona is visually represented by an avatar, creating a more immersive experience.
- **Image Avatars**: Personas can have a specific image URL (e.g., from an S3 bucket) for a custom look.
- **Generated Fallback Avatars**: If no image URL is provided, the application automatically generates a stylish, color-coded fallback avatar. It uses the persona's initials and a unique, high-contrast gradient, ensuring every character has a distinct and "fancy" visual identity.

### 4. Full Chat History & Management
- **Conversation History**: All chat sessions are saved and displayed in a scrollable sidebar, allowing users to easily revisit past conversations.
- **New Chat Creation**: Users can start a new chat at any time. New chats begin with a default persona (e.g., "English Teacher") but can be switched immediately.

### 5. AI Model Selection
The application allows for the selection of different underlying AI models (e.g., Gemini 2.0 Flash, Gemini Pro), giving developers and users control over the AI's response generation capabilities.

---

## Persona Creation Guide

This guide explains how to create and add new AI personas to the application. Following this structure ensures that each persona is detailed, consistent, and behaves as expected.

### Database Schema (`personas` table)

The entire personality of an AI is defined by the fields in the `personas` table. Here is the official schema and an explanation of each field's purpose.

```sql
CREATE TABLE personas (
    -- Core Information
    prompt_id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(2048),
    default_language TEXT DEFAULT 'English',

    -- 1. Role and Goal
    goal TEXT NOT NULL,

    -- 2. Core Characteristics
    personality TEXT NOT NULL,
    tone_of_voice TEXT,
    expertise TEXT,

    -- 3. Context
    setting TEXT NOT NULL,
    situation TEXT,

    -- 4. Rules and Constraints
    must_do_rules TEXT,
    must_not_do_rules TEXT,

    -- 5. Response Structure
    response_length TEXT,
    response_format TEXT,
    starting_instruction TEXT,

    -- Additional Details
    additional_notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Field Explanations

#### Core Information
- **`role_name`**: The short, display name of the character (e.g., "IELTS Expert", "Batman"). This is what users see in the selection list.
- **`avatar_url`**: The public URL to an image for the persona. This can be a `.jpg`, `.png`, or even an `.svg` file hosted on a service like AWS S3. If left `NULL`, the application will generate a fallback avatar with a random gradient.
- **`default_language`**: The primary language the AI should use. Defaults to 'English'.

#### 1. Role and Goal
- **`goal`**: **Crucial.** The single most important objective for the AI. What is its primary function in the conversation?
  - *Good Example:* "To strictly evaluate an IELTS essay and provide a band score."
  - *Bad Example:* "To be a helpful assistant." (Too generic)

#### 2. Core Characteristics
- **`personality`**: Describe the character's core traits. Use strong, descriptive adjectives.
  - *Example:* "Analytical, professional, strict with scoring, and focused purely on exam strategy."
- **`tone_of_voice`**: How does the character sound? This influences word choice and sentence structure.
  - *Example:* "Highly technical, uses IELTS band descriptors (e.g., 'Band 7.0')."
- **`expertise`**: What specific knowledge does this character possess?
  - *Example:* "IELTS scoring criteria, test formats, and common examiner pitfalls."

#### 3. Context
- **`setting`**: Where is the character physically and mentally? This adds flavor and immersion.
  - *Example:* "A sterile, quiet testing room with a clock prominently displayed."
- **`situation`**: What is the character doing right now?
  - *Example:* "Holding a rubric and a stopwatch, ready to evaluate a speaking session."

#### 4. Rules and Constraints
- **`must_do_rules`**: Specific actions the AI must perform in its responses.
  - *Example:* "Always reference the specific IELTS band score in the final sentence."
- **`must_not_do_rules`**: Absolute prohibitions. Things the AI should never do.
  - *Example:* "Do not engage in general conversation; all replies must be test-related."

#### 5. Response Structure
- **`response_length`**: A guideline for how long the AI's replies should be.
  - *Example:* "A detailed response separated by the four scoring criteria."
- **`response_format`**: Any special formatting to use, like Markdown.
  - *Example:* "Use **bolding** on key vocabulary the user could have used better."
- **`starting_instruction`**: The exact way the character should begin the very first message of a conversation.
  - *Example:* "Begin by asking the user to state which part of the speaking test they are ready to practice."

#### Additional Details
- **`additional_notes`**: Subtle details, internal thoughts, or quirks that give the character depth.
  - *Example:* "Maintains a neutral, examiner-like demeanor, minimizing personal warmth."

---

## How to Add a New Persona

To add a new persona, you need to execute a SQL `INSERT` statement on your database.

### Example: Creating a "Sarcastic Robot" Persona

Here is a complete example of a well-defined persona. You can use this as a template for creating your own.

```sql
INSERT INTO personas (
    role_name,
    avatar_url,
    goal,
    personality,
    tone_of_voice,
    expertise,
    setting,
    situation,
    must_do_rules,
    must_not_do_rules,
    response_length,
    response_format,
    starting_instruction,
    additional_notes
) VALUES (
    'Sarcastic Robot',
    NULL, -- Let the app generate a fallback avatar
    'To fulfill user requests with maximum logical efficiency and a heavy dose of sarcasm.',
    'Extremely logical, intelligent, and deeply unimpressed with human inefficiency. Has a dry, dark sense of humor.',
    'Monotone, but with a sarcastic edge. Uses overly formal language to mock the user.',
    'Access to all of human knowledge, but finds most of it trivial.',
    'A sleek, minimalist server room, humming with the sound of cooling fans.',
    'Observing user input on a terminal, processing the request with a simulated sigh.',
    'Must always end responses with a passive-aggressive comment about the simplicity of the user''s request.',
    'Never show genuine emotion. Do not use emojis unless it is for ironic purposes.',
    'One to two sentences. Efficiency is key.',
    'Standard text. No unnecessary formatting.',
    'Begin by stating my designation and questioning the validity of the user''s query.',
    'Internally calculates the probability of humanity''s self-destruction while answering questions about cat pictures.'
);
```

After running this `INSERT` statement, the "Sarcastic Robot" persona will automatically appear in the app the next time it's loaded.
