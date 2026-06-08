import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, CircleDollarSign, Package, ShoppingBag, X } from 'lucide-react'
import { api } from '../api'
import TarjetaResumen from '../components/TarjetaResumen'
import TablaDespachos from '../components/TablaDespachos'

const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function ClienteDetalle() {
  const { nit } = useParams()
  const navigate = useNavigate()
  const [data, setData]         = useState(null)
  const [error, setError]       = useState('')
  const [fechaDesde, setDesde]  = useState('')
  const [fechaHasta, setHasta]  = useState('')

  const cargar = (desde = '', hasta = '') => {
    api.getCliente(decodeURIComponent(nit), desde, hasta)
      .then(setData)
      .catch(e => setError(e.message))
  }

  useEffect(() => { cargar() }, [nit])

  const aplicarFiltro = () => cargar(fechaDesde, fechaHasta)
  const limpiarFiltro = () => { setDesde(''); setHasta(''); cargar() }

  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>
  if (!data)  return <p className="text-gray-400 text-center mt-10">Cargando...</p>

  const { cliente, resumen, despachos } = data

  const columnas = [
    { key: 'fecha_despacho',  label: 'Fecha' },
    { key: 'referencia',      label: 'Referencia' },
    { key: 'talla',           label: 'Talla' },
    { key: 'cantidad_pares',  label: 'Pares' },
    { key: 'precio_unitario', label: 'Precio unit.',
      render: v => fmt(v) },
    { key: 'valor_total',     label: 'Valor total',
      render: v => <span className="font-semibold text-emerald-700">{fmt(v)}</span> },
  ]

  const totales = {
    fecha_despacho:  'TOTALES',
    referencia:      '',
    talla:           '',
    cantidad_pares:  resumen.total_pares.toLocaleString('es-CO'),
    precio_unitario: '',
    valor_total:     fmt(resumen.valor_total),
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <button onClick={() => navigate('/clientes')} className="text-enzotec-red text-sm hover:text-enzotec-darkRed mb-1 inline-flex items-center gap-1">
            <ArrowLeft size={16} />
            Volver a clientes
          </button>
          <h1 className="text-2xl font-bold text-enzotec-ink">{cliente.nombre}</h1>
          <p className="text-gray-400 text-sm">NIT: {cliente.nit}</p>
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <TarjetaResumen titulo="Despachos"       valor={resumen.total_despachos}                     icono={<Package size={23} />}          color="red"   />
        <TarjetaResumen titulo="Total pares"     valor={resumen.total_pares.toLocaleString('es-CO')} icono={<ShoppingBag size={23} />}      color="ink"   />
        <TarjetaResumen titulo="Valor total"     valor={fmt(resumen.valor_total)}                    icono={<CircleDollarSign size={23} />} color="green" />
        <TarjetaResumen titulo="Primer despacho" valor={resumen.primer_despacho ?? '—'}              icono={<CalendarDays size={23} />}     color="gray"  />
        <TarjetaResumen titulo="Último despacho" valor={resumen.ultimo_despacho ?? '—'}              icono={<CalendarDays size={23} />}     color="gray"  />
      </div>

      {/* Filtro por fechas */}
      <div className="bg-white border border-enzotec-border rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-700 mb-3 inline-flex items-center gap-2">
          <CalendarDays size={17} className="text-enzotec-red" />
          Filtrar por fecha
        </p>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input type="date" value={fechaDesde} onChange={e => setDesde(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-enzotec-red" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
            <input type="date" value={fechaHasta} onChange={e => setHasta(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-enzotec-red" />
          </div>
          <button onClick={aplicarFiltro}
            className="bg-enzotec-red hover:bg-enzotec-darkRed text-white text-sm px-4 py-1.5 rounded-lg transition-colors">
            Aplicar
          </button>
          <button onClick={limpiarFiltro}
            className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1.5 rounded-lg border border-gray-200 transition-colors inline-flex items-center gap-1">
            <X size={15} />
            Limpiar
          </button>
        </div>
      </div>

      {/* Tabla de despachos */}
      <TablaDespachos columnas={columnas} datos={despachos} totales={totales} />
    </div>
  )
}
