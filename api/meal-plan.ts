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

    const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
    if (!profile || profile.credits <= 0) return res.status(403).json({ error: "OUT_OF_CREDITS" });

    const { ingredients } = req.body;
    const list = ingredients.map((i: any) => i.label).join(", ");
    
    const completion = await groq.chat.completions.create({
      messages:[
         { role: "system", content: "You are a cozy chef. Create a practical 3-day meal plan. Return JSON with 'plan' and 'encouragement'." },
         { role: "user", content: `Ingredients: ${list}` }
      ],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" }
    });

    await supabase.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id);
    res.status(200).json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
  } catch (error: any) {
    console.error("Meal Plan Error:", error);
    res.status(500).json({ error: error.message || "Failed to consult chef." });
  }
}