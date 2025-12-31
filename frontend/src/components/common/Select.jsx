// frontend/src/components/common/Select.jsx

import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Seleccionar...",
  searchable = false,
  clearable = false,
  disabled = false,
  error,
  required = false,
  className = "",
  renderOption,
  getOptionLabel = (opt) => opt.label || opt.nombre || opt,
  getOptionValue = (opt) => opt.value || opt.id || opt,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus en búsqueda al abrir
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Filtrar opciones
  const filteredOptions = searchable
    ? options.filter((opt) =>
        getOptionLabel(opt).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Obtener opción seleccionada
  const selectedOption = options.find((opt) => getOptionValue(opt) === value);

  const handleSelect = (option) => {
    onChange(getOptionValue(option));
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left border rounded-lg flex items-center justify-between gap-2
          ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white cursor-pointer hover:border-gray-400"
          }
          ${error ? "border-red-500" : "border-gray-300"}
          ${isOpen ? "ring-2 ring-blue-500 border-transparent" : ""}
        `}
      >
        <span className={selectedOption ? "text-gray-800" : "text-gray-500"}>
          {selectedOption ? getOptionLabel(selectedOption) : placeholder}
        </span>

        <div className="flex items-center gap-1">
          {clearable && selectedOption && !disabled && (
            <X
              className="w-4 h-4 text-gray-400 hover:text-gray-600"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Búsqueda */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Opciones */}
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const optionValue = getOptionValue(option);
                const isSelected = optionValue === value;

                return (
                  <button
                    key={optionValue || index}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50
                      ${
                        isSelected
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      }
                    `}
                  >
                    {renderOption ? (
                      renderOption(option)
                    ) : (
                      <span>{getOptionLabel(option)}</span>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Select múltiple
export const MultiSelect = ({
  label,
  value = [],
  onChange,
  options = [],
  placeholder = "Seleccionar...",
  disabled = false,
  error,
  required = false,
  getOptionLabel = (opt) => opt.label || opt.nombre || opt,
  getOptionValue = (opt) => opt.value || opt.id || opt,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    getOptionLabel(opt).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (option) => {
    const optionValue = getOptionValue(option);
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemove = (optionValue) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedOptions = options.filter((opt) =>
    value.includes(getOptionValue(opt))
  );

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          min-h-[42px] px-2 py-1 border rounded-lg cursor-pointer
          ${disabled ? "bg-gray-100" : "bg-white hover:border-gray-400"}
          ${error ? "border-red-500" : "border-gray-300"}
          ${isOpen ? "ring-2 ring-blue-500 border-transparent" : ""}
        `}
      >
        {selectedOptions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedOptions.map((opt) => (
              <span
                key={getOptionValue(opt)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded"
              >
                {getOptionLabel(opt)}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-blue-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(getOptionValue(opt));
                  }}
                />
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-500 py-1">{placeholder}</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.map((option) => {
              const optionValue = getOptionValue(option);
              const isSelected = value.includes(optionValue);

              return (
                <button
                  key={optionValue}
                  type="button"
                  onClick={() => handleToggle(option)}
                  className={`
                    w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50
                    ${isSelected ? "bg-blue-50" : ""}
                  `}
                >
                  <span>{getOptionLabel(option)}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
