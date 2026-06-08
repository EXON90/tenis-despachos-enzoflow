import { useRef, useState } from 'react'
import { CheckCircle2, FileUp, XCircle } from 'lucide-react'
import { api } from '../api'

export default function CargaCSV() {
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando]   = useState(false)
  const [error, setError]         = useState('')
  const [arrastre, setArrastre]   = useState(false)
  const inputRef = useRef()

  const procesar = async (file) => {
    if (!file) return
    setCargando(true)
    setError('')
    setResultado(null)
    try {
      const res = await api.uploadCSV(file)
      setResultado(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setArrastre(false)
    const file = e.dataTransfer.files[0]
    if (file) procesar(file)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-enzotec-ink">Cargar archivo CSV</h1>

      {/* Zona de carga */}
      <div
        onDragOver={(e) => { e.preventDefault(); setArrastre(true) }}
        onDragLeave={() => setArrastre(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          arrastre ? 'border-enzotec-red bg-enzotec-softRed' : 'border-gray-300 hover:border-enzotec-red bg-white'
        }`}
      >
        <FileUp size={42} className="mx-auto mb-3 text-enzotec-red" />
        <p className="text-gray-600 font-medium">Arrastra tu archivo CSV aquí</p>
        <p className="text-gray-400 text-sm mt-1">o haz clic para seleccionar</p>
        <input
          ref={inputRef} type="file" accept=".csv"
          className="hidden"
          onChange={e => procesar(e.target.files[0])}
        />
      </div>

      {/* Columnas requeridas */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 border border-gray-100">
        <p className="font-semibold mb-1">Columnas requeridas en el CSV:</p>
        <p className="text-xs text-gray-500 mb-2">Archivo UTF-8 separado por punto y coma (;)</p>
        <code className="text-xs text-enzotec-red">
          fecha_despacho; cliente_nombre; cliente_nit; referencia; talla; cantidad_pares; precio_unitario
        </code>
      </div>

      {/* Estado de carga */}
      {cargando && (
        <div className="text-center py-6 text-enzotec-red font-medium animate-pulse">
          Procesando archivo...
        </div>
      )}

      {/* Error global */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          <span className="inline-flex items-center gap-2"><XCircle size={18} /> {error}</span>
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="font-semibold text-green-800 mb-2 inline-flex items-center gap-2">
              <CheckCircle2 size={18} />
              Carga completada: {resultado.nombre_archivo}
            </p>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-2xl font-bold text-gray-900">{resultado.total_filas}</p>
                <p className="text-gray-500">Total filas</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-2xl font-bold text-green-600">{resultado.filas_ok}</p>
                <p className="text-gray-500">Importadas</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-2xl font-bold text-red-500">{resultado.filas_error}</p>
                <p className="text-gray-500">Con error</p>
              </div>
            </div>
          </div>

          {resultado.errores.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="font-semibold text-red-700 mb-2">Detalle de errores:</p>
              <ul className="space-y-1 text-sm text-red-600">
                {resultado.errores.map((e, i) => (
                  <li key={i}>Fila {e.fila}: {e.motivo}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
