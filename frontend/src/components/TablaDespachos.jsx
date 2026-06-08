export default function TablaDespachos({ columnas, datos, totales }) {
  if (!datos || datos.length === 0) {
    return <p className="text-gray-400 text-sm py-4 text-center">Sin registros para mostrar.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-enzotec-border shadow-sm bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-enzotec-ink text-white">
            {columnas.map(col => (
              <th key={col.key} className="px-4 py-3 text-left font-medium whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.map((fila, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {columnas.map(col => (
                <td key={col.key} className="px-4 py-2 whitespace-nowrap text-gray-700">
                  {col.render ? col.render(fila[col.key], fila) : fila[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {totales && (
          <tfoot>
            <tr className="bg-enzotec-softRed font-semibold border-t-2 border-red-200">
              {columnas.map(col => (
                <td key={col.key} className="px-4 py-2 whitespace-nowrap text-gray-800">
                  {totales[col.key] ?? ''}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
