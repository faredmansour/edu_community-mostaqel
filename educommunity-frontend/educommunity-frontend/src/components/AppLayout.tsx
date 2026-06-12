import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Trophy,
  BarChart3,
  Star,
  User,
  Shield,
  Menu,
  X,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/feed", label: "المجتمع", icon: MessageSquare },
    { path: "/challenges", label: "التحديات", icon: Trophy },
    { path: "/leaderboard", label: "المتصدرون", icon: BarChart3 },
    { path: "/teachers", label: "تقييم المعلمين", icon: Star },
    { path: "/profile", label: "ملفي الشخصي", icon: User },
    ...(user?.role === "admin" ? [{ path: "/admin", label: "لوحة التحكم", icon: Shield }] : []),
  ];

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "student": return "طالب";
      case "teacher": return "معلم";
      case "admin": return "مدير";
      case "supervisor": return "مشرف";
      default: return "زائر";
    }
  };

  const getGradeLabel = (grade?: string) => {
    if (!grade) return "";
    switch (grade) {
      case "primary-1": return "الأول الابتدائي";
      case "primary-2": return "الثاني الابتدائي";
      case "primary-3": return "الثالث الابتدائي";
      case "primary-4": return "الرابع الابتدائي";
      case "primary-5": return "الخامس الابتدائي";
      case "primary-6": return "السادس الابتدائي";
      case "prep-1": return "الأول الإعدادي";
      case "prep-2": return "الثاني الإعدادي";
      case "prep-3": return "الثالث الإعدادي";
      case "sec-1": return "الأول الثانوي";
      case "sec-2": return "الثاني الثانوي";
      case "sec-3": return "الثالث الثانوي";
      default: return grade;
    }
  };

  return (
    <div className="flex min-h-screen">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-64 gradient-hero text-sidebar-foreground transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        } lg:order-first lg:right-auto lg:left-auto`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-accent">
              <GraduationCap className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-sidebar-foreground">مجتمع التعليم</h1>
              <p className="text-xs text-sidebar-foreground/60">مصر 🇪🇬</p>
            </div>
            <button
              className="mr-auto lg:hidden text-sidebar-foreground/70"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {isActive && (
                    <div className="mr-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 rounded-full gradient-accent flex items-center justify-center text-sm font-bold text-accent-foreground shrink-0">
                {user ? user.name.charAt(0) : "ز"}
              </div>
              <div className="flex-1 min-w-0 font-medium">
                <p className="text-sm text-sidebar-foreground truncate">{user ? user.name : "زائر"}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">
                  {user ? `${getGradeLabel(user.grade) || getRoleLabel(user.role)}` : "تصفح محدود"}
                </p>
              </div>
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <Link to="/" className="text-sidebar-foreground/50 hover:text-sidebar-foreground text-xs font-semibold">
                  دخول
                </Link>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 glass-card border-b px-4 py-3 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 text-accent-foreground">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="font-semibold">{user?.points || 0} نقطة</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
