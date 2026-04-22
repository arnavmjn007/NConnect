import InfoLayout from "@/components/ui/InfoLayout";
import { Book, Shield, CreditCard, User } from "lucide-react";

export default function HelpCenter() {
    const categories = [
        { icon: <Book className="text-blue-500"/>, title: "Basics", desc: "Getting started with your profile" },
        { icon: <Shield className="text-emerald-500"/>, title: "Safety", desc: "Reporting and privacy tools" },
        { icon: <User className="text-purple-500"/>, title: "Account", desc: "Manage password and settings" },
        { icon: <CreditCard className="text-orange-500"/>, title: "Donations", desc: "Tax receipts and payments" },
    ];

    return (
        <InfoLayout title="Help Center" subtitle="Arnav, how can we help you today?" showSearch={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(cat => (
                    <div key={cat.title} className="p-6 border border-slate-200 rounded-lg hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg h-fit">{cat.icon}</div>
                        <div>
                            <h3 className="font-bold text-slate-800">{cat.title}</h3>
                            <p className="text-sm text-slate-500">{cat.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </InfoLayout>
    );
}