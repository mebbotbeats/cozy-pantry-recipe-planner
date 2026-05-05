import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  // 1. Safe Initialization check
  if (!process.env.GROQ_API_KEY || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Server Configuration Error: Missing Keys" });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 2. Verify User Token
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized. Please log in." });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: "Invalid token." });

  // 3. Check Credits
  const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
  if (!profile || profile.credits <= 0) {
    return res.status(403).json({ error: "OUT_OF_CREDITS" });
  }

  try {
    // 4. Generate Meal Plan
    const { ingredients } = req.body;
    const list = ingredients.map((i: any) => i.label).join(", ");
    
    const completion = await groq.chat.completions.create({
      messages:[
         { role: "system", content: "You are a cozy, encouraging home chef. Create a practical 3-day meal plan based STRICTLY on the list of ingredients provided. Return a JSON object with: plan (array of objects: day, title, description, instructions) and encouragement (string)." },
         { role: "user", content: `Ingredients: ${list}` }
      ],
      model: "llama3-70b-8192", 
      response_format: { type: "json_object" }
    });

    // 5. Deduct Credit
    await supabase.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id);

    res.status(200).json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
  } catch (error: any) {
    console.error("Meal Plan Error:", error);
    res.status(500).json({ error: "Failed to consult chef. Please try again." });
  }
}