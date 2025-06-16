import LabelShadcn from "@/shared/components/ui/LabelShadcn";

export const LineChart = ({
  data,
  title,
  color,
}: {
  data: Array<{ date: string; count: number }>;
  title: string;
  color: string;
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-6">
          <LabelShadcn text={title} translate className="text-xl font-bold text-gray-800" />
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <LabelShadcn text="admin:error.error-loading-data" translate className="text-gray-500 text-sm" />
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <LabelShadcn text="admin:error.error-loading-data" translate className="text-gray-500 text-sm" />
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.count));
  const minValue = 0;
  const range = maxValue - minValue || 1;

  const createPath = () => {
    const width = 100;
    const height = 100;

    return data
      .map((item, index) => {
        const x = (index / Math.max(data.length - 1, 1)) * width;
        const y = height - ((item.count - minValue) / range) * height;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  const getColorValues = () => {
    switch (color) {
      case "bg-blue-500":
        return { stroke: "#3B82F6", fill: "#3B82F6" };
      case "bg-purple-500":
        return { stroke: "#8B5CF6", fill: "#8B5CF6" };
      case "bg-amber-500":
        return { stroke: "#F59E0B", fill: "#F59E0B" };
      default:
        return { stroke: "#3B82F6", fill: "#3B82F6" };
    }
  };

  const colors = getColorValues();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-6">
        <LabelShadcn text={title} translate className="text-xl font-bold text-gray-800" />
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <LabelShadcn
            text={`${data.length} admin:chart.point-data`}
            translate
            className="text-sm text-gray-500 font-medium"
            splitAndTranslate
          />
        </div>
      </div>

      <div className="relative h-64 bg-gradient-to-t from-gray-50/50 to-white rounded-lg p-4">
        {/* Grid lines */}
        <div className="absolute inset-4">
          {/* Horizontal grid lines */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`h-${i}`} className="absolute w-full h-px bg-gray-200" style={{ top: `${i * 25}%` }} />
          ))}
        </div>

        {/* Chart container */}
        <div className="relative h-full">
          {/* SVG Line Chart */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Gradient definition */}
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s+/g, "-")}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.fill} stopOpacity="0.2" />
                <stop offset="100%" stopColor={colors.fill} stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Area under curve */}
            <path d={`${createPath()} L 100 100 L 0 100 Z`} fill={`url(#gradient-${title.replace(/\s+/g, "-")})`} />

            {/* Main line */}
            <path d={createPath()} stroke={colors.stroke} strokeWidth="0.8" fill="none" className="drop-shadow-sm" />
          </svg>

          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * 100;
            const y = 100 - ((item.count - minValue) / range) * 100;

            return (
              <div
                key={index}
                className="absolute group cursor-pointer"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Data point */}
                <div
                  className={`w-2 h-2 ${color} rounded-full border-2 border-white shadow-lg group-hover:scale-150 transition-transform duration-200`}
                />

                {/* Tooltip */}
                <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-10">
                  <div className="font-semibold text-center">{item.count.toLocaleString()}</div>
                  <div className="text-gray-300 text-xs text-center">
                    {new Date(item.date).toLocaleDateString("vi-VN")}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Y-axis labels */}
        <div className="absolute -left-8 top-2 h-full flex flex-col justify-between text-xs text-gray-500 font-medium pb-4">
          <span className="bg-white px-2 py-1 rounded shadow-md border border-gray-200">
            {maxValue.toLocaleString()}
          </span>
          <span className="bg-white px-2 py-1 rounded shadow-md border border-gray-200">
            {Math.round(maxValue * 0.75).toLocaleString()}
          </span>
          <span className="bg-white px-2 py-1 rounded shadow-md border border-gray-200">
            {Math.round(maxValue * 0.5).toLocaleString()}
          </span>
          <span className="bg-white px-2 py-1 rounded shadow-md border border-gray-200">
            {Math.round(maxValue * 0.25).toLocaleString()}
          </span>
          <span className="bg-white px-2 py-1 rounded shadow-md border border-gray-200">0</span>
        </div>

        {/* X-axis labels */}
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <LabelShadcn
            text={new Date(data[0].date).toLocaleDateString("vi-VN", { month: "short", day: "numeric" })}
            translate
            className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded shadow-md border border-gray-200"
          />
          {data.length > 1 && (
            <LabelShadcn
              text={new Date(data[data.length - 1].date).toLocaleDateString("vi-VN", {
                month: "short",
                day: "numeric",
              })}
              translate
              className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded shadow-md border border-gray-200"
            />
          )}
        </div>
      </div>
    </div>
  );
};
