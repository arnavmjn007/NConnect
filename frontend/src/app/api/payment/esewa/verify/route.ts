import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY!;
const STATUS_CHECK_URL = process.env.ESEWA_STATUS_CHECK_URL || "https://rc.esewa.com.np/api/epay/transaction/status/";

interface EsewaResponseData {
    transaction_code: string;
    status: string;
    total_amount: string;
    transaction_uuid: string;
    product_code: string;
    signed_field_names: string;
    signature: string;
    [key: string]: string;
}

function verifySignature(data: EsewaResponseData): boolean {
    const fieldNames = data.signed_field_names.split(",");
    const message = fieldNames.map((f) => `${f}=${data[f]}`).join(",");
    const hmac = crypto.createHmac("sha256", ESEWA_SECRET_KEY);
    hmac.update(message);
    const expectedSignature = hmac.digest("base64");
    return expectedSignature === data.signature;
}

export async function POST(request: NextRequest) {
    try {
        const { encodedData } = await request.json();
        if (!encodedData) {
            return NextResponse.json({ error: "Missing payment data" }, { status: 400 });
        }

        const decoded = Buffer.from(encodedData, "base64").toString("utf-8");
        const data: EsewaResponseData = JSON.parse(decoded);

        if (!verifySignature(data)) {
            console.error("eSewa signature mismatch:", data);
            return NextResponse.json({ verified: false, error: "Signature verification failed" }, { status: 400 });
        }

        if (data.status !== "COMPLETE") {
            const statusParams = new URLSearchParams({
                product_code: data.product_code,
                total_amount: data.total_amount,
                transaction_uuid: data.transaction_uuid,
            });
            const statusRes = await fetch(`${STATUS_CHECK_URL}?${statusParams}`);
            const statusData = await statusRes.json();
            if (statusData.status !== "COMPLETE") {
                return NextResponse.json(
                    { verified: false, error: `Payment status: ${statusData.status}` },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json({
            verified: true,
            ref: data.transaction_code,
            transactionUuid: data.transaction_uuid,
            amount: data.total_amount,
        });
    } catch (err) {
        console.error("eSewa verify error:", err);
        return NextResponse.json({ error: "Verification request failed" }, { status: 500 });
    }
}