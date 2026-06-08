import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Menu, Upload, Users, X } from 'lucide-react'

const links = [
  { to: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clientes',   label: 'Clientes', icon: Users },
  { to: '/cargar-csv', label: 'Cargar CSV', icon: Upload },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-white text-enzotec-ink shadow-sm border-b border-enzotec-border">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="font-bold text-lg tracking-wide">
          <span className="text-enzotec-red">ENZO</span>FLOW
        </span>

        {/* Desktop */}
        <div className="hidden md:flex gap-6">
          {links.map(l => (
            <NavLink
              key={l.to} to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium pb-1 border-b-2 transition-colors inline-flex items-center gap-2 ${
                  isActive ? 'border-enzotec-red text-enzotec-red' : 'border-transparent text-gray-600 hover:text-enzotec-ink'
                }`
              }
            >
              <l.icon size={17} strokeWidth={1.8} />
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-enzotec-ink" onClick={() => setOpen(!open)}>
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white px-4 pb-4 flex flex-col gap-3 border-t border-enzotec-border">
          {links.map(l => (
            <NavLink
              key={l.to} to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-sm font-medium py-1 inline-flex items-center gap-2 ${isActive ? 'text-enzotec-red font-bold' : 'text-gray-600'}`
              }
            >
              <l.icon size={17} strokeWidth={1.8} />
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}
