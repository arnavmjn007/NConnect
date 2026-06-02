import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
    try {
        const { amount = 5000, purpose = "ngo_verification" } = await request.json();

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "npr",
            automatic_payment_methods: { enabled: true },
            metadata: { purpose },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id,
        });
    } catch (err) {
        console.error("Stripe error:", err);
        return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
    }
}