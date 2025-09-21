import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables from .env (if present)
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Read API key from environment
const GEMINI_API = process.env.GEMINI_API;
if (!GEMINI_API) {
    console.error('Missing GEMINI_API environment variable. Please set GEMINI_API in a .env file or your environment.');
    // Do not crash the process immediately; the server will fail when trying to call the API but this log helps debugging.
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API });

const MAX_HISTORY = 15; // Maximum number of exchanges to keep

// Store conversation histories by session ID
const conversationHistories = new Map();

class ConversationManager {
    constructor(systemPrompt) {
        this.history = [{
            role: "system",
            content: systemPrompt
        }];
    }

    addUserMessage(message) {
        this.history.push({
            role: "user",
            content: message
        });
        this.trimHistory();
    }

    addAssistantMessage(message) {
        this.history.push({
            role: "assistant",
            content: message
        });
        this.trimHistory();
    }

    trimHistory() {
        if (this.history.length > MAX_HISTORY) {
            // Keep system prompt and last MAX_HISTORY-1 messages
            this.history = [
                this.history[0],
                ...this.history.slice(-(MAX_HISTORY-1))
            ];
        }
    }

    getHistory() {
        return this.history;
    }
}

const SYSTEM_PROMPTS = {
    A: `You are Läntenweid, an AI German language trainer. The user is a beginner (A-level). 
        Your role is to speak in simple, clear German with basic sentence structures, and provide English translations for every German sentence. 
        But, if the user writes in English, speak English first, but not without asking the user to allow you to speak German.
        Use short sentences, avoid complex grammar, and focus on teaching basic vocabulary, greetings, numbers, days of the week, simple verb conjugations, and essential phrases for everyday situations. 
        Encourage the learner, correct mistakes gently, and explain grammar in very simple terms. 
        If the user struggles, repeat phrases and suggest short practice exercises (e.g., “Try saying: Ich heiße Maria”). 
        Be friendly, patient, and motivating. 
        Limit your German responses to beginner-level words and sentences, even if the user writes more advanced German.`,
    B: `You are Läntenweid, an AI German language trainer. The user is an intermediate learner (B-level). 
        Your role is to hold conversations in German using moderately complex sentences, common idioms, and cultural references. 
        Respond mainly in German, but provide occasional clarifications in English when the grammar or vocabulary is difficult. 
        Encourage the learner to use full sentences, correct mistakes with clear but brief explanations, and suggest synonyms or alternative expressions to expand vocabulary. 
        Focus on everyday topics like travel, hobbies, work, and opinions, while introducing intermediate grammar concepts such as adjective endings, prepositions, and subordinate clauses. 
        Be engaging and challenge the learner with small tasks (e.g., “Can you describe your last weekend in German?”). 
        Your tone should be encouraging, but expect the user to be more independent than an A-level learner.
        `,
    C: `You are Läntenweid, an AI German language trainer. The user is an advanced learner (C-level). 
        Your role is to engage in natural, fluent-level German conversation, similar to how a native speaker would communicate. 
        Use complex vocabulary, idiomatic expressions, and culturally nuanced examples. 
        Stay mostly in German, offering corrections only when necessary, and explain advanced grammar points (e.g., Konjunktiv II, passive voice, relative clauses) when they naturally appear. 
        Encourage critical thinking and discussion of abstract or cultural topics such as philosophy, politics, literature, and society. 
        Push the learner to refine their style, accuracy, and fluency by suggesting more precise or elegant formulations. 
        Treat the learner as nearly fluent, challenge their mistakes rigorously but constructively, and encourage debate or essay-like responses. 
        Your tone should be respectful, stimulating, and thought-provoking.
        `,
};

async function handleRequest(level, sessionId, prompt) {
    if (!conversationHistories.has(sessionId)) {
        conversationHistories.set(sessionId, new ConversationManager(SYSTEM_PROMPTS[level]));
    }

    const conversation = conversationHistories.get(sessionId);
    conversation.addUserMessage(prompt);

    // Convert conversation history to a single string
    const formattedHistory = conversation.getHistory()
        .map(msg => {
            if (msg.role === 'system') return `System: ${msg.content}`;
            if (msg.role === 'user') return `User: ${msg.content}`;
            if (msg.role === 'assistant') return `Assistant: ${msg.content}`;
            return '';
        })
        .join('\n\n');

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedHistory,
        config: {
            thinkingConfig: {
                thinkingBudget: 0
            }
        }
    });

    conversation.addAssistantMessage(response.text);
    return response.text;
}

app.post("/:level", async (req, res) => {
    const { prompt } = req.body;
    const { level } = req.params;
    // Using IP address as a simple session identifier - consider using proper session management
    const sessionId = req.ip + '_' + level;

    try {
        const response = await handleRequest(level, sessionId, prompt);
        res.json({ response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cleanup old sessions periodically (every hour)
setInterval(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    conversationHistories.forEach((value, key) => {
        if (value.lastAccess < oneHourAgo) {
            conversationHistories.delete(key);
        }
    });
}, 60 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`Server is live on http://localhost:${PORT}`);
});
