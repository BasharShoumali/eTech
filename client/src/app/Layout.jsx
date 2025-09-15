import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-black text-teal-200">
      <header className="sticky top-0 bg-zinc-900/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-6xl mx-auto flex items-center gap-6 px-4 h-14">
          <NavLink
            to="/"
            className="flex items-center gap-2 font-bold tracking-wide"
          >
            <img
              src="/brand/e-tech-wordmark.svg"
              alt="E-Tech"
              height="24"
              className="h-6"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <span>E‑Tech</span>
          </NavLink>
          <nav className="ml-auto flex items-center gap-4 text-sm">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? "text-white" : "opacity-80 hover:opacity-100"
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                isActive ? "text-white" : "opacity-80 hover:opacity-100"
              }
            >
              Cart
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? "text-white" : "opacity-80 hover:opacity-100"
              }
            >
              Admin
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-zinc-800 text-xs text-zinc-400 py-3 text-center">
        © {new Date().getFullYear()} E‑Tech
      </footer>
    </div>
  );
}
