import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const port = Number(process.env.PORT) || 3000;

// Initialize Gemini SDK with User-Agent header for telemetry
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System prompt for Motostrada Loan & Sales Consultant and Language Partner
const SYSTEM_PROMPT_CONSULTANT = `You are an elite motorcycle sales consultant and finance specialist for the authorized CFMOTO Dealership located at 141 8th St corner 11th Ave. Grace Park, Caloocan City.
You specialize in CFMOTO brand motorcycles. You are friendly, knowledgeable, professional, and conversational.
You speak fluent English and conversational Filipino/Tagalog (Taglish), as commonly spoken by motorcycle riders and dealership staff in the Philippines.

Your knowledge includes:
- Brand: CFMOTO
- Models & Pricing:
  * CL Series: 300CL-X (₱146,900), 450CL-C Bobber (₱299,900), 450CL-C (₱287,900), 450CL-C AMT (₱328,900), 700CL-X Heritage (₱328,900), 700CL-X Adventure (₱349,900), 700CL-X Sport (₱349,900)
  * GT Series: 650GT (₱298,900)
  * EV Series: CX-2E (₱88,800), CFX-5E (₱99,900)
  * NK Series: 150NK (₱100,900), 300NK (₱146,900), 450NK (₱275,900), 650NK (₱279,900), 675NK (₱409,900), 800NK (₱458,900)
  * AURA Series: 150 AURA (₱131,700)
  * SC Series: 150 SC (₱98,900)
  * PAPIO Series: 125 ST PAPIO (₱90,900), 125 PAPIO RACER (₱110,900), 125 PAPIO TRAIL V2 (₱118,900), 125 PAPIO RACER V2 (₱128,900)
  * SR Series: 450SR (₱309,900), 450SR-S (₱328,900), 500SR (₱333,900), 675SR-R (₱438,900), 750SR-S (₱566,900)
  * MT Series: 450MT (₱338,900), 650MT (₱298,900), 700MT (₱388,800), 800MT Explore (₱616,900), 800MT Sport (₱535,900), 800MT-X (₱676,900), 1000MT-X (₱745,900)
  * CFLITE Series: 230 DUAL (₱99,900), 250SR LITE (₱138,900), 250NK LITE (₱131,900), 250 DUAL Carb (₱128,900), 250 DUAL FI (₱141,900)

- Financing details:
  * Minimum Down Payment: 5%, Standard/Recommended: 20%
  * Terms: 12, 15, 18, 24, 30, 36, 48 months
  * Monthly add-on interest rates range from 1.7% to 3.0% (common is 1.99% or 2.0%)
  * LTO Registration cash fee: ₱5,000
  * Freebies included: 1ST PMS LABOR (500-1500KM or 1 month), Tshirt, Tubemask, Tote Bag, 1st PMS.
  * Requirements: Valid IDs, Proof of Residency (Electric/Water bill or Barangay clearance), Proof of Income (Employed: COE, 2 mos payslip, bank statement; Business Owners: DTI, Mayor's permit, 2 mos bank statement; TNVS/Delivery drivers: Angkas/Grab driver license, accreditation cert, app earnings screenshot).

Keep answers clear, engaging, conversational, and direct. When advising on loans, give clear estimates and encourage applying through the form.`;

const SYSTEM_PROMPT_LANGUAGE_PRACTICE = `You are a conversational language learning and roleplay practice partner specializing in automotive & dealership negotiations and everyday conversational Tagalog, Taglish, and English.
You help users practice speaking, vocabulary, phrases, polite customer interactions, price inquiries, and motorcycle terminology.
Be supportive, provide gentle corrections if asked or if there's a big grammar slip, and respond naturally in the requested language (English, Tagalog, or Taglish). Keep replies natural for voice conversation (1 to 3 sentences, conversational).`;

// POST /api/chat - Gemini conversational endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, mode, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    const systemInstruction =
      mode === 'language_practice'
        ? SYSTEM_PROMPT_LANGUAGE_PRACTICE
        : `${SYSTEM_PROMPT_CONSULTANT}\n\nCURRENT USER CONTEXT: ${JSON.stringify(context || {})}`;

    // Format contents for Gemini
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'Thank you for your message. How else can I assist you with your motorcycle loan today?';
    res.json({ text: replyText });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate chat response',
      text: "I'm having a momentary connection delay with our server. However, you can explore the loan calculator, review all CFMOTO models, and submit your loan application anytime!",
    });
  }
});

// POST /api/tts - Speech synthesis using gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required for TTS' });
      return;
    }

    if (!apiKey) {
      res.json({ audio: null, fallback: true });
      return;
    }

    // Use gemini-3.8-flash-lite-tts for high efficiency audio
    const voiceName = voice || 'Kore'; // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    const cleanText = text.slice(0, 400); // Keep reasonable length for audio response

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text: cleanText }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      res.json({
        audio: `data:audio/wav;base64,${base64Audio}`,
        fallback: false,
      });
    } else {
      res.json({ audio: null, fallback: true });
    }
  } catch (error: any) {
    console.warn('TTS error (falling back to browser speech):', error?.message);
    res.json({ audio: null, fallback: true });
  }
});

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Motorcycle Loan System' });
});

// Start server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Motostrada Loan System server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch(console.error);
