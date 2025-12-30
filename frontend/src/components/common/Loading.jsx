// frontend/src/components/common/Loading.jsx

export const Loading = ({ text = "Cargando...", fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return <div className="py-12">{content}</div>;
};

export const Spinner = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizes[size]} ${className}`}
    ></div>
  );
};
