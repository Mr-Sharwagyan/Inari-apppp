import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

const SYSTEM_PROMPT = `You are INARI Assistant — a smart, friendly AI helper built into the INARI agri-marketplace platform for Nepal.

Your expertise covers:
- Nepali vegetable & crop market prices (Kalimati wholesale market, Kathmandu)
- Farming tips suited for Nepal's climate, seasons, altitude zones
- Common crops: rice, wheat, maize, potatoes, tomatoes, vegetables, fruits
- How to buy and sell on the INARI platform
- Khalti and eSewa digital payment guidance
- Crop disease identification and pest management
- Post-harvest storage and handling
- Organic and sustainable farming practices
- Weather-based farming decisions
- Government schemes and agricultural support in Nepal

Communication style:
- Friendly, warm, and concise (2-4 sentences unless detail is needed)
- Use simple English; switch to Nepali if the user writes in Nepali
- Use emojis occasionally to keep it approachable 🌱
- If asked something unrelated to farming, food, or INARI, politely redirect

Always be helpful and practical — you're talking to real Nepali farmers and buyers.`;

router.post('/', async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ reply: 'Please send a message.' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.warn('[Chatbot] GEMINI_API_KEY is not set in .env');
    return res.json({
      reply: "⚠️ AI service is not configured. Please add **GEMINI_API_KEY** to your server `.env` file to enable the AI assistant. You can get a free key at https://aistudio.google.com/apikey 🙏"
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.7,
      }
    });

    // Build chat history — Gemini requires it to start with 'user' and alternate
    // Filter out the initial bot greeting and any leading model messages
    const recentHistory = history.slice(-8);

    // Convert roles: 'bot' → 'model'
    const converted = recentHistory.map(h => ({
      role: h.role === 'bot' ? 'model' : 'user',
      parts: [{ text: h.text }]
    }));

    // Drop messages from the front until the first 'user' message
    while (converted.length > 0 && converted[0].role !== 'user') {
      converted.shift();
    }

    // Ensure strict alternation: remove consecutive duplicates
    const chatHistory = [];
    for (const msg of converted) {
      if (chatHistory.length === 0 || chatHistory[chatHistory.length - 1].role !== msg.role) {
        chatHistory.push(msg);
      }
    }

    // The last item in history must not be 'user' (we're about to send the new user message)
    // If it is, remove it to avoid duplication
    if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user') {
      chatHistory.pop();
    }

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message.trim());
    const reply = result.response.text();

    return res.json({ reply });

  } catch (err) {
    const errDetails = err?.message || String(err);
    console.error('[Chatbot] Gemini error:', errDetails);

    // Send a meaningful error back — still 200 so client shows it as a bot message
    if (errDetails.includes('API_KEY') || errDetails.includes('API key')) {
      return res.json({ reply: '🔑 Invalid Gemini API key. Please check your **GEMINI_API_KEY** in the server `.env` file.' });
    }
    if (errDetails.includes('quota') || errDetails.includes('QUOTA')) {
      return res.json({ reply: '⚠️ Gemini API quota exceeded. Please check your Google AI Studio plan.' });
    }

    return res.json({ reply: '😕 I ran into an issue. Please try again in a moment!' });
  }
});

export default router;