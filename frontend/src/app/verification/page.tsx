"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { submitNgoVerification, uploadDocument } from '@/lib/api';
import {
    Shield, Upload, CheckCircle, FileText,
    Globe, Hash, Calendar, AlertTriangle, CreditCard, Smartphone
} from 'lucide-react';
import StripePaymentForm from '@/components/payment/StripePaymentForm';
import EsewaPaymentForm from '@/components/payment/EsewaPaymentForm';

type PaymentMethod = "STRIPE" | "ESEWA";
type VerifyStep = 1 | 2 | 3;

function VerificationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { dbUser, refreshUser } = useAuth();

    const [step, setStep] = useState<VerifyStep>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ESEWA");
    const [paymentRef, setPaymentRef] = useState("");
    const [paymentDone, setPaymentDone] = useState(false);

    const [form, setForm] = useState({
        registrationNumber: "",
        websiteUrl: "",
        foundedYear: "",
        documentUrl: "",
        documentName: "",
    });

    useEffect(() => {
        const encodedData = searchParams.get("data");
        const payment = searchParams.get("payment");

        if (encodedData) {
            const verify = async () => {
                try {
                    const res = await fetch("/api/payment/esewa/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ encodedData }),
                    });
                    const data = await res.json();
                    if (data.verified) {
                        const savedForm = sessionStorage.getItem("esewa_verification_form");
                        if (savedForm) {
                            setForm(JSON.parse(savedForm));
                            sessionStorage.removeItem("esewa_verification_form");
                        }
                        setPaymentRef(data.ref);
                        setPaymentDone(true);
                        setPaymentMethod("ESEWA");
                        setStep(3);
                        sessionStorage.removeItem("esewa_transaction_uuid");
                        sessionStorage.removeItem("esewa_amt");
                    } else {
                        setError("eSewa payment verification failed. Please try again.");
                        setStep(2);
                    }
                } catch {
                    setError("Could not verify eSewa payment.");
                    setStep(2);
                }
            };
            verify();
        } else if (payment === "failed") {
            setError("eSewa payment was cancelled or failed.");
            setStep(2);
        }
    }, [searchParams]);

    if (!dbUser) {
        return (
            <div className="min-h-screen bg-[#EEF3F8] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (dbUser.role !== "NGO") {
        router.push("/");
        return null;
    }

    if (dbUser.verificationStatus === "VERIFIED") {
        return (
            <div className="min-h-screen bg-[#EEF3F8] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center max-w-sm w-full">
                    <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900">Already Verified!</h2>
                    <p className="text-sm text-slate-500 mt-2 mb-4">Your organization is verified on NConnect.</p>
                    <button onClick={() => router.push("/profile")}
                        className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-sm">
                        Go to Profile
                    </button>
                </div>
            </div>
        );
    }

    if (dbUser.verificationStatus === "UNDER_REVIEW") {
        return (
            <div className="min-h-screen bg-[#EEF3F8] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center max-w-sm w-full">
                    <Shield size={48} className="text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900">Under Review</h2>
                    <p className="text-sm text-slate-500 mt-2 mb-4">Your verification is being reviewed. This usually takes 2-3 business days.</p>
                    <button onClick={() => router.push("/")}
                        className="w-full border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError("");
        try {
            const url = await uploadDocument(file);
            setForm(p => ({ ...p, documentUrl: url, documentName: file.name }));
        } catch {
            setError("Failed to upload document. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleStripeSuccess = (intentId: string) => {
        setPaymentRef(intentId);
        setPaymentDone(true);
        setStep(3);
    };

    const handleSubmit = async () => {
        if (!form.documentUrl) { setError("Document URL is missing."); return; }
        if (!paymentDone || !paymentRef) { setError("Payment not completed."); return; }

        setLoading(true);
        setError("");
        try {
            await submitNgoVerification({
                registrationNumber: form.registrationNumber || null,
                websiteUrl: form.websiteUrl || null,
                foundedYear: form.foundedYear ? parseInt(form.foundedYear) : null,
                documentUrl: form.documentUrl,
                paymentMethod,
                paymentIntentId: paymentRef,
            });
            await refreshUser();
            router.push("/profile");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const AMOUNT = 500;

    return (
        <div className="min-h-screen bg-[#EEF3F8] flex flex-col">
            <div className="bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield size={20} className="text-indigo-600" />
                    <span className="font-bold text-slate-900 text-sm sm:text-base">NGO Verification</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">Step {step} of 3</span>
            </div>

            <div className="h-1 bg-slate-200">
                <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
            </div>

            <div className="flex-1 flex items-start justify-center px-4 py-6 sm:py-8">
                <div className="w-full max-w-lg space-y-4">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex gap-3">
                        <Shield size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-indigo-900">Get Verified on NConnect</p>
                            <p className="text-xs text-indigo-700 mt-0.5 leading-relaxed">
                                One-time fee of NPR 5,000. Verified NGOs receive a blue tick badge and higher visibility.
                                Local NGOs can pay via eSewa, international supporters via Stripe.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-8">
                        {step === 1 && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Organization Documents</h2>
                                    <p className="text-sm text-slate-500 mt-1">Provide your registration details for verification.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        <Hash size={11} className="inline mr-1" />Registration Number
                                    </label>
                                    <input type="text" placeholder="e.g. NGO-2024-00123"
                                        value={form.registrationNumber}
                                        onChange={e => setForm(p => ({ ...p, registrationNumber: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        <Globe size={11} className="inline mr-1" />Website URL
                                    </label>
                                    <input type="url" placeholder="https://yourorg.org"
                                        value={form.websiteUrl}
                                        onChange={e => setForm(p => ({ ...p, websiteUrl: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        <Calendar size={11} className="inline mr-1" />Founded Year
                                    </label>
                                    <input type="number" placeholder="e.g. 2015"
                                        min="1900" max={new Date().getFullYear()}
                                        value={form.foundedYear}
                                        onChange={e => setForm(p => ({ ...p, foundedYear: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        <FileText size={11} className="inline mr-1" />
                                        Registration Document (PDF) <span className="text-red-500">*</span>
                                    </label>
                                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all p-4 ${form.documentUrl ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30"}`}>
                                        <input type="file" accept=".pdf" className="hidden"
                                            onChange={handleFileUpload} disabled={uploading} />
                                        {uploading ? (
                                            <div className="flex items-center gap-2 text-indigo-600">
                                                <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
                                                <span className="text-sm font-medium">Uploading to Cloudinary...</span>
                                            </div>
                                        ) : form.documentUrl ? (
                                            <div className="text-center max-w-full">
                                                <CheckCircle size={24} className="text-emerald-500 mx-auto mb-1" />
                                                <p className="text-xs font-semibold text-emerald-700 truncate px-2">{form.documentName}</p>
                                                <p className="text-[11px] text-emerald-600 mt-0.5">Click to replace</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload size={24} className="text-slate-400 mx-auto mb-1" />
                                                <p className="text-xs font-semibold text-slate-600">Upload registration certificate</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">PDF only — max 5MB</p>
                                            </div>
                                        )}
                                    </label>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
                                        <AlertTriangle size={13} className="shrink-0" />{error}
                                    </div>
                                )}

                                <button onClick={() => { setError(""); setStep(2); }}
                                    disabled={!form.documentUrl}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                                    Continue to Payment
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Verification Fee</h2>
                                    <p className="text-sm text-slate-500 mt-1">Choose your preferred payment method.</p>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">NGO Verification</p>
                                        <p className="text-xs text-slate-500 mt-0.5">One-time · Includes blue tick badge</p>
                                    </div>
                                    <span className="text-xl font-bold text-indigo-600">NPR {AMOUNT.toLocaleString()}</span>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-2">Payment Method</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button onClick={() => setPaymentMethod("ESEWA")}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === "ESEWA" ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:border-slate-300"}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Smartphone size={16} className={paymentMethod === "ESEWA" ? "text-emerald-600" : "text-slate-400"} />
                                                <span className="text-xs font-bold text-slate-900">eSewa</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">Nepal digital wallet</p>
                                            <p className="text-[10px] text-emerald-600 font-medium mt-1">Recommended for locals</p>
                                        </button>

                                        <button onClick={() => setPaymentMethod("STRIPE")}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === "STRIPE" ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:border-slate-300"}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <CreditCard size={16} className={paymentMethod === "STRIPE" ? "text-indigo-600" : "text-slate-400"} />
                                                <span className="text-xs font-bold text-slate-900">Card / Stripe</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">Visa, Mastercard, etc.</p>
                                            <p className="text-[10px] text-indigo-600 font-medium mt-1">Recommended for international</p>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    {paymentMethod === "ESEWA" ? (
                                        <EsewaPaymentForm
                                            amount={AMOUNT}
                                            userId={dbUser.id}
                                            onInitiated={() => {
                                                sessionStorage.setItem("esewa_verification_form", JSON.stringify(form));
                                                setLoading(true);
                                            }}
                                        />
                                    ) : (
                                        <StripePaymentForm
                                            amount={AMOUNT}
                                            onSuccess={handleStripeSuccess}
                                            onError={(msg) => setError(msg)}
                                        />
                                    )}
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
                                        <AlertTriangle size={13} className="shrink-0" />{error}
                                    </div>
                                )}

                                <button onClick={() => setStep(1)}
                                    className="w-full text-slate-500 hover:text-slate-800 text-sm font-medium py-2 transition-colors">
                                    ← Back to Documents
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                                        <CheckCircle size={20} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Payment Confirmed!</h2>
                                        <p className="text-sm text-slate-500">Review and submit your verification.</p>
                                    </div>
                                </div>

                                <div className="space-y-0 divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                                    {[
                                        { label: "Organization", value: dbUser.organizationName || "—" },
                                        { label: "Registration No.", value: form.registrationNumber || "Not provided" },
                                        { label: "Website", value: form.websiteUrl || "Not provided" },
                                        { label: "Founded Year", value: form.foundedYear || "Not provided" },
                                        { label: "Document", value: form.documentName },
                                        { label: "Payment", value: `NPR ${AMOUNT.toLocaleString()} via ${paymentMethod === "STRIPE" ? "Stripe" : "eSewa"}` },
                                        { label: "Payment Ref", value: paymentRef.length > 24 ? paymentRef.slice(0, 24) + "..." : paymentRef },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 gap-1">
                                            <span className="text-xs font-semibold text-slate-500">{label}</span>
                                            <span className="text-xs font-bold text-slate-900 sm:max-w-50 truncate sm:text-right">{value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                        Our team will review your submission within 2-3 business days.
                                        You will receive a notification once verified.
                                    </p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
                                        <AlertTriangle size={13} className="shrink-0" />{error}
                                    </div>
                                )}

                                <button onClick={handleSubmit} disabled={loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                                    <Shield size={15} />
                                    {loading ? "Submitting..." : "Submit for Verification"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerificationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#EEF3F8] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
            </div>
        }>
            <VerificationContent />
        </Suspense>
    );
}