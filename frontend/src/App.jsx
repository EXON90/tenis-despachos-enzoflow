import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import CargaCSV from './pages/CargaCSV'
import Clientes from './pages/Clientes'
import ClienteDetalle from './pages/ClienteDetalle'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-enzotec-surface">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/"               element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"      element={<Dashboard />} />
            <Route path="/cargar-csv"     element={<CargaCSV />} />
            <Route path="/clientes"       element={<Clientes />} />
            <Route path="/clientes/:nit"  element={<ClienteDetalle />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
