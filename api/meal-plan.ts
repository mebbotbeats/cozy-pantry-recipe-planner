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

    const { ingredients } = req.body;
    const list = ingredients.map((i: any) => i.label).join(", ");
    
    const completion = await groq.chat.completions.create({
      messages:[
         { 
           role: "system", 
           content: `You are a cozy, encouraging home chef. Create a practical 3-day meal plan based STRICTLY on the list of ingredients provided.
           STRICT RULES:
           1. ONLY use provided ingredients.
           2. Do NOT assume any staples exist unless listed.
           3. You MUST return valid JSON exactly matching this structure:
           {
             "encouragement": "A friendly string here",
             "plan":[
               {
                 "day": 1,
                 "title": "String title",
                 "description": "Short string description",
                 "instructions": ["Step 1", "Step 2", "Step 3"]
               },
               {
                 "day": 2,
                 "title": "String title",
                 "description": "Short string description",
                 "instructions":["Step 1", "Step 2", "Step 3"]
               },
               {
                 "day": 3,
                 "title": "String title",
                 "description": "Short string description",
                 "instructions":["Step 1", "Step 2", "Step 3"]
               }
             ]
           }`
         },
         { role: "user", content: `Ingredients: ${list}` }
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