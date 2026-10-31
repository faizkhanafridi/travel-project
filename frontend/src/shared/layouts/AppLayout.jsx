import { Link, Outlet, useNavigate } from "react-router-dom";
import { LogOut, User, Settings, ShieldCheck } from "lucide-react";
import Logo from "../components/Logo";
import Button from "../components/Button";
import useAuthStore from "../stores/authStore";
import { useLogout } from "../../modules/auth/hooks/useLogout";
import { useState } from "react";

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const logout = useLogout();
  const navigate = useNavigate();

  const isApprovedAgent = user?.roles?.includes("agent");

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout.mutateAsync().catch(() => null);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>

          <nav className="flex items-center gap-2">
            {!isApprovedAgent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/become-agent")}
              >
                Become an Agent
              </Button>
            )}

            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-ink-200 pl-1 pr-2 py-1 hover:border-ink-300 focus-ring"
              >
                <span className="grid place-items-center h-8 w-8 rounded-full bg-primary text-white text-sm font-semibold">
                  {(user?.email || "U").slice(0, 1).toUpperCase()}
                </span>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-ink-200 bg-white shadow-pop z-40 overflow-hidden">
                    <div className="px-3 py-2 border-b border-ink-100">
                      <p className="text-sm font-medium text-ink-900 truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs text-ink-500 capitalize">
                        {user?.account_type?.replace("_", " ")}
                      </p>
                    </div>
                    {user?.roles?.includes("super_admin") && (
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/admin/agents");
                        }}
                      >
                        <ShieldCheck size={16} /> Admin panel
                      </button>
                    )}
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/profile");
                      }}
                    >
                      <User size={16} /> Profile
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate(
                          user?.has_password
                            ? "/change-password"
                            : "/set-password-account",
                        );
                      }}
                    >
                      <Settings size={16} />
                      {user?.has_password ? "Change password" : "Set password"}
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/5"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
