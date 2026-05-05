import Stripe from 'stripe';
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const config = { api: { bodyParser: false } }; // Stripe needs raw body

export default async function handler(req: any, res: any) {
  // Add raw-body parsing logic here (standard Stripe webhook boilerplate)
  // For simplicity, assuming the event is constructed:
  
  const event = req.body; // In reality, use stripe.webhooks.constructEvent

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id; // The user ID we passed earlier

    if (userId) {
      // Give the user 50 credits!
      const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single();
      await supabase.from('profiles').update({ credits: (data?.credits || 0) + 50 }).eq('id', userId);
    }
  }

  res.status(200).json({ received: true });
}