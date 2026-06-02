"use client";
import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface EsewaPaymentFormProps {
    amount: number;
    userId: string;
    onInitiated: () => void;
}

export default function EsewaPaymentForm({ amount, userId, onInitiated }: EsewaPaymentFormProps) {
    const [loading, setLoading] = useState(false);

    const [pid] = useState(() => `nconnect_verify_${userId}_${Date.now()}`);
    const successUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verification?payment=success&pid=${pid}`;
    const failureUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verification?payment=failed`;

    const handlePay = () => {
        setLoading(true);
        onInitiated();

        sessionStorage.setItem("esewa_pid", pid);
        sessionStorage.setItem("esewa_amt", String(amount));

        const form = document.getElementById("esewa-form") as HTMLFormElement;
        form?.submit();
    };

    return (
        <div className="space-y-4">
            <form
                id="esewa-form"
                action={process.env.NEXT_PUBLIC_ESEWA_SANDBOX_URL}
                method="POST"
                className="hidden"
            >
                <input name="amt" value={amount} readOnly />
                <input name="psc" value="0" readOnly />
                <input name="pdc" value="0" readOnly />
                <input name="txAmt" value="0" readOnly />
                <input name="tAmt" value={amount} readOnly />
                <input name="pid" value={pid} readOnly />
                <input name="scd" value={process.env.NEXT_PUBLIC_ESEWA_MERCHANT_CODE || "EPAYTEST"} readOnly />
                <input name="su" value={successUrl} readOnly />
                <input name="fu" value={failureUrl} readOnly />
            </form>

            <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">NGO Verification Fee</span>
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

            <button onClick={handlePay} disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                <ExternalLink size={15} />
                {loading ? "Redirecting to eSewa..." : `Pay NPR ${amount.toLocaleString()} via eSewa`}
            </button>

            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">Sandbox Test Credentials:</p>
                <p>eSewa ID: <span className="font-mono">9806800001</span></p>
                <p>Password: <span className="font-mono">Nepal@123</span></p>
                <p>MPIN: <span className="font-mono">1122</span></p>
                <p>Token: <span className="font-mono">123456</span></p>
            </div>
        </div>
    );
}