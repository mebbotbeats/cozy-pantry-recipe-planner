import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const supabaseUrl = process.env.SUPABASE_URL || "https://hnkbkrslozsczjlbeepj.supabase.co";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!supabaseUrl.startsWith("https://") || !supabaseKey || !groqKey) {
    return res.status(500).json({ error: "Server Configuration Error: Missing Keys" });
  }

  const groq = new Groq({ apiKey: groqKey });
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) throw new Error("Unauthorized. No token provided.");

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) throw new Error("Invalid token.");

    const { input } = req.body;
    const completion = await groq.chat.completions.create({
      messages:[
        {
          role: "system",
          content: `You are a cozy pantry organizer. Categorize these foods into real-world storage logic. 
          STRICT RULES:
          1. ONLY process the items listed in the input. Do NOT add any extra ingredients.
          2. You MUST return valid JSON exactly matching this structure:
          {
            "items":[
              {
                "label": "Short handwritten label",
                "originalName": "EXACTLY the name from user input",
                "color": "MUST VARY! Pick randomly from this list of cozy hex codes: #e5c49f, #d4a373, #a3b18a, #c08552, #ffa69e, #84a59d, #e9c46a, #e76f51, #cb997e", 
                "size": "small", 
                "shelf": 1
              }
            ]
          }
          Note: "size" MUST be exactly one of: "small", "medium", "tall", "wide", "large".
          Note: "shelf" MUST be an integer from 1 to 5.`
        },
        { role: "user", content: input }
      ],
      model: "openai/gpt-oss-120b", 
      response_format: { type: "json_object" }
    });

    res.status(200).json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
  } catch (error: any) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message || "Failed to organize" });
  }
}