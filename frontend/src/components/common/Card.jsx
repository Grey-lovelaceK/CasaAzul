// frontend/src/components/common/Card.jsx

export const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  className = "",
  padding = true,
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
    >
      {(title || subtitle || headerAction) && (
        <div
          className={`flex items-center justify-between border-b border-gray-200 ${
            padding ? "p-6" : "px-6 py-4"
          }`}
        >
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className={padding ? "p-6" : ""}>{children}</div>
    </div>
  );
};

export const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  color = "blue",
  trend,
}) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
};
