"use client";
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const NPR_TO_USD_RATE = 133;

interface CheckoutFormProps {
    onSuccess: (paymentIntentId: string) => void;
    onError: (msg: string) => void;
    amountNpr: number;
}

function CheckoutForm({ onSuccess, onError, amountNpr }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const usdAmount = (amountNpr / NPR_TO_USD_RATE).toFixed(2);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/verification?payment=success`,
                },
                redirect: "if_required",
            });

            if (error) {
                onError(error.message || "Payment failed");
            } else if (paymentIntent?.status === "succeeded") {
                onSuccess(paymentIntent.id);
            }
        } catch {
            onError("Payment processing failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <PaymentElement options={{ layout: "tabs" }} />

            <div className="flex items-start gap-2 text-xs text-slate-400">
                <Lock size={11} className="shrink-0 mt-0.5" />
                <span>Secured by Stripe — your card details are never stored</span>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                <p>
                    Charged as <span className="font-bold">${usdAmount} USD</span> (≈ NPR {amountNpr.toLocaleString()} at sandbox rate).
                    eSewa is recommended for local NPR payments.
                </p>
            </div>

            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 active:scale-[0.99]"
            >
                <CreditCard size={15} className="shrink-0" />
                <span className="truncate">
                    {loading ? "Processing..." : `Pay $${usdAmount} USD via Stripe`}
                </span>
            </button>
        </form>
    );
}

interface StripePaymentFormProps {
    amount: number;
    onSuccess: (paymentIntentId: string) => void;
    onError: (msg: string) => void;
}

export default function StripePaymentForm({ amount, onSuccess, onError }: StripePaymentFormProps) {
    const [clientSecret, setClientSecret] = useState("");
    const [loadingIntent, setLoadingIntent] = useState(true);

    useEffect(() => {
        const createIntent = async () => {
            try {
                const res = await fetch("/api/payment/stripe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount, purpose: "ngo_verification" }),
                });
                const data = await res.json();
                if (!data.clientSecret) throw new Error("No client secret returned");
                setClientSecret(data.clientSecret);
            } catch {
                onError("Failed to initialize payment");
            } finally {
                setLoadingIntent(false);
            }
        };
        createIntent();
    }, [amount, onError]);

    if (loadingIntent) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!clientSecret) return null;

    return (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
            <CheckoutForm onSuccess={onSuccess} onError={onError} amountNpr={amount} />
        </Elements>
    );
}