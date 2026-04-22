import InfoLayout from "@/components/ui/InfoLayout";

export default function Privacy() {
    return (
        <InfoLayout title="Privacy Policy" subtitle="Effective: April 22, 2026">
            <article className="prose prose-slate max-w-none">
                <h2 className="text-xl font-bold mb-4">Your Privacy Matters</h2>
                <p className="text-slate-600 mb-6 italic">This policy describes how we handle your personal data for our services on the NConnect website.</p>
                
                <h3 className="font-bold mt-8 mb-2">1. Data We Collect</h3>
                <p className="text-slate-600">We collect information you provide, such as your name, email address, and professional background. We also collect data about your interactions with NGOs and other volunteers.</p>
                
                <h3 className="font-bold mt-8 mb-2">2. How We Use Data</h3>
                <p className="text-slate-600">We use your data to authenticate you, provide customer support, and personalize the projects and resources we suggest to you.</p>
            </article>
        </InfoLayout>
    );
}