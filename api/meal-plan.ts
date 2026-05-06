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
         { 
           role: "system", 
           content: `You are a Master Home Chef. Create a 7-DAY meal plan based on the ingredients provided.
           STRICT RULES:
           1. Use the provided ingredients creatively.
           2. Create a "Shopping List" of 3 to 4 specific items the user SHOULD buy at the store to turn these random ingredients into gourmet meals.
           3. The "instructions" array MUST contain exactly 3 strings formatted as "Breakfast: [meal]", "Lunch: [meal]", and "Dinner: [meal]".
           4. You MUST return valid JSON exactly matching this structure:
           {
             "encouragement": "A friendly string here",
             "shoppingList": ["Item 1", "Item 2", "Item 3"],
             "plan":[
               {
                 "day": 1,
                 "title": "String title",
                 "description": "Short string description",
                 "instructions": ["Breakfast: ...", "Lunch: ...", "Dinner: ..."]
               },
               // ... Continue this pattern exactly for days 2, 3, 4, 5, 6, and 7
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
    console.error("Meal Plan Error:", error);
    res.status(500).json({ error: error.message || "Failed to consult chef." });
  }
}