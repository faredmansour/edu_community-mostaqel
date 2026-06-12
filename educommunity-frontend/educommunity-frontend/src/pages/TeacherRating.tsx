import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const StarRating = ({ rating, interactive = false, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={!interactive}
        onClick={() => onChange?.(star)}
        className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
      >
        <Star
          className={`w-5 h-5 ${star <= rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`}
        />
      </button>
    ))}
  </div>
);

const TeacherRating = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTeachers = async () => {
    try {
      const res = await api.getTeachers();
      setTeachers(res.teachers);
    } catch (e: any) {
      toast.error(e.message || "فشل تحميل المعلمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleSubmitRating = async (teacherId: string) => {
    if (!user) {
      toast.error("يرجى تسجيل الدخول لتقييم المعلمين");
      return;
    }
    if (user.role !== "student") {
      toast.error("عذراً، التقييم متاح للطلاب فقط");
      return;
    }
    if (userRating < 1 || userRating > 5) {
      toast.error("يرجى اختيار عدد النجوم للتقييم");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.rateTeacher(teacherId, userRating, commentText);
      toast.success("تم تسجيل تقييمك بنجاح!");
      setSelectedTeacher(null);
      setUserRating(0);
      setCommentText("");
      loadTeachers();
    } catch (e: any) {
      toast.error(e.message || "فشل إرسال التقييم");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">تقييم المعلمين</h1>
        <p className="text-muted-foreground mt-1">شارك رأيك البنّاء لمساعدة المعلمين وبقية زملائك</p>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="ابحث باسم المعلم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10 rounded-xl bg-card border-border/50 text-foreground"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">جاري تحميل المعلمين...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground bg-secondary/20 rounded-2xl">
          لا يوجد معلمون مطابقون للبحث.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((teacher, i) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="elevated-card rounded-2xl p-5"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground shrink-0">
                  {teacher.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{teacher.name}</h3>
                  <p className="text-sm text-muted-foreground">معلم متميز • البريد: {teacher.email}</p>
                </div>
                <div className="text-left shrink-0">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-foreground">{Number(teacher.avg_rating).toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{teacher.ratings_count} تقييم</p>
                </div>
              </div>

              {selectedTeacher === teacher.id ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-border/50 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">تقييمك:</span>
                    <StarRating rating={userRating} interactive onChange={setUserRating} />
                  </div>
                  <Textarea
                    placeholder="اكتب ملاحظاتك وتقييمك للمعلم..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="rounded-xl bg-secondary/50 border-none resize-none text-foreground"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSubmitRating(teacher.id)}
                      disabled={isSubmitting}
                      className="gradient-primary text-primary-foreground rounded-xl"
                    >
                      {isSubmitting ? "جاري الإرسال..." : "إرسال"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedTeacher(null);
                        setUserRating(0);
                        setCommentText("");
                      }}
                    >
                      إلغاء
                    </Button>
                  </div>
                </motion.div>
              ) : (
                user?.role === "student" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-primary gap-1.5 hover:bg-secondary"
                    onClick={() => {
                      setSelectedTeacher(teacher.id);
                      setUserRating(0);
                      setCommentText("");
                    }}
                  >
                    <ThumbsUp className="w-4 h-4" /> قيّم هذا المعلم
                  </Button>
                )
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherRating;
