# تقرير بناء المرحلتين 1 و 2 — EduCommunity Egypt

> تقرير تقني واضح بكل ما تم استخدامه في البناء، **ولماذا تحديداً دون غيره**.
> التاريخ: 24/6/2026 · النطاق: المرحلة 1 (الأساس والمعمار) + المرحلة 2 (المواد والدروس) · الفرونت إند بالكامل بـ **JSX** (تم تحويله من TypeScript بناءً على طلبك).

---

## 1) ملخص ما تم تنفيذه

| البند | الحالة |
|---|---|
| إعادة هيكلة الباك إند لمعمار طبقي (routes → controllers → services → models) | ✅ |
| إصدار API موحّد تحت `/api/v1` + شكل رد موحّد `{ success, message, data }` | ✅ |
| مصادقة بنظام **توكنين** (access قصير + refresh) + تشفير bcrypt تلقائي | ✅ |
| تحقّق مدخلات بـ **Zod** + معالج أخطاء مركزي + حماية (helmet/CORS/rate-limit) | ✅ |
| صلاحيات حسب الدور (RBAC: student / teacher / admin) | ✅ |
| **المواد الدراسية (Subjects)** + **المواد التعليمية (Materials)**: موديلات + CRUD + فلترة + pagination | ✅ |
| رفع ملفات: محلي تلقائياً أو **Cloudinary** عند ضبطه + دعم الروابط الخارجية (يوتيوب) | ✅ |
| ميزة **«مواد الصف التالي في الإجازة»** | ✅ |
| فرونت: عميل API موحّد + تجديد توكن تلقائي + حماية المسارات (ProtectedRoute) | ✅ |
| فرونت: فورم دخول/تسجيل بـ **react-hook-form + Zod** | ✅ |
| فرونت: صفحة المواد (تصفّح/فلترة/بحث/Pagination) + نافذة رفع للمدرس | ✅ |
| **تحويل الفرونت إند كامل من TypeScript إلى JSX** (79 ملف) + ضبط الإعدادات | ✅ |

تم التحقق من كل ذلك عملياً (انظر قسم 7).

---

## 2) هيكل المشروع بعد التنفيذ

**الباك إند (معمار طبقي):**
```
educommunity-backend/src/
├── config/        env.js · db.js · cloudinary.js · seed.js
├── utils/         ApiError.js · asyncHandler.js · apiResponse.js · pagination.js
├── middleware/    auth · validate · upload · error
├── validators/    auth.validator.js · material.validator.js   (Zod)
├── models/        User · Subject · Material  (+ القديمة: Post · Comment · Challenge ...)
├── services/      auth · subject · material · upload          (منطق العمل)
├── controllers/   auth · subject · material                   (رفيعة)
└── routes/v1/     index · auth · subject · material            (+ القديمة legacy)
```

**الفرونت إند (تنظيم feature-based):**
```
educommunity-frontend/.../src/
├── lib/           api.js (عميل موحّد) · grades.js · utils.js
├── context/       AuthContext.jsx
├── components/    ProtectedRoute.jsx · AppLayout.jsx · ui/ (shadcn)
├── features/
│   ├── auth/      schemas.js · AuthForm.jsx
│   └── materials/ MaterialsPage.jsx · MaterialCard.jsx · UploadMaterialDialog.jsx · utils.js
└── pages/         Auth.jsx · Feed.jsx · Materials عبر features ... إلخ
```

---

## 3) التقنيات المستخدمة — ولماذا دون غيرها

### الباك إند
| التقنية | الدور | البديل الشائع | **ليه اخترناها** |
|---|---|---|---|
| **Express** | إطار السيرفر والـREST | Fastify / NestJS | الأبسط والأكثر انتشاراً، وهو المتعلَّم مسبقاً — مناسب للمناقشة |
| **MongoDB + Mongoose** | قاعدة بيانات + ODM | PostgreSQL/Prisma | مرونة المخطط تناسب منصة سريعة التطور، والـODM يوفّر تحقّق وموديلات |
| **JWT (access + refresh)** | جلسات بلا حالة | sessions + cookies | معيار صناعي للـAPI؛ access قصير (15د) للأمان + refresh يجدّد بصمت |
| **bcryptjs** | تشفير كلمات المرور | argon2 | بسيط ومثبت، ومدمج كـpre-save hook فلا يُخزَّن باسورد خام أبداً |
| **Zod** | تحقّق المدخلات | Joi / express-validator | يُكتب مرة ويُشارك المفهوم مع الفرونت؛ رسائل أخطاء واضحة بالعربي |
| **express-rate-limit** | حد الطلبات | — | حماية مسارات الدخول من brute-force |
| **helmet + cors** | تأمين الـheaders + سماح الدومين | — | أساسيات أمان أي API حقيقي |
| **multer** | استقبال الملفات | formidable | الأكثر شيوعاً مع Express |
| **Cloudinary** (اختياري) | تخزين ميديا على CDN | S3 | مجاني للبداية وسهل؛ ولو غير مضبوط نرجع للتخزين المحلي تلقائياً |
| **morgan** | تسجيل الطلبات | pino-http | بسيط وكافٍ لمرحلة التطوير |

### الفرونت إند
| التقنية | الدور | البديل | **ليه اخترناها** |
|---|---|---|---|
| **React + Vite** | الواجهة + أداة البناء | CRA / Next.js | Vite أسرع بكثير في التطوير، وReact هو المتعلَّم |
| **JSX (JavaScript)** | لغة الكود | TypeScript | **بطلبك** — أبسط للشرح في المناقشة وتقدر تشرح كل سطر |
| **react-router-dom** | التنقّل بين الصفحات | — | المعيار في React SPA |
| **@tanstack/react-query** | جلب/كاش بيانات السيرفر | useEffect يدوي | كاش وتحديث تلقائي وحالات تحميل/خطأ جاهزة — كود أنظف بكثير |
| **react-hook-form + Zod** | إدارة الفورمز والتحقق | حالة يدوية | أداء عالٍ وتحقّق موحّد مع الباك |
| **shadcn/ui + Tailwind** | مكوّنات + تنسيق | MUI / Bootstrap | مكوّنات جاهزة قابلة للتعديل بدون قيود تصميم |
| **sonner** | تنبيهات Toast | react-toastify | خفيف ومدمج مع الـUI الحالي |
| **lucide-react** | الأيقونات | — | أيقونات نظيفة ومنتشرة |

---

## 4) القرارات المعمارية (ولماذا)

1. **معمار طبقي (Layered):** فصلنا المسؤوليات: `route` يعرّف المسار فقط، `controller` يستقبل الطلب، `service` فيه منطق العمل، `model` للبيانات. الفايدة: كود أسهل في الاختبار والصيانة — وهو أسلوب الشركات.
2. **شكل رد موحّد** `{ success, message, data, meta? }`: أي صفحة في الفرونت تتعامل مع نفس الشكل، والأخطاء كلها بنفس الصيغة.
3. **توكنان (access + refresh) بنظام stateless:** الـaccess عمره 15 دقيقة (أمان أعلى)، والـrefresh يجدّده تلقائياً من غير ما يسجّل المستخدم دخول كل شوية. *مقايضة واعية:* لم نخزّن الـrefresh tokens في قاعدة البيانات (أبسط لمشروع التخرج)؛ التوسعة المستقبلية: تخزينها لدعم «تسجيل خروج من كل الأجهزة».
4. **تحقّق بـ Zod في طبقة middleware:** أي مدخل غلط يُرفض قبل ما يوصل لقاعدة البيانات، برسالة حقل واضحة.
5. **رفع هجين (Cloudinary أو محلي):** لو مفاتيح Cloudinary موجودة نرفع سحابي، وإلا نخزّن في `/uploads` — فالمشروع يشتغل فوراً بدون أي حساب خارجي.
6. **استراتيجية Migration تدريجية (Strangler):** المسارات الجديدة تحت `/api/v1` بالمعمار الجديد، والمسارات القديمة (posts/challenges/...) باقية شغّالة تحت `/api` لحين ترحيلها في مراحل لاحقة. ده **قرار محترف** يخلّي المشروع يفضل شغّال طول الوقت بدل إعادة كتابة دفعة واحدة.
7. **JSX بدل TypeScript:** بطلبك — حوّلنا 79 ملف آلياً (بأداة esbuild التي تأتي مع Vite) مع الحفاظ على JSX وإزالة الأنواع، وضبطنا الإعدادات (Vite/ESLint/jsconfig) لمشروع JS خالص.

---

## 5) كيف يتصل الفرونت بالباك (مهم: هما مشروعان منفصلان)

- **عنوان الـAPI:** الفرونت يطلب من `http://localhost:5000/api` (مضبوط في `src/lib/api.js`).
- **CORS:** الباك يسمح لأصل الفرونت (في التطوير يسمح للكل، وفي الإنتاج بـ`CLIENT_URL`).
- **التوكن:** بعد الدخول يُخزَّن `accessToken` و`refreshToken` في `localStorage`، ويُرسَل تلقائياً في ترويسة `Authorization: Bearer`.
- **التجديد التلقائي:** لو رجع السيرفر `401` (انتهى الـaccess)، العميل ينده `/v1/auth/refresh` ويعيد الطلب مرة واحدة تلقائياً.

**الربط = الفرونت يستهلك API الباك عبر HTTP؛ شغّل المشروعين معاً (الباك على 5000 والفرونت على 8080).**

---

## 6) خطوات التشغيل

**الباك إند:**
```bash
cd educommunity-backend
cp .env.example .env        # واملأ القيم (JWT secrets على الأقل)
npm install
npm run seed                # بيانات تجريبية (مواد + مستخدمين)
npm run dev                 # http://localhost:5000
```

**الفرونت إند:**
```bash
cd educommunity-frontend/educommunity-frontend
npm install
npm run dev                 # http://localhost:8080
```

**حسابات تجريبية (الباسورد للجميع: `password123`):**
- أدمن: `admin@edu.eg`
- مدرس: `ahmed.ali@edu.eg`
- طالب: `omar@edu.eg`

---

## 7) الاختبارات التي أُجريت فعلياً (نتائج حقيقية)

| # | الاختبار | النتيجة |
|---|---|---|
| 1 | تسجيل دخول الأدمن | ✅ يرجّع user + accessToken + refreshToken |
| 2 | `GET /v1/auth/me` بالتوكن | ✅ يرجّع بيانات المستخدم |
| 3 | المواد الدراسية حسب الصف | ✅ |
| 4 | المواد التعليمية + Pagination meta | ✅ `{total, page, totalPages, hasNextPage}` |
| 5 | فلتر «مواد الصف التالي» | ✅ يرجّع المادة الصحيحة فقط |
| 6 | تسجيل مستخدم جديد | ✅ |
| 7 | تحقّق (بريد غير صالح) | ✅ يرجّع `422` + خطأ الحقل |
| 8 | كلمة مرور خاطئة | ✅ `401` |
| 9 | RBAC: طالب يحاول إنشاء مادة | ✅ `403 Forbidden` |
| 10 | تجديد التوكن (refresh) | ✅ يرجّع access جديد |
| 11 | مسار قديم (posts) لسه شغّال | ✅ `200` |
| 12 | بناء الفرونت إند (JSX) | ✅ 2151 module · صفر أخطاء |

---

## 8) ملاحظات وما تبقّى للمراحل القادمة

- 🧹 تم حذف `database/schema.sql` القديم (كان PostgreSQL بينما المشروع MongoDB).
- 📝 أثناء تحويل الفرونت آلياً لـJSX، اختفت التعليقات التوضيحية من الملفات (طبيعة الأداة). الكود نظيف وقابل للقراءة، ويمكن إعادة التعليقات لأهم الملفات عند الطلب.
- 🔜 المسارات القديمة (posts/challenges/teachers/leaderboard/admin) تعمل كما هي وتُرحَّل تدريجياً لنفس معمار v1 في المراحل التالية.
- 🔜 المرحلة 3 (الشات اللحظي + الدروس) والمرحلة 4 (السوفت سكيلز + المكافآت) كما في خطة العمل.
