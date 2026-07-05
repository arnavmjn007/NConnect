"use client";
import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface EsewaPaymentFormProps {
    amount: number;
    userId: string;
    purpose?: string;
    onInitiated: () => void;
}

export default function EsewaPaymentForm({ amount, userId, purpose = "verification", onInitiated }: EsewaPaymentFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handlePay = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/payment/esewa/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, purpose, referenceId: userId }),
            });
            if (!res.ok) throw new Error("Failed to initiate eSewa payment");
            const { formFields, actionUrl } = await res.json();

            sessionStorage.setItem("esewa_transaction_uuid", formFields.transaction_uuid);
            sessionStorage.setItem("esewa_amt", String(amount));

            onInitiated();

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
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Amount</span>
                    <span className="text-sm font-bold text-emerald-700">NPR {amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Service charge</span>
                    <span>NPR 0</span>
                </div>
                <div className="border-t border-emerald-200 pt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Total</span>
                    <span className="text-sm font-bold text-emerald-700">NPR {amount.toLocaleString()}</span>
                </div>
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <button
                onClick={handlePay}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
                <ExternalLink size={15} />
                {loading ? "Redirecting to eSewa..." : `Pay NPR ${amount.toLocaleString()} via eSewa`}
            </button>

            {process.env.NODE_ENV === "development" && (
                <details className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500">
                    <summary className="font-semibold text-slate-700 cursor-pointer">
                        Sandbox Test Credentials
                    </summary>
                    <div className="mt-2 space-y-1">
                        <p>eSewa ID: <span className="font-mono">9711111111</span></p>
                        <p>Password: <span className="font-mono">Nepal@123</span></p>
                        <p>MPIN: <span className="font-mono">1122</span></p>
                        <p>Token: <span className="font-mono">123456</span></p>
                    </div>
                </details>
            )}
        </div>
    );
}