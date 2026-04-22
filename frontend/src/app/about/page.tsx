import InfoLayout from "@/components/ui/InfoLayout";

export default function About() {
    return (
        <InfoLayout title="About NConnect" subtitle="Connecting the world&apos;s social impact professionals.">
            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-slate-800">Our Mission</h2>
                    <p className="text-slate-600 leading-relaxed text-lg">
                        NConnect is the world&apos;s first professional network dedicated exclusively to the social sector.
                        Our mission is simple: Connect NGOs with the talent they need to change the world.
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
                    {[
                        { label: "NGOs", val: "12k+" },
                        { label: "Volunteers", val: "1.2M" },
                        { label: "Countries", val: "140+" }
                    ].map(s => (
                        <div key={s.label} className="text-center p-6 border border-slate-100 rounded-xl bg-slate-50">
                            <div className="text-3xl font-bold text-indigo-600">{s.val}</div>
                            <div className="text-slate-500 text-sm uppercase tracking-wider mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </InfoLayout>
    );
}