import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    // 1. Initialize inside the safety net
    if (!process.env.GROQ_API_KEY || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Server Configuration Error: Missing Keys in Vercel.");
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // 2. Verify User Token
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) throw new Error("Unauthorized. No token provided.");

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) throw new Error(`Auth Error: ${authErr?.message || "Invalid token"}`);

    // 3. Check Credits
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();
    
    if (profileErr) throw new Error(`Database Error: ${profileErr.message}`);
    if (!profile || profile.credits <= 0) return res.status(403).json({ error: "OUT_OF_CREDITS" });

    // 4. AI Logic
    const { input } = req.body;
    const completion = await groq.chat.completions.create({
      messages:[
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
      model: "openai/gpt-oss-120b", // Your preferred model!
      response_format: { type: "json_object" }
    });

    // 5. Deduct Credit
    await supabase.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id);

    res.status(200).json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
  } catch (error: any) {
    console.error("Backend Crash Caught:", error);
    // This sends the EXACT error to the frontend alert box!
    res.status(500).json({ error: error.message || "Unknown backend error occurred." });
  }
}