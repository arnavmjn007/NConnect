import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY!;
const PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";

function generateSignature(totalAmount: string, transactionUuid: string, productCode: string) {
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const hmac = crypto.createHmac("sha256", ESEWA_SECRET_KEY);
    hmac.update(message);
    return hmac.digest("base64");
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, purpose, referenceId } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }
        if (!purpose || !referenceId) {
            return NextResponse.json({ error: "purpose and referenceId are required" }, { status: 400 });
        }

        const transactionUuid = `${purpose}-${referenceId}-${Date.now()}`;
        const totalAmount = String(amount);
        const signature = generateSignature(totalAmount, transactionUuid, PRODUCT_CODE);

        const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const successPath = purpose === "verification"
            ? "/verification"
            : purpose.startsWith("pro_subscription")
                ? "/analytics"
                : "/project";

        const formFields = {
            amount: totalAmount,
            tax_amount: "0",
            total_amount: totalAmount,
            transaction_uuid: transactionUuid,
            product_code: PRODUCT_CODE,
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: `${origin}${successPath}?payment=success&purpose=${purpose}&refId=${referenceId}`,
            failure_url: `${origin}${successPath}?payment=failed`,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            signature,
        };

        return NextResponse.json({
            formFields,
            actionUrl: process.env.NEXT_PUBLIC_ESEWA_FORM_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
        });
    } catch (err) {
        console.error("eSewa initiate error:", err);
        return NextResponse.json({ error: "Failed to initiate eSewa payment" }, { status: 500 });
    }
}