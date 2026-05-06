import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    if (!process.env.GROQ_API_KEY || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Server Configuration Error: Missing Keys in Vercel.");
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) throw new Error("Unauthorized. No token provided.");

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) throw new Error(`Auth Error: ${authErr?.message || "Invalid token"}`);

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();
    
    if (profileErr) throw new Error(`Database Error: ${profileErr.message}`);
    if (!profile || profile.credits <= 0) return res.status(403).json({ error: "OUT_OF_CREDITS" });

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
                "color": "#e5c49f", 
                "size": "small", 
                "shelf": 1
              }
            ]
          }
          Note: "size" MUST be exactly one of: "small", "medium", "tall", "wide", "large".
          Note: "shelf" MUST be an integer from 1 to 5.
          Note: "color" MUST be a valid hex code (muted warm colors).`
        },
        { role: "user", content: input }
      ],
      model: "openai/gpt-oss-120b", 
      response_format: { type: "json_object" }
    });

    await supabase.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id);

    res.status(200).json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
  } catch (error: any) {
    console.error("Backend Crash Caught:", error);
    res.status(500).json({ error: error.message || "Unknown backend error occurred." });
  }
}