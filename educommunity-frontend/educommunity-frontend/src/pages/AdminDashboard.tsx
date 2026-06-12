import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, BookOpen, Trophy, TrendingUp, School,
  BarChart3, Activity, Award, Trash2, ShieldAlert
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [adminStats, setAdminStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers()
      ]);
      setAdminStats(statsRes);
      setUsersList(usersRes.users);
    } catch (e: any) {
      toast.error(e.message || "فشل تحميل بيانات لوحة التحكم");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadAdminData();
    }
  }, [user]);

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("لا يمكنك حذف حسابك الشخصي!");
      return;
    }
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا المستخدم نهائياً؟")) return;

    try {
      await api.deleteUser(userId);
      toast.success("تم حذف المستخدم بنجاح");
      setUsersList(usersList.filter(u => u.id !== userId));
      // Refresh stats
      const statsRes = await api.getAdminStats();
      setAdminStats(statsRes);
    } catch (e: any) {
      toast.error(e.message || "فشل حذف المستخدم");
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4 elevated-card rounded-2xl p-6 bg-card border">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground">غير مصرح بالدخول</h2>
        <p className="text-sm text-muted-foreground">هذه الصفحة مخصصة لمديري النظام والمشرفين فقط.</p>
      </div>
    );
  }

  const studentCount = adminStats?.usersByRole?.find((u: any) => u.role === "student")?.count || "0";
  const teacherCount = adminStats?.usersByRole?.find((u: any) => u.role === "teacher")?.count || "0";
  const activeChallenges = adminStats?.activeChallenges || 0;
  const totalPosts = adminStats?.totalPosts || 0;

  const dashboardStats = [
    { label: "إجمالي الطلاب", value: studentCount, icon: Users, color: "text-primary" },
    { label: "إجمالي المعلمين", value: teacherCount, icon: Activity, color: "text-success" },
    { label: "تحديات نشطة", value: String(activeChallenges), icon: Trophy, color: "text-amber-500" },
    { label: "إجمالي المنشورات", value: String(totalPosts), icon: BookOpen, color: "text-primary" },
  ];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "student": return "طالب";
      case "teacher": return "معلم";
      case "admin": return "مدير";
      default: return role;
    }
  };

  const getGradeLabel = (grade?: string) => {
    if (!grade) return "-";
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">لوحة التحكم الإدارية</h1>
        <p className="text-muted-foreground mt-1">مراقبة تفاعل المنصة وإدارة حسابات المستخدمين</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">جاري تحميل لوحة التحكم...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="elevated-card rounded-2xl p-5 border"
              >
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Users List Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="elevated-card rounded-2xl p-5 border space-y-4"
          >
            <h2 className="font-display font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> إدارة مستخدمي المنصة ({usersList.length})
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-border/80 text-sm text-muted-foreground">
                    <th className="pb-3 pr-2 font-semibold">الاسم</th>
                    <th className="pb-3 font-semibold">البريد الإلكتروني</th>
                    <th className="pb-3 font-semibold">الدور</th>
                    <th className="pb-3 font-semibold">الصف الدراسي</th>
                    <th className="pb-3 font-semibold">النقاط</th>
                    <th className="pb-3 pl-2 font-semibold text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm text-foreground">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-muted-foreground">لا يوجد مستخدمون مسجلون.</td>
                    </tr>
                  ) : (
                    usersList.map((usr) => (
                      <tr key={usr.id} className="hover:bg-secondary/35 transition-colors">
                        <td className="py-3.5 pr-2 font-semibold">{usr.name}</td>
                        <td className="py-3.5 text-muted-foreground">{usr.email}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            usr.role === "admin" ? "bg-red-500/10 text-red-500" : usr.role === "teacher" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
                          }`}>
                            {getRoleLabel(usr.role)}
                          </span>
                        </td>
                        <td className="py-3.5">{getGradeLabel(usr.grade)}</td>
                        <td className="py-3.5 font-bold">{usr.points || 0}</td>
                        <td className="py-3.5 pl-2 text-center">
                          <button
                            onClick={() => handleDeleteUser(usr.id)}
                            className="text-destructive hover:text-red-700 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                            title="حذف المستخدم"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
