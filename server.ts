import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/organize", async (req, res) => {
    try {
      const { input } = req.body;
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a cozy pantry organizer. Categorize these foods into real-world storage logic. 
            STRICT RULES:
            1. ONLY process the items listed in the input. Do NOT add any extra ingredients.
            2. Every input item must have a corresponding entry in the output.
            3. Return a JSON object with an 'items' array. Each item must have:
            - label: a refined handwritten-style label
            - originalName: EXACTLY the name from user input
            - color: a muted warm hex code
            - size: 'small', 'medium', 'tall', 'wide', or 'large'
            - shelf: integer 1 to 5`
          },
          { role: "user", content: input }
        ],
        model: "openai/gpt-oss-120b",
        response_format: { type: "json_object" }
      });

      res.json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to organize" });
    }
  });

  app.post("/api/meal-plan", async (req, res) => {
    try {
      const { ingredients } = req.body;
      const list = ingredients.map((i: any) => i.label).join(", ");
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a cozy, encouraging home chef. Create a practical, warming 3-day meal plan based STRICTLY on the list of ingredients provided.
            RULES:
            1. ONLY use provided ingredients.
            2. Do NOT assume any staples (like oil or flour) exist unless listed.
            3. If ingredients are missing for a standard dish, suggest creative pantry-only alternatives.
            Return a JSON object with:
            - plan: array of objects (day, title, description, instructions[])
            - encouragement: a friendly string`
          },
          { role: "user", content: `Ingredients: ${list}` }
        ],
        model: "openai/gpt-oss-120b",
        response_format: { type: "json_object" }
      });

      res.json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create meal plan" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
