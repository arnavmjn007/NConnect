import InfoLayout from "@/components/ui/InfoLayout";
import { Eye, Keyboard, Type, MousePointer2 } from "lucide-react";

export default function AccessibilityPage() {
    const features = [
        {
            icon: <Eye className="text-indigo-600" />,
            title: "Visual Support",
            desc: "High contrast ratios and support for screen readers like NVDA and VoiceOver."
        },
        {
            icon: <Keyboard className="text-indigo-600" />,
            title: "Keyboard Navigation",
            desc: "Full functionality via keyboard without the need for a mouse."
        },
        {
            icon: <Type className="text-indigo-600" />,
            title: "Text Scaling",
            desc: "Layout remains functional even when text size is increased by 200%."
        },
        {
            icon: <MousePointer2 className="text-indigo-600" />,
            title: "Predictable Layout",
            desc: "Consistent navigation patterns and clear focus indicators across the platform."
        },
    ];

    return (
        <InfoLayout
            title="Accessibility"
            subtitle="Our commitment to making NConnect inclusive for everyone."
        >
            <div className="space-y-10">
                <section>
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">Our Commitment</h2>
                    <p className="text-slate-600 leading-relaxed">
                        At NConnect, we believe that social impact shouldn&apos;t have barriers. We are committed to ensuring
                        that our platform is accessible to everyone, regardless of ability or technology. We aim to
                        meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((feature, idx) => (
                        <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-300">
                            <div className="mb-4 p-2 bg-white w-fit rounded-lg shadow-sm">
                                {feature.icon}
                            </div>
                            <h3 className="font-bold text-slate-800 mb-2">{feature.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                <section className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
                    <h2 className="text-xl font-bold text-indigo-900 mb-2">Need Assistance?</h2>
                    <p className="text-indigo-800/80 mb-4">
                        If you encounter any accessibility barriers while using NConnect, please let us know.
                        We welcome your feedback to help us improve.
                    </p>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors">
                        Contact Support
                    </button>
                </section>

                <footer className="pt-6 border-t border-slate-100">
                    <p className="text-xs text-slate-400 italic">
                        Last updated: April 2026. NConnect continues to audit and improve accessibility features
                        on an ongoing basis.
                    </p>
                </footer>
            </div>
        </InfoLayout>
    );
}