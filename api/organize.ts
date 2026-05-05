import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  // 0. Debug Logging (View this in Vercel Logs to see what's missing)
  console.log("Checking Environment:", {
    hasGroq: !!process.env.GROQ_API_KEY,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  // 1. Initialize inside handler (Safest for Vercel)
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
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single();
  
  if (profileErr || !profile || profile.credits <= 0) {
    return res.status(403).json({ error: "OUT_OF_CREDITS" });
  }

  try {
    // 4. AI Logic
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

    // 5. Deduct Credit
    await supabase.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id);

    res.status(200).json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
  } catch (error) {
    console.error("AI/DB Error:", error);
    res.status(500).json({ error: "Failed to organize. Please try again." });
  }
}