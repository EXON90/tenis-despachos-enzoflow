import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Search } from 'lucide-react'
import { api } from '../api'
import TablaDespachos from '../components/TablaDespachos'

const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [buscar, setBuscar]     = useState('')
  const [error, setError]       = useState('')
  const navigate = useNavigate()

  const cargar = (q = '') => {
    api.getClientes(q)
      .then(setClientes)
      .catch(e => setError(e.message))
  }

  useEffect(() => { cargar() }, [])

  const onBuscar = (e) => {
    setBuscar(e.target.value)
    cargar(e.target.value)
  }

  const columnas = [
    { key: 'nombre',          label: 'Cliente' },
    { key: 'nit',             label: 'NIT' },
    { key: 'total_despachos', label: 'Despachos' },
    { key: 'total_pares',     label: 'Pares',
      render: v => <span className="font-semibold">{v.toLocaleString('es-CO')}</span> },
    { key: 'valor_total',     label: 'Valor total',
      render: v => <span className="font-semibold text-emerald-700">{fmt(v)}</span> },
    { key: 'ultimo_despacho', label: 'Último despacho' },
    { key: 'acciones',        label: '',
      render: (_, fila) => (
        <button
          onClick={() => navigate(`/clientes/${encodeURIComponent(fila.nit)}`)}
          className="text-enzotec-red hover:text-enzotec-darkRed text-xs font-medium inline-flex items-center gap-1"
        >
          <Eye size={15} />
          Ver detalle
        </button>
      )
    },
  ]

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-enzotec-ink">Clientes</h1>

      <div className="relative w-full sm:w-80">
        <Search size={17} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o NIT..."
          value={buscar}
          onChange={onBuscar}
          className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-enzotec-red"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <TablaDespachos columnas={columnas} datos={clientes} />
    </div>
  )
}
