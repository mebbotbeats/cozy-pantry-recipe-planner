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

    // Check Credits! Must have > 0 to consult the Chef.
    const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
    if (!profile || profile.credits <= 0) return res.status(403).json({ error: "OUT_OF_CREDITS" });

    const { ingredients } = req.body;
    const list = ingredients.map((i: any) => i.label).join(", ");
    
    const completion = await groq.chat.completions.create({
      messages:[
         { 
           role: "system", 
           content: `You are a cozy, encouraging home chef. Create a practical 3-DAY meal plan based STRICTLY on the list of ingredients provided.
           STRICT RULES:
           1. BLINDLY FOLLOW the ingredient list. ONLY use what the user provided. Do NOT assume any staples (like oil, salt, butter) exist unless listed.
           2. Focus on ONE main meal or snack per day for exactly 3 days.
           3. GROCERY HINT: Only if absolutely necessary to make the meals complete, suggest 1 to 3 highlighted groceries they can easily grab to complement the meals. Put this in the "groceryHint" field. If not needed, leave it empty.
           4. You MUST return valid JSON exactly matching this structure:
           {
             "encouragement": "A friendly string here",
             "groceryHint": "Optional: Small string suggesting 1-3 complimentary items to buy, or leave blank.",
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
                 "instructions": ["Step 1", "Step 2", "Step 3"]
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

    // Deduct 1 Credit for using the Chef
    await supabase.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id);
    
    res.status(200).json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
  } catch (error: any) {
    console.error("Meal Plan Error:", error);
    res.status(500).json({ error: error.message || "Failed to consult chef." });
  }
}