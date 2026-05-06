import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  // Force-fallback the URL if Vercel Environment Variables aren't loading
  const supabaseUrl = process.env.SUPABASE_URL || "https://hnkbkrslozsczjlbeepj.supabase.co";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  // Debug log: Check this in Vercel Logs if it still fails
  console.log("Environment Status:", { 
    url: supabaseUrl, 
    hasKey: !!supabaseKey, 
    hasGroq: !!groqKey 
  });

  if (!supabaseUrl.startsWith("https://") || !supabaseKey || !groqKey) {
    return res.status(500).json({ error: "Server Configuration Error: Missing or Invalid Keys" });
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

    const { input } = req.body;
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a cozy pantry organizer. Return JSON with an 'items' array. Each item: label, originalName, color, size, shelf." },
        { role: "user", content: input }
      ],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" }
    });

    await supabase.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id);
    res.status(200).json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
  } catch (error: any) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message || "Failed to organize" });
  }
}