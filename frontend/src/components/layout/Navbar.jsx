import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  Plane,
  User,
  Briefcase,
  Shield,
  Settings,
  Compass,
  ListChecks,
  MessageCircle,
  ListOrdered,
  Inbox,
  Wallet,
} from "lucide-react";

import { useAuthStore } from "../../stores/authStore";
import { authService } from "../../modules/auth/services/authService";
import CurrencySwitcher from "../../modules/travel-services/components/CurrencySwitcher";

export default function Navbar() {
  const { user, clearUser } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    clearUser();
    navigate("/login", { replace: true });
  };

  const initials = (user?.name || "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Plane className="w-4 h-4 text-white -rotate-45" />
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight">
            Travel Marketplace
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            {user.is_customer && !user.is_agent && (
              <Link
                to="/agent/apply"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                <Briefcase className="w-4 h-4" />
                Become an Agent
              </Link>
            )}

            <Link
              to="/marketplace"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Compass className="w-4 h-4" />
              Marketplace
            </Link>
            <Link
              to="/travel-posts"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <ListOrdered className="w-4 h-4" />
              Travel posts
            </Link>

            <MenuLink
              to="/messages"
              icon={MessageCircle}
              onClick={() => setOpen(false)}
            >
              Messages
            </MenuLink>

            <CurrencySwitcher />

            <div className="relative" ref={ref}>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white pl-1 pr-2 py-1 hover:bg-slate-50 transition"
              >
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-xs font-bold flex items-center justify-center">
                  {initials}
                </span>
                <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[140px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg py-1 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <MenuLink
                    to="/profile"
                    icon={User}
                    onClick={() => setOpen(false)}
                  >
                    My profile
                  </MenuLink>

                  {user.is_customer && !user?.is_agent &&  (
                    <MenuLink
                      to="/my-travel-posts"
                      icon={Inbox}
                      onClick={() => setOpen(false)}
                    >
                      My travel posts
                    </MenuLink>
                  )}
                  {user?.is_agent && (
                    <>
                      <MenuLink
                        to="/my-offers"
                        icon={Inbox}
                        onClick={() => setOpen(false)}
                      >
                        My offers
                      </MenuLink>
                      <MenuLink
                        to="/agent/service-requests"
                        icon={Inbox}
                        onClick={() => setOpen(false)}
                      >
                        Service requests
                      </MenuLink>
                      <MenuLink
                        to="/connects"
                        icon={Wallet}
                        onClick={() => setOpen(false)}
                      >
                        Connects
                      </MenuLink>

                      <Link
                        to="/services/mine"
                        className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <ListChecks className="w-4 h-4" />
                        My services
                      </Link>
                    </>
                  )}

                  {user.is_super_admin && (
                    <MenuLink
                      to="/admin/services"
                      icon={Shield}
                      onClick={() => setOpen(false)}
                    >
                      Admin · Services
                    </MenuLink>
                  )}
                  {user.is_agent && (
                    <MenuLink
                      to="/agent/account"
                      icon={Briefcase}
                      onClick={() => setOpen(false)}
                    >
                      My agency
                    </MenuLink>
                  )}
                  {user.is_super_admin && (
                    <MenuLink
                      to="/admin/agents"
                      icon={Shield}
                      onClick={() => setOpen(false)}
                    >
                      Admin · Agents
                    </MenuLink>
                  )}
                  <MenuLink
                    to="/profile"
                    icon={Settings}
                    onClick={() => setOpen(false)}
                  >
                    Settings
                  </MenuLink>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function MenuLink({ to, icon: Icon, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
    >
      <Icon className="w-4 h-4" />
      {children}
    </Link>
  );
}
