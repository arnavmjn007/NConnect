import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }
        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
        }
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });
        }
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error("Cloudinary env vars missing");
            return NextResponse.json({ error: "Upload service not configured" }, { status: 500 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: "raw",
                    folder: "nconnect/ngo-docs",
                    format: "pdf",
                    access_mode: "public",
                },
                (error, result) => {
                    if (error || !result) {
                        console.error("Cloudinary upload error:", error);
                        reject(error ?? new Error("Upload failed"));
                    } else {
                        resolve(result as { secure_url: string });
                    }
                }
            ).end(buffer);
        });

        return NextResponse.json({ url: result.secure_url });
    } catch (err) {
        console.error("Upload route error:", err);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}