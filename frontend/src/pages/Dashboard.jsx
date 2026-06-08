import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleDollarSign, LayoutDashboard, Package, ShoppingBag, Upload, Users, TrendingUp } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer, Customized,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip,
} from 'recharts'
import { api } from '../api'
import TarjetaResumen from '../components/TarjetaResumen'

const fmt      = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
const fmtCorto = n => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

const COLORES = ['#f20505', '#1d4ed8', '#059669', '#d97706', '#7c3aed']

// Label central dentro del SVG → el tooltip HTML siempre queda encima
function CenterLabel({ width, height, totalPares }) {
  const cx = width / 2
  const cy = height / 2
  return (
    <text textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} y={cy - 8} fontSize={20} fontWeight={700} fill="#111827">
        {totalPares.toLocaleString('es-CO')}
      </tspan>
      <tspan x={cx} y={cy + 12} fontSize={11} fill="#6b7280">pares totales</tspan>
    </text>
  )
}

function TooltipDona({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-100 shadow-md rounded-lg px-3 py-2 text-sm">
      <p className="font-semibold text-enzotec-ink">{d.nombre}</p>
      <p className="text-gray-500">Pares: <span className="font-medium text-enzotec-ink">{d.total_pares.toLocaleString('es-CO')}</span></p>
      <p className="text-gray-500">Valor: <span className="font-medium text-emerald-700">{fmt(d.valor_total)}</span></p>
      <p className="text-gray-500">Participación: <span className="font-medium">{d.porcentaje}%</span></p>
    </div>
  )
}

function TooltipPares({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-md rounded-lg px-3 py-2 text-sm">
      <p className="font-semibold text-enzotec-ink mb-1">{label}</p>
      <p className="text-gray-500">Pares: <span className="font-medium text-enzotec-ink">{payload[0]?.value?.toLocaleString('es-CO')}</span></p>
    </div>
  )
}

function TooltipValor({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-md rounded-lg px-3 py-2 text-sm">
      <p className="font-semibold text-enzotec-ink mb-1">{label}</p>
      <p className="text-gray-500">Valor: <span className="font-medium text-emerald-700">{fmt(payload[0]?.value ?? 0)}</span></p>
    </div>
  )
}

export default function Dashboard() {
  const [resumen,   setResumen]   = useState(null)
  const [tendencia, setTendencia] = useState([])
  const [error,     setError]     = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.getResumen()
      .then(setResumen)
      .catch(e => setError(e.message))
    api.getTendencia()
      .then(setTendencia)
      .catch(() => {})
  }, [])

  if (error)    return <p className="text-red-500 text-center mt-10">{error}</p>
  if (!resumen) return <p className="text-gray-400 text-center mt-10">Cargando...</p>

  const totalParesDona = resumen.top5_clientes.reduce((s, c) => s + c.total_pares, 0)
  const datosDona = resumen.top5_clientes.map(c => ({
    ...c,
    porcentaje: totalParesDona > 0 ? ((c.total_pares / totalParesDona) * 100).toFixed(1) : '0.0',
  }))

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-enzotec-ink">Dashboard</h1>
          <p className="text-sm text-enzotec-muted">Resumen principal de despachos y clientes de Enzotec</p>
        </div>
        <button
          onClick={() => navigate('/cargar-csv')}
          className="bg-enzotec-red hover:bg-enzotec-darkRed text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
        >
          <Upload size={17} />
          Cargar CSV
        </button>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TarjetaResumen titulo="Clientes"    valor={resumen.total_clientes}                      icono={<Users size={23} />}            color="red"   />
        <TarjetaResumen titulo="Despachos"   valor={resumen.total_despachos}                     icono={<Package size={23} />}          color="ink"   />
        <TarjetaResumen titulo="Pares"       valor={resumen.total_pares.toLocaleString('es-CO')} icono={<ShoppingBag size={23} />}      color="gray"  />
        <TarjetaResumen titulo="Valor total" valor={fmt(resumen.valor_total_global)}             icono={<CircleDollarSign size={23} />} color="green" />
      </div>

      {/* Fila 1: Dona + Pares por mes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ── Dona ── */}
        <div className="bg-white border border-enzotec-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <LayoutDashboard size={18} className="text-enzotec-red" />
            <h2 className="text-base font-semibold text-enzotec-ink">Participación top 5 clientes</h2>
          </div>

          {datosDona.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">Sin datos</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={datosDona}
                    dataKey="total_pares"
                    nameKey="nombre"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={3}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {datosDona.map((_, i) => (
                      <Cell key={i} fill={COLORES[i % COLORES.length]} />
                    ))}
                  </Pie>
                  {/* Label dentro del SVG: el tooltip HTML siempre queda por encima */}
                  <Customized component={(props) => (
                    <CenterLabel {...props} totalPares={totalParesDona} />
                  )} />
                  <PieTooltip content={<TooltipDona />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-3 space-y-2">
                {datosDona.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORES[i % COLORES.length] }} />
                      <span className="text-enzotec-muted truncate">{c.nombre}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <span className="font-medium text-enzotec-ink w-16 text-right">
                        {c.total_pares.toLocaleString('es-CO')}
                      </span>
                      <span
                        className="text-xs font-semibold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: COLORES[i % COLORES.length] + '25', color: COLORES[i % COLORES.length] }}
                      >
                        {c.porcentaje}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Barras: pares por mes ── */}
        <div className="bg-white border border-enzotec-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag size={18} className="text-enzotec-red" />
            <h2 className="text-base font-semibold text-enzotec-ink">Pares despachados por mes</h2>
          </div>

          {tendencia.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={tendencia} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <BarTooltip content={<TooltipPares />} />
                <Bar dataKey="total_pares" name="Pares" fill="#f20505" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Fila 2: Valor total por mes (ancho completo) */}
      <div className="bg-white border border-enzotec-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-emerald-600" />
          <h2 className="text-base font-semibold text-enzotec-ink">Valor total despachado por mes</h2>
        </div>

        {tendencia.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tendencia} margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tickFormatter={fmtCorto} tick={{ fontSize: 11, fill: '#6b7280' }} />
              <BarTooltip content={<TooltipValor />} />
              <Bar dataKey="valor_total" name="Valor" fill="#059669" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  )
}
