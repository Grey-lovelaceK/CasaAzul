// frontend/src/components/common/Input.jsx

export const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  icon: Icon,
  className = "",
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}

        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${Icon ? "pl-10" : ""}
            ${error ? "border-red-500" : "border-gray-300"}
            ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
          `}
          {...props}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
