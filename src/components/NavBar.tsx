import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Smartphone,
  BookOpen,
  BarChart3,
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/add', label: 'Registrar', icon: PlusCircle },
  { path: '/list', label: 'Lista', icon: List },
  { path: '/screens', label: 'Pantallas', icon: Smartphone },
  { path: '/models', label: 'Modelos', icon: BookOpen },
  { path: '/report', label: 'Reportes', icon: BarChart3 },
]

export function NavBar() {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
        <div className="glass flex flex-col h-full">
          <div className="p-5 border-b border-border/50">
            <Link to="/" className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <Smartphone className="size-4 text-white" />
              </div>
              <div>
                <span className="text-base font-semibold tracking-tight">Repote</span>
                <span className="text-[10px] text-muted-foreground block leading-none">Control de Reparaciones</span>
              </div>
            </Link>
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground">Repote v1.0</p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
        <div className="flex justify-around py-2 px-1">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="size-5" />
                <span className="text-[9px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
