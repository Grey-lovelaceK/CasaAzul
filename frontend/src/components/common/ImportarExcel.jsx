// frontend/src/components/common/ImportarExcel.jsx

import {
  AlertCircle,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "./Button";
import { Modal } from "./Modal";

export const ImportarExcel = ({
  isOpen,
  onClose,
  onImport,
  campos,
  titulo = "Importar desde Excel/CSV",
  plantillaData = [],
  nombreArchivo = "plantilla",
}) => {
  const fileInputRef = useRef(null);
  const [archivo, setArchivo] = useState(null);
  const [datos, setDatos] = useState([]);
  const [errores, setErrores] = useState([]);
  const [paso, setPaso] = useState(1); // 1: subir, 2: previsualizar, 3: resultado
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  // Descargar plantilla Excel
  const descargarPlantilla = () => {
    const ws = XLSX.utils.json_to_sheet(
      plantillaData.length > 0
        ? plantillaData
        : [
            campos.reduce(
              (acc, campo) => ({ ...acc, [campo.nombre]: campo.ejemplo || "" }),
              {}
            ),
          ]
    );

    // Agregar encabezados con nombres amigables
    const headers = campos.map((c) => c.label);
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos");
    XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
  };

  // Procesar archivo subido
  const procesarArchivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setArchivo(file);
    setErrores([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (jsonData.length < 2) {
          setErrores(["El archivo está vacío o solo tiene encabezados"]);
          return;
        }

        // Obtener encabezados (primera fila)
        const headers = jsonData[0];

        // Mapear nombres de columnas a campos
        const columnMap = {};
        campos.forEach((campo) => {
          const index = headers.findIndex(
            (h) =>
              h?.toLowerCase() === campo.label.toLowerCase() ||
              h?.toLowerCase() === campo.nombre.toLowerCase()
          );
          if (index !== -1) {
            columnMap[campo.nombre] = index;
          }
        });

        // Validar que estén todos los campos requeridos
        const camposRequeridos = campos.filter((c) => c.requerido);
        const camposFaltantes = camposRequeridos.filter(
          (c) => columnMap[c.nombre] === undefined
        );

        if (camposFaltantes.length > 0) {
          setErrores([
            `Faltan columnas requeridas: ${camposFaltantes
              .map((c) => c.label)
              .join(", ")}`,
          ]);
          return;
        }

        // Procesar filas de datos
        const datosProcessados = [];
        const erroresTemp = [];

        for (let i = 1; i < jsonData.length; i++) {
          const fila = jsonData[i];
          if (!fila || fila.every((cell) => !cell)) continue; // Saltar filas vacías

          const registro = {};
          let filaValida = true;

          campos.forEach((campo) => {
            const index = columnMap[campo.nombre];
            let valor = index !== undefined ? fila[index] : null;

            // Limpiar valor
            if (typeof valor === "string") {
              valor = valor.trim();
            }

            // Validar campo requerido
            if (campo.requerido && (!valor || valor === "")) {
              erroresTemp.push(`Fila ${i + 1}: ${campo.label} es requerido`);
              filaValida = false;
            }

            // Validar tipo
            if (valor && campo.tipo === "email" && !isValidEmail(valor)) {
              erroresTemp.push(`Fila ${i + 1}: Email inválido "${valor}"`);
              filaValida = false;
            }

            if (valor && campo.tipo === "rut" && !isValidRut(valor)) {
              erroresTemp.push(`Fila ${i + 1}: RUT inválido "${valor}"`);
              filaValida = false;
            }

            registro[campo.nombre] = valor || campo.default || null;
          });

          if (filaValida) {
            datosProcessados.push(registro);
          }
        }

        setDatos(datosProcessados);
        setErrores(erroresTemp);
        setPaso(2);
      } catch (error) {
        setErrores(["Error al procesar el archivo. Verifica el formato."]);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Validar email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validar RUT chileno (básico)
  const isValidRut = (rut) => {
    const cleaned = rut.replace(/[^0-9kK]/g, "");
    return cleaned.length >= 8 && cleaned.length <= 9;
  };

  // Importar datos
  const handleImportar = async () => {
    setLoading(true);
    try {
      const result = await onImport(datos);
      setResultado(result);
      setPaso(3);
    } catch (error) {
      setErrores([error.message || "Error al importar datos"]);
    } finally {
      setLoading(false);
    }
  };

  // Reiniciar
  const reiniciar = () => {
    setArchivo(null);
    setDatos([]);
    setErrores([]);
    setPaso(1);
    setResultado(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    reiniciar();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={titulo} size="lg">
      <div className="space-y-6">
        {/* Paso 1: Subir archivo */}
        {paso === 1 && (
          <>
            {/* Instrucciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                📋 Instrucciones
              </h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc ml-4">
                <li>Descarga la plantilla Excel con el formato correcto</li>
                <li>Completa los datos siguiendo el ejemplo</li>
                <li>Sube el archivo completado</li>
                <li>Los campos marcados con * son obligatorios</li>
              </ul>
            </div>

            {/* Campos esperados */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">
                Campos del archivo:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {campos.map((campo) => (
                  <div key={campo.nombre} className="text-sm">
                    <span
                      className={
                        campo.requerido ? "font-medium" : "text-gray-600"
                      }
                    >
                      {campo.label}
                      {campo.requerido && (
                        <span className="text-red-500">*</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón descargar plantilla */}
            <Button
              variant="outline"
              icon={Download}
              onClick={descargarPlantilla}
              fullWidth
            >
              Descargar Plantilla Excel
            </Button>

            {/* Área de subida */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Haz clic para subir tu archivo
              </p>
              <p className="text-sm text-gray-500">
                Formatos aceptados: .xlsx, .xls, .csv
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={procesarArchivo}
                className="hidden"
              />
            </div>

            {/* Errores */}
            {errores.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">Errores encontrados:</span>
                </div>
                <ul className="text-sm text-red-600 space-y-1 ml-7 list-disc">
                  {errores.slice(0, 5).map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                  {errores.length > 5 && (
                    <li>... y {errores.length - 5} errores más</li>
                  )}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Paso 2: Previsualizar */}
        {paso === 2 && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800">
                  Vista previa de datos
                </h4>
                <p className="text-sm text-gray-600">
                  {datos.length} registros listos para importar
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={reiniciar}>
                Cambiar archivo
              </Button>
            </div>

            {/* Advertencias */}
            {errores.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-700 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">
                    Advertencias ({errores.length} filas con problemas):
                  </span>
                </div>
                <ul className="text-sm text-yellow-600 space-y-1 ml-7 list-disc max-h-32 overflow-y-auto">
                  {errores.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tabla de vista previa */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-80 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">
                        #
                      </th>
                      {campos.slice(0, 5).map((campo) => (
                        <th
                          key={campo.nombre}
                          className="px-3 py-2 text-left font-semibold text-gray-600"
                        >
                          {campo.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {datos.slice(0, 10).map((registro, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                        {campos.slice(0, 5).map((campo) => (
                          <td key={campo.nombre} className="px-3 py-2">
                            {registro[campo.nombre] || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {datos.length > 10 && (
                <div className="bg-gray-50 px-3 py-2 text-sm text-gray-600 text-center">
                  Mostrando 10 de {datos.length} registros
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleImportar} loading={loading} icon={Upload}>
                Importar {datos.length} registros
              </Button>
            </div>
          </>
        )}

        {/* Paso 3: Resultado */}
        {paso === 3 && resultado && (
          <>
            <div className="text-center py-6">
              {resultado.success ? (
                <>
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    ¡Importación exitosa!
                  </h3>
                  <p className="text-gray-600 mb-4">{resultado.message}</p>

                  {resultado.detalles && (
                    <div className="bg-green-50 rounded-lg p-4 text-left max-w-md mx-auto">
                      <div className="space-y-2 text-sm">
                        {resultado.detalles.creados !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Creados:</span>
                            <span className="font-semibold text-green-600">
                              {resultado.detalles.creados}
                            </span>
                          </div>
                        )}
                        {resultado.detalles.actualizados !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Actualizados:</span>
                            <span className="font-semibold text-blue-600">
                              {resultado.detalles.actualizados}
                            </span>
                          </div>
                        )}
                        {resultado.detalles.errores !== undefined &&
                          resultado.detalles.errores > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Con errores:
                              </span>
                              <span className="font-semibold text-red-600">
                                {resultado.detalles.errores}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <X className="w-16 h-16 mx-auto mb-4 text-red-500" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Error en la importación
                  </h3>
                  <p className="text-red-600">{resultado.message}</p>
                </>
              )}
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={reiniciar}>
                Importar otro archivo
              </Button>
              <Button onClick={handleClose}>Cerrar</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
