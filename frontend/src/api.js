const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error desconocido' }))
    throw new Error(err.detail || 'Error en la solicitud')
  }
  return res.json()
}

export const api = {
  getResumen:       ()           => request('/clientes/resumen'),
  getClientes:      (buscar='')  => request(`/clientes${buscar ? `?buscar=${encodeURIComponent(buscar)}` : ''}`),
  getCliente:       (nit, desde='', hasta='') => {
    const params = new URLSearchParams()
    if (desde) params.append('fecha_desde', desde)
    if (hasta) params.append('fecha_hasta', hasta)
    const qs = params.toString()
    return request(`/clientes/${encodeURIComponent(nit)}${qs ? `?${qs}` : ''}`)
  },
  getTendencia:     ()           => request('/clientes/tendencia'),
  uploadCSV: (file) => {
    const form = new FormData()
    form.append('file', file)
    return request('/csv/upload', { method: 'POST', body: form })
  },
}
