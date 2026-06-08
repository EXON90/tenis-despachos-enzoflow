export default function TarjetaResumen({ titulo, valor, icono, color = 'blue' }) {
  const colores = {
    red:   'bg-enzotec-softRed text-enzotec-red',
    ink:   'bg-gray-100 text-enzotec-ink',
    gray:  'bg-gray-100 text-gray-700',
    green: 'bg-emerald-50 text-emerald-700',
  }
  return (
    <div className="bg-white rounded-lg shadow-sm border border-enzotec-border p-4 flex items-center gap-4">
      <div className={`rounded-lg p-2.5 ${colores[color] ?? colores.red}`}>{icono}</div>
      <div>
        <p className="text-xs text-enzotec-muted uppercase tracking-wide">{titulo}</p>
        <p className="text-xl font-bold text-enzotec-ink">{valor}</p>
      </div>
    </div>
  )
}
