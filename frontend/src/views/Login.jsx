// frontend/src/views/Login.jsx

import { AlertCircle, BookOpen } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { useAuth } from "../hooks/useAuth";

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(formData.username, formData.password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message || "Credenciales inválidas");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Casa Azul</h1>
            <p className="text-blue-100">Sistema de Gestión Académica</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Usuario"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Ingresa tu usuario"
                required
                autoFocus
              />

              <Input
                label="Contraseña"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                required
              />

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Iniciar Sesión
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold mb-2">
                Credenciales de prueba:
              </p>
              <div className="text-sm space-y-1">
                <p className="text-gray-700">
                  <span className="font-medium">Usuario:</span> admin
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Contraseña:</span> admin123
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white text-sm">
          <p className="opacity-90">
            © 2025 Casa Azul - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
};
