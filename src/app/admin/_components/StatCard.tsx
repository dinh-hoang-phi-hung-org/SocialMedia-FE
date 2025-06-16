import LabelShadcn from "@/shared/components/ui/LabelShadcn";

export const StatCard = ({ title, value, icon, gradient, subtitle }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    gradient: string;
    subtitle?: string;
}) => (
    <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
        {/* Gradient background */}
        <div className={`absolute inset-0 ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />

        {/* Animated border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-500" />

        <div className="relative p-8">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <LabelShadcn text={title} translate className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2" />
                    <p className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                        {typeof value === "number" ? value.toLocaleString() : value}
                    </p>
                    {subtitle && (
                        <LabelShadcn text={subtitle} translate className="text-sm text-gray-500 font-medium" splitAndTranslate />
                    )}
                </div>
                <div className={`p-4 rounded-2xl ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                        {icon}
                    </div>
                </div>
            </div>
        </div>

        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
    </div>
);