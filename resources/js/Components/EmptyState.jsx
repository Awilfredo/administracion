function EmptyState({ icon: Icon, title, description, color = "gray" }) {
    const colorMap = {
        green: { bg: "bg-green-50", text: "text-green-500" },
        red: { bg: "bg-red-50", text: "text-red-500" },
        blue: { bg: "bg-blue-50", text: "text-blue-500" },
        gray: { bg: "bg-gray-50", text: "text-gray-400" },
    };

    const colors = colorMap[color] || colorMap.gray;

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div
                className={`w-20 h-20 rounded-full ${colors.bg} flex items-center justify-center mb-4`}
            >
                {Icon && <Icon className={`w-10 h-10 ${colors.text}`} />}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
                {description}
            </p>
        </div>
    );
}

export default EmptyState;
