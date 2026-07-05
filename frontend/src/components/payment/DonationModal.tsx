"use client";
import React, { useState } from 'react';
import { X, Heart, CreditCard, Smartphone, Lock, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const NPR_TO_USD_RATE = 133;
const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

interface DonationModalProps {
    project: { id: string; title: string; ngoName: string };
    onClose: () => void;
    onDonated?: (amount: number) => void;
}

async function confirmDonationInDB(
    projectId: string,
    amount: number,
    paymentRef: string,
    paymentMethod: string
) {
    try {
        await fetch("/api/donations/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId, amount, paymentRef, paymentMethod }),
        });
    } catch (err) {
        console.error("Failed to confirm donation in DB:", err);
    }
}

function StripeForm({ amount, onSuccess, onError }: {
    amount: number;
    onSuccess: (id: string) => void;
    onError: (msg: string) => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const usd = (amount / NPR_TO_USD_RATE).toFixed(2);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setLoading(true);
        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: { return_url: `${window.location.origin}/project?donation=success` },
                redirect: "if_required",
            });
            if (error) onError(error.message || "Payment failed");
            else if (paymentIntent?.status === "succeeded") onSuccess(paymentIntent.id);
        } catch { onError("Payment processing failed"); }
        finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement options={{ layout: "tabs" }} />
            <div className="flex items-center gap-2 text-xs text-slate-400">
                <Lock size={11} /><span>Secured by Stripe</span>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 text-xs text-blue-700">
                Charged as <span className="font-bold">${usd} USD</span> ≈ NPR {amount.toLocaleString()}
            </div>
            <button type="submit" disabled={!stripe || loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                <CreditCard size={14} />
                {loading ? "Processing..." : `Donate $${usd} USD`}
            </button>
            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-0.5">
                <p className="font-semibold text-slate-700">Test Card:</p>
                <p>4242 4242 4242 4242 · Any future date · Any CVC</p>
            </div>
        </form>
    );
}

function StripeWrapper({ amount, projectId, projectTitle, onSuccess, onError }: {
    amount: number; projectId: string; projectTitle: string;
    onSuccess: (id: string) => void; onError: (msg: string) => void;
}) {
    const [clientSecret, setClientSecret] = useState("");
    const [loadingIntent, setLoadingIntent] = useState(true);

    React.useEffect(() => {
        fetch("/api/payment/stripe/donate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, projectId, projectTitle }),
        })
            .then(r => r.json())
            .then(d => { if (d.clientSecret) setClientSecret(d.clientSecret); else onError("Failed to init payment"); })
            .catch(() => onError("Failed to init payment"))
            .finally(() => setLoadingIntent(false));
    }, [amount, projectId, projectTitle, onError]);

    if (loadingIntent) return (
        <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
    );
    if (!clientSecret) return null;

    return (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
            <StripeForm amount={amount} onSuccess={onSuccess} onError={onError} />
        </Elements>
    );
}

export default function DonationModal({ project, onClose, onDonated }: DonationModalProps) {
    const [amount, setAmount] = useState(1000);
    const [customAmount, setCustomAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"ESEWA" | "STRIPE">("ESEWA");
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [error, setError] = useState("");
    const [paymentRef, setPaymentRef] = useState("");
    const [confirming, setConfirming] = useState(false);
    const [esewaLoading, setEsewaLoading] = useState(false);

    const finalAmount = customAmount ? parseInt(customAmount) || 0 : amount;

    const handleEsewaSubmit = async () => {
        if (finalAmount < 100) { setError("Minimum donation is NPR 100"); return; }
        setError("");
        setEsewaLoading(true);
        try {
            const res = await fetch("/api/payment/esewa/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: finalAmount,
                    purpose: "donation",
                    referenceId: project.id,
                }),
            });
            if (!res.ok) throw new Error("Failed to initiate eSewa payment");
            const { formFields, actionUrl } = await res.json();

            sessionStorage.setItem("esewa_transaction_uuid", formFields.transaction_uuid);
            sessionStorage.setItem("esewa_amt", String(finalAmount));
            sessionStorage.setItem("esewa_project_id", project.id);

            const form = document.createElement("form");
            form.method = "POST";
            form.action = actionUrl;
            Object.entries(formFields).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = String(value);
                form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
        } catch (err) {
            console.error(err);
            setError("Failed to start eSewa payment. Please try again.");
            setEsewaLoading(false);
        }
    };

    const handleStripeSuccess = async (intentId: string) => {
        setPaymentRef(intentId);
        setConfirming(true);
        await confirmDonationInDB(project.id, finalAmount, intentId, "STRIPE");
        setConfirming(false);
        onDonated?.(finalAmount);
        setStep(3);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-rose-100 rounded-xl flex items-center justify-center">
                            <Heart size={16} className="text-rose-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Donate to Project</p>
                            <p className="text-xs text-slate-500 truncate max-w-55">{project.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
                        <X size={16} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {step === 1 && (
                        <>
                            <div>
                                <p className="text-xs font-semibold text-slate-700 mb-2">Select Amount (NPR)</p>
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {PRESET_AMOUNTS.map(a => (
                                        <button key={a} onClick={() => { setAmount(a); setCustomAmount(""); }}
                                            className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${!customAmount && amount === a ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                                            {a.toLocaleString()}
                                        </button>
                                    ))}
                                    <input
                                        type="number" placeholder="Custom"
                                        value={customAmount}
                                        onChange={e => setCustomAmount(e.target.value)}
                                        className="col-span-3 px-4 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-center font-bold"
                                    />
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Total donation</span>
                                    <span className="text-lg font-bold text-indigo-700">NPR {finalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-700 mb-2">Payment Method</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setPaymentMethod("ESEWA")}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${paymentMethod === "ESEWA" ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200"}`}>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <Smartphone size={14} className={paymentMethod === "ESEWA" ? "text-emerald-600" : "text-slate-400"} />
                                            <span className="text-xs font-bold text-slate-900">eSewa</span>
                                        </div>
                                        <p className="text-[10px] text-emerald-600 font-medium">For locals</p>
                                    </button>
                                    <button onClick={() => setPaymentMethod("STRIPE")}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${paymentMethod === "STRIPE" ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200"}`}>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <CreditCard size={14} className={paymentMethod === "STRIPE" ? "text-indigo-600" : "text-slate-400"} />
                                            <span className="text-xs font-bold text-slate-900">Card</span>
                                        </div>
                                        <p className="text-[10px] text-indigo-600 font-medium">International</p>
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-xs">
                                    <AlertTriangle size={13} />{error}
                                </div>
                            )}

                            {paymentMethod === "ESEWA" ? (
                                <>
                                    <button onClick={handleEsewaSubmit} disabled={esewaLoading}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                                        <ExternalLink size={14} />
                                        {esewaLoading ? "Redirecting to eSewa..." : `Pay NPR ${finalAmount.toLocaleString()} via eSewa`}
                                    </button>
                                    <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-0.5">
                                        <p className="font-semibold text-slate-700">Sandbox Credentials:</p>
                                        <p>ID: <span className="font-mono">9711111111</span> · Pass: <span className="font-mono">Nepal@123</span></p>
                                    </div>
                                </>
                            ) : (
                                <button onClick={() => { if (finalAmount < 100) { setError("Minimum donation is NPR 100"); return; } setStep(2); }}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm">
                                    Continue to Card Payment →
                                </button>
                            )}
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-600">Donating</span>
                                <span className="font-bold text-indigo-700">NPR {finalAmount.toLocaleString()}</span>
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-xs mb-2">
                                    <AlertTriangle size={13} />{error}
                                </div>
                            )}
                            {confirming ? (
                                <div className="flex items-center justify-center py-8 gap-2 text-slate-500 text-sm">
                                    <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
                                    Confirming payment...
                                </div>
                            ) : (
                                <StripeWrapper
                                    amount={finalAmount}
                                    projectId={project.id}
                                    projectTitle={project.title}
                                    onSuccess={handleStripeSuccess}
                                    onError={setError}
                                />
                            )}
                            <button onClick={() => setStep(1)}
                                className="w-full text-slate-500 text-sm font-medium py-1.5 hover:text-slate-800 transition-colors">
                                ← Back
                            </button>
                        </>
                    )}

                    {step === 3 && (
                        <div className="text-center py-6 space-y-3">
                            <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                                <CheckCircle size={32} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-900">Thank you!</p>
                                <p className="text-sm text-slate-500 mt-1">
                                    Your donation of NPR {finalAmount.toLocaleString()} has been received.
                                </p>
                                {paymentRef && (
                                    <p className="text-xs text-slate-400 mt-1 font-mono">
                                        Ref: {paymentRef.slice(0, 20)}...
                                    </p>
                                )}
                            </div>
                            <button onClick={onClose}
                                className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-sm">
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}