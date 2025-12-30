// frontend/src/components/common/Header.jsx

import { Bell, Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export const Header = ({ toggleSidebar, title, subtitle }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>

            <div>
              {title && (
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-white">
                  {user?.nombre_completo?.charAt(0) || "U"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {user?.nombre_completo?.split(" ")[0]}
                </p>
                <p className="text-xs text-gray-600">{user?.rol}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
