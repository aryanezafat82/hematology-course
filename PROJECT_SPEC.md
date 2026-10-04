# فایل مستندات کامل پروژه — `PROJECT_SPEC.md`

فایل زیر رو در ریشه‌ی پروژه (کنار `package.json`) با نام `PROJECT_SPEC.md` بساز. این یک مرجع خودکفا است: هر هوش مصنوعی یا توسعه‌دهنده‌ای که فقط همین فایل رو بخونه، می‌تونه معماری پروژه رو کامل بازسازی کنه یا برای یه درس دیگه پیاده کنه.

---

```markdown
# مشخصات فنی پروژه — Hematology Course

> یک پلتفرم آموزشی پزشکی تحت وب، مبتنی بر میکرولرنینگ با کارت، سیستم مرور (Spaced Repetition)، نکات سخت، آزمون، حالت تاریک، PWA و پشتیبانی کامل RTL فارسی.

این سند مرجع کامل معماری، داده، طراحی و رفتار پروژه است. با خواندن این فایل، یک توسعه‌دهنده یا هوش مصنوعی می‌تواند کل پروژه را از صفر بسازد یا آن را برای یک دوره‌ی آموزشی دیگر تطبیق دهد.

---

## فهرست

1. نمای کلی
2. تکنولوژی‌ها
3. ساختار پوشه‌ها
4. داده‌ها (JSON Schema)
5. لایه‌ی Loader
6. Contextها (State Management)
7. localStorage
8. Routing
9. Layout و Navigation
10. سیستم کارت (Card System)
11. RichText — قالب‌بندی متن
12. سیستم پیشرفت (Progress)
13. نکات سخت (Hard Points)
14. آزمون (Quiz)
15. سیستم مرور (Spaced Repetition)
16. Onboarding (Welcome Tour، Swipe Tutorial، Install Prompt)
17. حالت تاریک (Dark Mode)
18. PWA
19. Swipe Navigation
20. کامپوننت‌های مشترک
21. سیستم طراحی (Design System)
22. انیمیشن‌ها
23. اسکریپت‌های کمکی
24. قواعد افزودن جلسه‌ی جدید
25. راهنمای تطبیق برای دوره‌ی دیگر

---

## ۱. نمای کلی

**نام پروژه:** Hematology Course  
**نوع:** Single-Page Application (SPA)  
**موضوع:** دوره‌ی هماتولوژی پزشکی با ۱۶ جلسه  
**زبان:** فارسی (RTL)  
**دسترسی:** آفلاین-پسند (PWA) با ذخیره‌سازی محلی

### معماری داده (سلسله مراتبی)

```
Course
 └── Session (جلسه)
      └── Section (بخش)
           └── Card (کارت)
                ├── info       (متن آموزشی)
                ├── key_point  (نکته کلیدی)
                ├── table      (جدول)
                ├── flashcard  (فلش‌کارت)
                └── quiz       (سؤال چهارگزینه‌ای)
```

### مفاهیم بنیادی

پروژه سه سیستم مستقل از هم دارد که با سه کلید جدا در localStorage ذخیره می‌شوند و **هرگز با هم مخلوط نمی‌شوند**:

1. **Progress** — کدام بخش‌ها تکمیل شده‌اند.
2. **Hard Points** — کدام کارت‌ها را کاربر دستی «سخت» علامت زده.
3. **Review** — کدام کارت‌ها چه زمانی باید دوباره مرور شوند (فقط کارت‌هایی که کاربر دکمه‌ی «مرور» را زده).

---

## ۲. تکنولوژی‌ها

| ابزار | نسخه | هدف |
|---|---|---|
| **React** | ^18.3 | UI library |
| **Vite** | ^6.0 | Build tool + Dev server |
| **JavaScript** | ES2022+ | (بدون TypeScript) |
| **Tailwind CSS** | ^4.0 (با `@tailwindcss/vite`) | Styling |
| **React Router** | ^6.28 | Client-side routing |
| **Lucide React** | ^0.469 | Icon set |
| **Vazirmatn** | Google Fonts | فونت فارسی |

**بدون:** TypeScript، Redux/Zustand، Backend، Database، Authentication، UI Kit.

### `package.json` (نمونه)

```json
{
  "name": "hematology-course",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.469.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "vite": "^6.0.7"
  }
}
```

### `vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

---

## ۳. ساختار پوشه‌ها

```
hematology-course/
├── docs/                          (اختیاری)
│   └── review-system.md
├── public/
│   ├── assets/
│   │   └── favicon.svg
│   ├── manifest.webmanifest
│   └── sw.js
├── scripts/
│   ├── break-sentences.js
│   └── enrich-json.js
├── src/
│   ├── components/
│   │   ├── cards/
│   │   │   ├── CardRenderer.jsx
│   │   │   ├── CardWrapper.jsx
│   │   │   ├── InfoCard.jsx
│   │   │   ├── KeyPointCard.jsx
│   │   │   ├── TableCard.jsx
│   │   │   ├── Flashcard.jsx
│   │   │   └── QuizCard.jsx
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── CardTransition.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── RichText.jsx
│   │   │   └── ThemeToggle.jsx
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── onboarding/
│   │   │   ├── InstallPrompt.jsx
│   │   │   ├── SwipeTutorial.jsx
│   │   │   └── WelcomeTour.jsx
│   │   ├── quiz/
│   │   │   ├── QuizProgress.jsx
│   │   │   ├── QuizResults.jsx
│   │   │   └── WrongAnswerReview.jsx
│   │   └── review/
│   │       ├── ReviewCard.jsx
│   │       ├── ReviewGuide.jsx
│   │       ├── ReviewProgress.jsx
│   │       ├── ReviewRating.jsx
│   │       └── ReviewSummary.jsx
│   ├── context/
│   │   ├── HardPointsContext.jsx
│   │   ├── OnboardingContext.jsx
│   │   ├── ProgressContext.jsx
│   │   ├── ReviewContext.jsx
│   │   ├── SectionSessionContext.jsx
│   │   └── ThemeContext.jsx
│   ├── data/
│   │   ├── course.json
│   │   ├── loaders.js
│   │   └── sessions/
│   │       ├── session-01.json
│   │       ├── session-02.json
│   │       └── ... (session-16.json)
│   ├── pages/
│   │   ├── HardPoints.jsx
│   │   ├── Home.jsx
│   │   ├── NotFound.jsx
│   │   ├── Progress.jsx
│   │   ├── Review.jsx
│   │   ├── Section.jsx
│   │   ├── Session.jsx
│   │   └── Sessions.jsx
│   ├── router/
│   │   └── AppRouter.jsx
│   ├── styles/
│   │   └── index.css
│   ├── utils/
│   │   └── reviewUtils.js
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── PROJECT_SPEC.md  (این فایل)
```

---

## ۴. داده‌ها (JSON Schema)

### `src/data/course.json`

فهرست جلسات. فقط نقش **index** دارد؛ عنوان و توضیحات واقعی از فایل هر جلسه خوانده می‌شود.

```json
{
  "title": "هماتولوژی",
  "description": "دوره آموزشی هماتولوژی",
  "sessions": [
    { "id": "session-01", "title": "جلسه ۱", "file": "session-01.json" },
    { "id": "session-02", "title": "جلسه ۲", "file": "session-02.json" }
  ]
}
```

### `src/data/sessions/session-XX.json`

```json
{
  "session": {
    "id": "session-01",
    "title": "اصول درمان سرطان",
    "description": "توضیح مختصر جلسه",
    "sections": [
      {
        "id": "section-01",
        "title": "مفاهیم پایه و تشخیص",
        "description": "توضیح مختصر بخش",
        "cards": [
          // پنج نوع کارت زیر
        ]
      }
    ]
  }
}
```

### انواع کارت

**۱. Info Card (`type: "info"`)**
```json
{
  "id": "session-01-section-01-card-01",
  "type": "info",
  "title": "انواع درمان سرطان",
  "content": "متن اصلی...\nخط دوم..."
}
```

**۲. Key Point (`type: "key_point"`)**
```json
{
  "id": "...",
  "type": "key_point",
  "title": "تیم چندرشته‌ای",
  "content": "متن نکته کلیدی..."
}
```

**۳. Table (`type: "table"`)**
```json
{
  "id": "...",
  "type": "table",
  "title": "اجزای TNM",
  "columns": ["نمره", "تعریف"],
  "rows": [
    ["T", "اندازه و تهاجم تومور اولیه"],
    ["N", "درگیری گره لنفاوی"],
    ["M", "متاستاز دور"]
  ]
}
```

**۴. Flashcard (`type: "flashcard"`)**
```json
{
  "id": "...",
  "type": "flashcard",
  "question": "طول عمر طبیعی یک گلبول قرمز چقدر است؟",
  "answer": "۱۲۰ روز"
}
```

**۵. Quiz (`type: "quiz"`)**
```json
{
  "id": "...",
  "type": "quiz",
  "question": "کدام مورد صحیح است؟",
  "options": ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"],
  "correctAnswer": 1,
  "explanation": "توضیح پاسخ درست..."
}
```

**نکته:** `correctAnswer` صفر-مبناست (۰ = گزینه اول).

### قواعد شناسه (ID)

- هر `session.id` باید به شکل `session-XX` باشد (با `session-` شروع شود).
- هر `section.id` داخل یک جلسه منحصربه‌فرد: `section-01`, `section-02`, ...
- هر `card.id` **باید** با پیشوند `session-XX-section-YY-` شروع شود:
  ```
  session-01-section-03-card-05
  ```
- **هرگز** `session-` را با `section-` در `card.id` اشتباه نگیر (این باگ رایج است).

### مارک‌آپ متن (اختیاری ولی توصیه‌شده)

متن `content`, `title`, `question`, `answer`, `explanation`, `options`, سلول‌های جدول از این علائم پشتیبانی می‌کنند:

| علامت | نتیجه |
|---|---|
| `**text**` | **بولد** |
| `==text==` | پس‌زمینه صورتی (کلمات کلیدی) |
| `++text++` | سبز (اعداد و مقادیر) |
| `@@text@@` | کهربایی (هشدارها) |
| `\n` | خط جدید |
| `\n\n` | پاراگراف جدید |

---

## ۵. لایه‌ی Loader

### `src/data/loaders.js`

```js
import courseData from './course.json';

// Vite eagerly imports all session JSON files.
const sessionModules = import.meta.glob('./sessions/*.json', { eager: true });

export function getCourse() {
  return courseData;
}

export function getSessions() {
  return courseData.sessions ?? [];
}

export function getSessionMeta(sessionId) {
  return getSessions().find((s) => s.id === sessionId) ?? null;
}

export function getSessionData(sessionId) {
  const meta = getSessionMeta(sessionId);
  if (!meta) return null;
  const mod = sessionModules[`./sessions/${meta.file}`];
  if (!mod) return null;
  const raw = mod.default ?? mod;
  return raw.session ?? raw;
}

export function getSection(sessionId, sectionId) {
  const data = getSessionData(sessionId);
  if (!data) return null;
  return data.sections?.find((s) => s.id === sectionId) ?? null;
}

// Dev-only: expose on window for debugging scripts
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__loaders = {
    getCourse,
    getSessions,
    getSessionMeta,
    getSessionData,
    getSection,
  };
}
```

**ویژگی‌های کلیدی:**
- استفاده از `import.meta.glob` به‌جای fetch (چون فایل‌های JSON در dev توسط Vite به‌صورت ES module سرو می‌شوند).
- افزودن فایل جدید به `src/data/sessions/` + یک رکورد در `course.json` = کافی است.
- هیچ تغییری در کد React لازم نیست.

---

## ۶. Contextها (State Management)

شش Context در `src/context/` وجود دارد. تمام آن‌ها در `main.jsx` به ترتیب زیر wrap می‌شوند:

```jsx
<OnboardingProvider>
  <ThemeProvider>
    <ProgressProvider>
      <HardPointsProvider>
        <ReviewProvider>
          <App />
        </ReviewProvider>
      </HardPointsProvider>
    </ProgressProvider>
  </ThemeProvider>
</OnboardingProvider>
```

### 6.1 `ProgressContext`

**کلید localStorage:** `hematology-progress`

**ساختار:**
```json
{
  "completedSections": ["session-01/section-01", "session-01/section-02"],
  "lastStudied": { "sessionId": "session-01", "sectionId": "section-02" }
}
```

**API:**
```js
{
  isSectionCompleted(sessionId, sectionId): boolean
  completeSection(sessionId, sectionId): void
  setLastStudied(sessionId, sectionId): void
  getLastStudied(): { sessionId, sectionId } | null
  getSessionProgress(sessionId): { completed, total, percent }
  getOverallProgress(): { completed, total, percent }
  getCompletedSessionsCount(): number
  resetProgress(): void
}
```

### 6.2 `HardPointsContext`

**کلید localStorage:** `hematology-hard-points`

**ساختار:**
```json
{
  "session-01/section-02/card-05": {
    "sessionId": "session-01",
    "sectionId": "section-02",
    "cardId": "session-01-section-02-card-05"
  }
}
```

**API:**
```js
{
  isHardPoint(sessionId, sectionId, cardId): boolean
  addHardPoint(sessionId, sectionId, cardId): void
  removeHardPoint(sessionId, sectionId, cardId): void
  toggleHardPoint(sessionId, sectionId, cardId): void
  getHardPoints(): Array<{ sessionId, sectionId, cardId }>
  getHardPointCount(): number
  clearHardPoints(): void
}
```

### 6.3 `ReviewContext`

**کلید localStorage:** `hematology-review`

**ساختار:**
```json
{
  "session-01/section-02/card-05": {
    "sessionId": "session-01",
    "sectionId": "section-02",
    "cardId": "session-01-section-02-card-05",
    "status": "learning" | "review",
    "nextReviewAt": "2026-10-03T08:00:00.000Z",
    "interval": 1,
    "reviewCount": 0,
    "lastReviewedAt": null
  }
}
```

**API:**
```js
{
  getReviewItem(sessionId, sectionId, cardId)
  isInReview(sessionId, sectionId, cardId): boolean
  addToReview(sessionId, sectionId, cardId): void  // idempotent
  removeFromReview(sessionId, sectionId, cardId): void
  toggleReview(sessionId, sectionId, cardId): void
  rateReview(sessionId, sectionId, cardId, rating): void  // rating: 'forgot' | 'partial' | 'easy'
  getDueReviews(): Array<item>  // sorted by oldest nextReviewAt
  getDueCount(): number
  getOverdueCount(): number
  getUpcomingCount(): number
  getTotalCount(): number
  getAllItems(): Array<item>
  clearAll(): void
}
```

### 6.4 `ThemeContext`

**کلید localStorage:** `hematology-theme`

**مقادیر:** `"light"` یا `"dark"`

**API:**
```js
{
  theme: 'light' | 'dark'
  setTheme(theme): void
  toggleTheme(): void
  isDark: boolean
}
```

**رفتار:**
- اولین بار: از `prefers-color-scheme` سیستم پیروی می‌کند.
- کاربر `toggle` می‌زند → در localStorage ذخیره می‌شود.
- کلاس `dark` روی `document.documentElement` اضافه می‌شود.

### 6.5 `OnboardingContext`

**کلید localStorage:** `hematology-onboarding`

**ساختار:**
```json
{
  "welcome-tour": true,
  "swipe-navigation": true,
  "install-prompt": true
}
```

**API:**
```js
{
  hasSeen(key): boolean
  markSeen(key): void
  reset(key?): void  // اگر key ندی، همه پاک می‌شوند
}
```

### 6.6 `SectionSessionContext`

**فقط در حافظه** (نه localStorage). هر بار که کاربر از یه Section خارج می‌شود، reset می‌شود.

با `<SectionSessionProvider key={sectionId}>` در `Section.jsx` ساخته می‌شود.

**API:**
```js
{
  quizAnswers: { [cardId]: { selected, isCorrect } }
  submitQuizAnswer(cardId, selected, isCorrect): void
  getQuizAnswer(cardId): { selected, isCorrect } | null
  revealedFlashcards: { [cardId]: true }
  markFlashcardRevealed(cardId): void
  isFlashcardRevealed(cardId): boolean
  getQuizStats(): { total, correct, incorrect, percent }
  reset(): void
}
```

---

## ۷. localStorage

پنج کلید اصلی:

| کلید | Context | ساختار |
|---|---|---|
| `hematology-progress` | ProgressContext | `{ completedSections: [...], lastStudied: {...} }` |
| `hematology-hard-points` | HardPointsContext | `{ "sid/sec/cid": { sessionId, sectionId, cardId } }` |
| `hematology-review` | ReviewContext | `{ "sid/sec/cid": { sessionId, sectionId, cardId, status, nextReviewAt, interval, reviewCount, lastReviewedAt } }` |
| `hematology-theme` | ThemeContext | `"light"` یا `"dark"` |
| `hematology-onboarding` | OnboardingContext | `{ "welcome-tour": true, ... }` |

**قواعد:**
- اگر JSON خراب باشد، هر Context با مقدار پیش‌فرض شروع می‌کند (بدون crash).
- هیچ داده‌ی آموزشی در localStorage کپی نمی‌شود.
- کلیدهای نامعتبر (کارت‌هایی که دیگر در JSON نیستند) هنگام محاسبه نادیده گرفته می‌شوند.

---

## ۸. Routing

### `src/router/AppRouter.jsx`

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import Home from '../pages/Home.jsx';
import Sessions from '../pages/Sessions.jsx';
import Session from '../pages/Session.jsx';
import Section from '../pages/Section.jsx';
import HardPoints from '../pages/HardPoints.jsx';
import Progress from '../pages/Progress.jsx';
import Review from '../pages/Review.jsx';
import NotFound from '../pages/NotFound.jsx';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/session/:sessionId" element={<Session />} />
          <Route path="/session/:sessionId/section/:sectionId" element={<Section />} />
          <Route path="/hard-points" element={<HardPoints />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/review" element={<Review />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Query params:**
- `/review?mode=hard` → فیلتر فقط کارت‌های سخت سررسید.
- `/session/X/section/Y?card=<cardId>` → پرش مستقیم به یک کارت خاص.

---

## ۹. Layout و Navigation

### `AppLayout.jsx`

```jsx
<div className="min-h-screen bg-slate-50 dark:bg-slate-950">
  <Sidebar />              {/* دسکتاپ: سمت راست، ثابت */}
  <div className="md:mr-64 flex min-h-screen flex-col">
    <Header />             {/* موبایل: بالای صفحه */}
    <main className="flex-1 pb-24 md:pb-10">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </main>
  </div>
  <BottomNav />            {/* موبایل: پایین، ثابت */}
  <WelcomeTour />
  <InstallPrompt />
</div>
```

**رفتار:**
- **دسکتاپ (`md:` به بالا):** Sidebar ثابت در سمت راست (عرض ۲۵۶px)، محتوا با `mr-64`.
- **موبایل (`< md`):** Header بالای صفحه، BottomNav پایین (fixed).

### آیتم‌های Navigation

| Route | برچسب | Icon |
|---|---|---|
| `/` | خانه | `Home` |
| `/sessions` | جلسات | `BookOpen` |
| `/review` | مرور | `Repeat` |
| `/hard-points` | نکات | `Star` |
| `/progress` | پیشرفت | `BarChart3` |

Sidebar همچنین شامل `ThemeToggle` (کنار نسخه) است.

---

## ۱۰. سیستم کارت (Card System)

### جریان رندر

```
<section.cards>
  ↓ map
<CardRenderer card={card} sessionId={} sectionId={} />
  ↓ بر اساس card.type
<CardWrapper sessionId={} sectionId={} cardId={}>
  ↓ اضافه کردن دکمه‌های ⭐ سخت بود و 🔄 مرور
  <InfoCard /> یا <KeyPointCard /> یا <TableCard /> یا <Flashcard /> یا <QuizCard />
```

### `CardRenderer.jsx`

Dispatcher مرکزی. اگر `card.type` ناشناخته باشد، یک کارت زرد با پیام «نوع کارت پشتیبانی نمی‌شود» نشان می‌دهد.

```jsx
const CARD_COMPONENTS = {
  info: InfoCard,
  key_point: KeyPointCard,
  table: TableCard,
  flashcard: Flashcard,
  quiz: QuizCard,
};
```

### `CardWrapper.jsx`

دو دکمه در گوشه‌ی بالا-چپ هر کارت به‌صورت absolute قرار می‌دهد:

- **⭐ سخت بود** — toggle Hard Point (کهربایی وقتی فعال)
- **🔄 مرور** — toggle Review (نیلی وقتی فعال)

هر دو از Context مربوطه استفاده می‌کنند و مستقل از هم کار می‌کنند.

### پنج کارت

| کامپوننت | props | رفتار |
|---|---|---|
| **InfoCard** | `{ card }` | نمایش `title` + `content` با `RichText` |
| **KeyPointCard** | `{ card }` | طراحی متمایز (کهربایی، نوار کناری) |
| **TableCard** | `{ card }` | جدول responsive با اسکرول افقی داخلی؛ پشتیبانی از `columns`/`headers` |
| **Flashcard** | `{ card }` | دکمه «نمایش پاسخ» → `animate-expand`؛ در `SectionSessionContext` ثبت می‌شود |
| **QuizCard** | `{ card }` | سه فاز: انتخاب → «بررسی پاسخ» → نتیجه + explanation |

**رفتار Quiz:**
1. کاربر گزینه‌ای را انتخاب می‌کند.
2. دکمه «بررسی پاسخ» فعال می‌شود.
3. پس از کلیک: قفل، نمایش درست/غلط، توضیح.
4. نتیجه در `SectionSessionContext` ثبت می‌شود.
5. جهت ادامه، `canProceed` باید true باشد (Quiz پاسخ داده شده).

**رفتار Flashcard:**
1. سؤال نمایش داده می‌شود.
2. دکمه «نمایش پاسخ» → پاسخ با انیمیشن `expand` ظاهر می‌شود.
3. در `SectionSessionContext` ثبت می‌شود.
4. `canProceed` برای این کارت فقط وقتی reveal شده.

---

## ۱۱. RichText — قالب‌بندی متن

### `src/components/common/RichText.jsx`

پشتیبانی از دو حالت:

- **Block (پیش‌فرض):** `<div>` با پاراگراف‌های جدا. برای `content`, `explanation`, `answer`.
- **Inline (`as="span"`):** `<span>` بدون پاراگراف. برای `title`, `question`, سلول‌های جدول.

```jsx
<RichText text={card.content} className="..." />
<RichText as="span" text={card.title} />
```

**تبدیل‌ها:**
- `**text**` → `<strong className="font-bold">`
- `==text==` → `<span className="rounded bg-rose-50 ... text-rose-700">`
- `++text++` → `<span className="font-semibold text-emerald-700">`
- `@@text@@` → `<span className="font-semibold text-amber-700">`
- `\n` → `<br />`
- `\n\n` → پاراگراف جدید

**نکته:** تمام کارت‌ها باید `RichText` را برای هر فیلد متنی استفاده کنند، نه رندر خام.

---

## ۱۲. سیستم پیشرفت (Progress)

### مبنا: تکمیل بخش
پیشرفت **فقط** بر اساس تکمیل بخش محاسبه می‌شود، نه مشاهده‌ی کارت.

- `Section.jsx` → دکمه «تکمیل بخش» → `completeSection(sessionId, sectionId)`.
- تکمیل idempotent است (دوبار اضافه نمی‌شود).

### محاسبه

```js
// سشن
completed / total_sections_of_session × 100

// کل دوره
total_completed_sections / total_sections × 100
```

### نمایش
- **Home:** درصد کل + تعداد بخش‌های تکمیل‌شده + تعداد جلسات کامل.
- **Sessions:** Progress bar برای هر جلسه + بج «تکمیل شده».
- **Session:** Progress bar + وضعیت هر بخش (✓/○).
- **Progress:** داشبورد کامل + دکمه «پاک کردن پیشرفت».

### `lastStudied`
- هر بار ورود به یک Section معتبر، `setLastStudied(sessionId, sectionId)` فراخوانی می‌شود.
- در Home به‌عنوان «ادامه مطالعه» نمایش داده می‌شود.

### Reset
دکمه «پاک کردن پیشرفت» در صفحه Progress **همه‌ی سه سیستم** را ریست می‌کند:
```js
resetProgress();       // hematology-progress
clearHardPoints();     // hematology-hard-points
clearAll();            // hematology-review
```

---

## ۱۳. نکات سخت (Hard Points)

### رفتار
- هر کارت در UI یک دکمه «⭐ سخت بود» دارد.
- toggle: افزودن/حذف از localStorage.
- مستقل از Quiz و Review.

### صفحه `/hard-points`
- گروه‌بندی‌شده بر اساس جلسه به‌صورت **آکاردئون** (اولین جلسه باز).
- هر آیتم: نوع کارت، پیش‌نمایش، عنوان جلسه/بخش، دکمه «مشاهده کارت» + «حذف».
- «پاک کردن همه» با تأیید.
- در هدر: «مرور کارت‌های سخت» (اگر سررسید داشته باشند) → `/review?mode=hard`.

### کارت‌های orphan
اگر کارتی در JSON حذف شود ولی هنوز Hard Point باشد، با پیام «این کارت دیگر در محتوای دوره موجود نیست» + دکمه حذف نمایش داده می‌شود (بدون crash).

---

## ۱۴. آزمون (Quiz)

### Schema
```json
{
  "type": "quiz",
  "question": "...",
  "options": ["...", "...", "...", "..."],
  "correctAnswer": 1,
  "explanation": "..."
}
```

### State Management
`SectionSessionContext` فقط در طول یک Section زنده است. با خروج، reset می‌شود. **هیچ داده‌ی Quiz در localStorage ذخیره نمی‌شود**.

### جریان در Section
1. کارت‌های Quiz در بخش‌های با `type: "quiz"`.
2. در پایین هر Quiz دکمه «بررسی پاسخ» ظاهر می‌شود (وقتی گزینه‌ای انتخاب شده).
3. بعد از submit: قفل، رنگ‌بندی درست/غلط، نمایش explanation.
4. `QuizProgress` در بالای صفحه: «سوال X از Y» (فقط Quizها).
5. پس از پایان Section، اگر Quizها داشت:
   - `QuizResults` نمایش: درصد، تعداد درست/غلط، دکمه «مرور پاسخ‌های غلط».
   - `WrongAnswerReview`: مرور تعاملی سؤالات غلط با نمایش پاسخ کاربر + پاسخ درست + explanation.

---

## ۱۵. سیستم مرور (Spaced Repetition)

### فلسفه
- **فقط** کارت‌هایی که کاربر دستی دکمه «🔄 مرور» را زده، وارد صف می‌شوند.
- تکمیل بخش **هیچ کارتی را خودکار به مرور اضافه نمی‌کند**.
- الگوریتم سبک (نه SM-2، نه Anki).

### بازه‌ها
```js
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30]; // روز
```

### منطق `computeNextInterval`

```js
function computeNextInterval(currentInterval, rating) {
  const base = Math.max(0, REVIEW_INTERVALS.indexOf(currentInterval));
  let nextIndex;
  if (rating === 'forgot') nextIndex = 0;                    // → ۱ روز
  else if (rating === 'partial') nextIndex = base + 1;       // ۱ پله جلو
  else if (rating === 'easy') nextIndex = base + 2;          // ۲ پله جلو
  else nextIndex = 0;
  return REVIEW_INTERVALS[Math.min(nextIndex, REVIEW_INTERVALS.length - 1)];
}
```

### جدول کامل

| interval فعلی | یادم نبود | تا حدی | کاملاً |
|---|---|---|---|
| ۱ | ۱ | ۳ | ۷ |
| ۳ | ۱ | ۷ | ۱۴ |
| ۷ | ۱ | ۱۴ | ۳۰ |
| ۱۴ | ۱ | ۳۰ | ۳۰ |
| ۳۰ | ۱ | ۳۰ | ۳۰ |

### صفحه `/review`
- **Dashboard:**
  - تعداد کل کارت‌های سررسید + تفکیک عقب‌افتاده / امروز / پیش‌رو.
  - **گروه‌بندی‌شده بر اساس جلسه:** لیست جلسات با تعداد کارت هر کدام.
  - اگر بیش از یک جلسه باشد: دکمه «مرور همه جلسات» + «یا یک جلسه را انتخاب کنید».
- **Session (مرور یک جلسه):**
  - نمایش کارت‌ها یکی‌یکی.
  - برای هر کارت سه دکمه: «یادم نبود» / «تا حدی» / «کاملاً».
  - در کارت‌های Quiz، اول باید پاسخ دهد. در Flashcard، اول reveal.
- **Summary:** تعداد مرورشده‌ها + نتیجه‌ی هر درجه + تاریخ مرور بعدی.

### حالت `?mode=hard`
فقط کارت‌هایی که هم Hard Point هستند و هم سررسید.

### کارت‌های orphan
اگر یک آیتم Review به کارتی اشاره کند که دیگر در JSON نیست، از صف فیلتر می‌شود (بی‌صدا).

---

## ۱۶. Onboarding

### سه کامپوننت مستقل
هر سه از `OnboardingContext` با کلید جدا استفاده می‌کنند.

#### ۱۶.۱ `WelcomeTour.jsx`
- Modal، ۷ مرحله‌ی کوتاه.
- هر مرحله: یک آیکون + عنوان + ۱-۲ جمله.
- دکمه‌های «بعدی» / «قبلی» / «شروع می‌کنم» + «متوجه شدم، دیگر نشان نده».
- `Escape` / `→` / `←` کیبورد پشتیبانی می‌شود.
- کلید: `welcome-tour`.

#### ۱۶.۲ `SwipeTutorial.jsx`
- Modal، اولین بار که کاربر وارد یک Section با ۲+ کارت می‌شود.
- نمایش دو فلش انیمیشنی (راست = بعدی، چپ = قبلی).
- دکمه «متوجه شدم، دیگر نشان نده» + «فقط این بار» + ✕.
- کلید: `swipe-navigation`.

#### ۱۶.۳ `InstallPrompt.jsx`
- فقط روی موبایل (iOS/Android).
- iOS: راهنمای دستی (Share → Add to Home Screen).
- Android: `beforeinstallprompt` event + دکمه «نصب اپلیکیشن».
- اگر قبلاً نصب شده باشد یا `display-mode: standalone` باشد، نمایش داده نمی‌شود.
- کلید: `install-prompt`.

---

## ۱۷. حالت تاریک (Dark Mode)

### پیاده‌سازی
- **Tailwind v4** با `@custom-variant dark (&:where(.dark, .dark *))`.
- کلاس `dark` روی `document.documentElement` اضافه می‌شود.
- ThemeContext: `theme` در localStorage، همگام با `prefers-color-scheme` تا وقتی کاربر دستی انتخاب نکرده.

### در CSS
```css
body { background-color: var(--color-surface-muted); color: #0f172a; }
.dark body { background-color: #020617; color: #f1f5f9; }
```

### در کامپوننت‌ها
هر رنگ پایه یک نسخه‌ی `dark:` دارد. مثلاً:
```
bg-white dark:bg-slate-900
text-slate-900 dark:text-slate-100
border-slate-200 dark:border-slate-800
```

### `ThemeToggle.jsx`
دو variant:
- `variant="icon"` — دکمه‌ی ۳۲×۳۲ برای Header موبایل.
- `variant="full"` — دکمه‌ی تمام‌عرض با متن «حالت تاریک/روشن» برای Sidebar.

---

## ۱۸. PWA

### `public/manifest.webmanifest`
```json
{
  "name": "هماتولوژی — دوره آموزشی",
  "short_name": "هماتولوژی",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#f8fafc",
  "theme_color": "#e11d48",
  "lang": "fa",
  "dir": "rtl",
  "icons": [
    { "src": "/assets/favicon.svg", "sizes": "any", "type": "image/svg+xml" }
  ]
}
```

### `public/sw.js`
```js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});  // pass-through
```

### در `index.html`
```html
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#e11d48" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<link rel="apple-touch-icon" href="/assets/favicon.svg" />
```

### در `main.jsx`
```js
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__deferredInstallPrompt = e;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
```

**نکته:** برای تست PWA، نیاز به HTTPS یا `localhost` است. cloudflared/ngrok/Vercel کار می‌کنند.

---

## ۱۹. Swipe Navigation

### مکانیزم
در `Section.jsx`، wrapper کارت با **Touch Events** (نه Pointer Events) کار می‌کند:

```jsx
useEffect(() => {
  const el = swipeAreaRef.current;
  if (!el || !('ontouchstart' in window)) return;

  let state = null;

  function isInteractiveTarget(t) {
    return t.closest('button, a, input, textarea, select, [role="button"]');
  }

  function isInsideHorizontalScroll(t) {
    let node = t;
    while (node && node !== document.body) {
      const s = window.getComputedStyle(node);
      if ((s.overflowX === 'auto' || s.overflowX === 'scroll') &&
          node.scrollWidth > node.clientWidth) return true;
      node = node.parentElement;
    }
    return false;
  }

  function onStart(e) {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    if (isInteractiveTarget(t.target) || isInsideHorizontalScroll(t.target)) {
      state = { mode: 'native' };
      return;
    }
    state = { mode: 'undecided', startX: t.clientX, startY: t.clientY, time: Date.now() };
  }

  function onMove(e) {
    if (!state || state.mode === 'native') return;
    const t = e.touches[0];
    const dx = t.clientX - state.startX;
    const dy = t.clientY - state.startY;
    const absDx = Math.abs(dx), absDy = Math.abs(dy);

    if (state.mode === 'undecided') {
      if (absDx < 8 && absDy < 8) return;
      state.mode = absDx > absDy ? 'swipe' : 'scroll';
      if (state.mode === 'scroll') return;
      setDragging(true);
    }

    if (state.mode === 'swipe') {
      if (e.cancelable) e.preventDefault();
      const dampened = Math.sign(dx) * Math.min(absDx * 0.4, 90);
      setDragX(dampened);
    }
  }

  function onEnd(e) {
    const s = state;
    state = null;
    setDragging(false);
    setDragX(0);
    if (!s || s.mode !== 'swipe') return;

    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - s.startX;
    const dy = t.clientY - s.startY;
    const dt = Date.now() - s.time;

    if (Math.abs(dx) < 60) return;
    if (dt > 800) return;
    if (Math.abs(dy) > Math.abs(dx) * 0.7) return;

    // RTL: swipe right → next, swipe left → prev
    if (dx > 0) tryGoNext();
    else goPrev();
  }

  el.addEventListener('touchstart', onStart, { passive: true });
  el.addEventListener('touchmove', onMove, { passive: false });
  el.addEventListener('touchend', onEnd, { passive: true });
  el.addEventListener('touchcancel', onEnd, { passive: true });
  return () => {
    el.removeEventListener('touchstart', onStart);
    el.removeEventListener('touchmove', onMove);
    el.removeEventListener('touchend', onEnd);
    el.removeEventListener('touchcancel', onEnd);
  };
}, [phase]);
```

**قواعد مهم:**
- Swipe راست = کارت بعدی، swipe چپ = کارت قبلی (چون RTL است).
- اگر کاربر روی دکمه/لینک touch کند → swipe شروع نمی‌شود.
- اگر کاربر داخل یک عنصر با `overflow-x: auto` (مثل جدول) باشد → swipe شروع نمی‌شود.
- اگر کارت لرزش خورد (`tryGoNext` وقتی `canProceed` false) → `animate-shake`.

---

## ۲۰. کامپوننت‌های مشترک

### `Button.jsx`

```jsx
<Button variant="primary" size="md" to="/path">...</Button>
<Button variant="secondary" onClick={...}>...</Button>
```

**Variants:** `primary`, `secondary`, `outline`, `ghost`, `danger`
**Sizes:** `sm`, `md`, `lg`

### `ProgressBar.jsx`

```jsx
<ProgressBar value={75} tone="primary" track="neutral" size="md" />
```

**Tones:** `primary` (rose), `success` (emerald), `warning` (amber), `review` (indigo)
**Tracks:** `primary`, `success`, `warning`, `review`, `neutral`
**Sizes:** `sm` (h-1.5), `md` (h-2), `lg` (h-2.5)

### `EmptyState.jsx`

```jsx
<EmptyState icon={Icon} title="..." description="..." action={<Button>...</Button>} />
```

### `Loading.jsx`

اسپینر ساده با متن فارسی.

### `CardTransition.jsx`

Wrapper با `animate-card-in` برای انیمیشن ورود کارت.

### `ThemeToggle.jsx`

دو variant (icon / full).

---

## ۲۱. سیستم طراحی (Design System)

### پالت (CSS variables در `@theme`)

```css
--color-surface: #ffffff;
--color-surface-muted: #f8fafc;
--color-border: #e2e8f0;
--color-primary: #e11d48;         /* rose-600 */
--color-success: #059669;         /* emerald-600 */
--color-warning: #d97706;         /* amber-600 */
--color-error: #dc2626;
--color-hard: #d97706;            /* amber */
--color-review: #4f46e5;          /* indigo-600 */
```

### رنگ‌های معنایی

| رنگ | معنی |
|---|---|
| **Rose** | primary / کلیدواژه / بیماری‌های مهم |
| **Sky** | اطلاعات پایه (InfoCard) |
| **Amber** | نکات کلیدی / هشدار |
| **Violet** | جدول |
| **Emerald** | اعداد / پاسخ درست |
| **Indigo** | مرور |
| **Slate** | خنثی |

### Typography

- فونت: **Vazirmatn** (Google Fonts).
- `html, body { font-family: var(--font-sans); }`
- `p, li { line-height: 1.9; }`
- همه‌چیز RTL: `<html lang="fa" dir="rtl">`.
- فونت‌های بدنه: `text-sm`, `text-base`, `leading-7`/`leading-8`.

### Spacing
- کارت‌ها: `p-5 sm:p-6`.
- Page container: `max-w-4xl`, `px-4 sm:px-6 lg:px-8`.
- بین کارت‌ها: `space-y-4`.
- بین بخش‌های صفحه: `space-y-6` یا `space-y-8`.

### Border Radius
- کارت‌ها: `rounded-xl` یا `rounded-2xl`.
- دکمه‌ها: `rounded-lg`.
- بج‌ها: `rounded-full`.

---

## ۲۲. انیمیشن‌ها

همه در `src/styles/index.css` تعریف شده‌اند.

```css
@keyframes card-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pop-in {
  0%   { transform: scale(0.96); opacity: 0; }
  60%  { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(1);    opacity: 1; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-3px); }
  40%      { transform: translateX(3px); }
  60%      { transform: translateX(-2px); }
  80%      { transform: translateX(2px); }
}

@keyframes fade-in {
  from { opacity: 0; } to { opacity: 1; }
}

@keyframes expand-down {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes swipe-hint-right {
  0%, 100% { transform: translateX(0);    opacity: 0.4; }
  50%      { transform: translateX(4px);  opacity: 1; }
}

@keyframes swipe-hint-left {
  0%, 100% { transform: translateX(0);     opacity: 0.4; }
  50%      { transform: translateX(-4px);  opacity: 1; }
}

.animate-card-in         { animation: card-in 220ms ease-out both; }
.animate-pop-in          { animation: pop-in 240ms ease-out both; }
.animate-shake           { animation: shake 320ms ease-in-out both; }
.animate-fade-in         { animation: fade-in 180ms ease-out both; }
.animate-expand          { animation: expand-down 200ms ease-out both; }
.animate-swipe-hint-right { animation: swipe-hint-right 1.4s ease-in-out infinite; }
.animate-swipe-hint-left  { animation: swipe-hint-left  1.4s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .animate-card-in, .animate-pop-in, .animate-shake,
  .animate-fade-in, .animate-expand,
  .animate-swipe-hint-right, .animate-swipe-hint-left {
    animation: none !important;
  }
}
```

**قواعد طراحی:**
- بدون gradient سنگین.
- بدون shadow غلیظ (فقط `shadow-sm`, `shadow`, `shadow-xl` برای modal).
- Transition: `duration-150` یا `duration-200` (به‌جز progress bar: `duration-500`).
- `active:scale-[0.98]` روی دکمه‌های primary.

---

## ۲۳. اسکریپت‌های کمکی

### `scripts/break-sentences.js`

**هدف:** شکستن جمله‌ها به خطوط جدا در JSON.

**اجرا:**
```bash
node scripts/break-sentences.js
```

**منطق:**
- بعد از هر `.`, `!`, `?`, `؟`, `;`, `؛` یک `\n` اضافه می‌کند.
- اعداد اعشاری مثل `1.5` را رد می‌کند.
- فقط اگر از قبل `\n` نداشته باشد.

### `scripts/enrich-json.js`

**هدف:** افزودن خودکار `**bold**`, `==highlight==`, `++green++`, `@@warning@@` به متن کارت‌ها.

**اجرا:**
```bash
node scripts/enrich-json.js
```

**منطق:**
1. `BOLD_TERMS` — لیست اصطلاحات لاتین (ژن‌ها، پروتئین‌ها، داروها، تست‌ها).
2. `HIGHLIGHT_TERMS` — بیماری‌های فارسی.
3. `WARNING_PHRASES` — عبارات هشدار.
4. `NUMBER_RE` — اعداد با واحد.

**ترتیب اجرا (مهم):**
`Bold → Highlight → Warning → Numbers`

**نکته:** قبل از اجرا، از `src/data/sessions/` بکاپ بگیر:
```bash
cp -r src/data/sessions src/data/sessions.bak
```

**بازگردانی در صورت مشکل:**
```bash
rm -rf src/data/sessions
mv src/data/sessions.bak src/data/sessions
```

### ابزارهای Console برای دیباگ

فایل `main.jsx` در حالت dev، `window.__loaders` را در دسترس قرار می‌دهد. نمونه دستورات:

```js
// بررسی ساختار
window.__loaders.getSessions()

// بررسی Review
JSON.parse(localStorage.getItem('hematology-review'))

// جابه‌جایی تاریخ مرور (فردا)
const d=JSON.parse(localStorage.getItem('hematology-review')||'{}'),t=new Date(Date.now()+864e5).toISOString();for(const k in d)d[k].nextReviewAt=t;localStorage.setItem('hematology-review',JSON.stringify(d));location.reload();

// سررسید کردن همه برای تست
const d=JSON.parse(localStorage.getItem('hematology-review')||'{}'),t=new Date(Date.now()-3600000).toISOString();for(const k in d)d[k].nextReviewAt=t;localStorage.setItem('hematology-review',JSON.stringify(d));location.reload();

// Reset همه‌ی Onboarding
localStorage.removeItem('hematology-onboarding');location.reload();

// Reset همه‌چیز
Object.keys(localStorage).filter(k=>k.startsWith('hematology-')).forEach(k=>localStorage.removeItem(k));location.reload();
```

---

## ۲۴. قواعد افزودن جلسه‌ی جدید

**مرحله ۱:** فایل `src/data/sessions/session-XX.json` بساز.

**مرحله ۲:** ساختار JSON را کامل رعایت کن:
- `session.id` = `session-XX` (نه `section-XX`).
- `section.id` = `section-YY`.
- `card.id` = `session-XX-section-YY-card-ZZ`.
- همه‌ی فیلدهای الزامی هر نوع کارت.

**مرحله ۳:** در `src/data/course.json` یک رکورد اضافه کن:
```json
{ "id": "session-XX", "title": "جلسه XX", "file": "session-XX.json" }
```

**مرحله ۴:** سرور را ری‌استارت کن (Vite فایل جدید را cache می‌کند).

**مرحله ۵ (اختیاری):** اگر از اسکریپت `break-sentences.js` و `enrich-json.js` استفاده می‌کنی، روی فایل جدید اجرا کن.

### قواعد طلایی

- ✅ **از آخر اضافه کن.** هرگز `id` جلسات/بخش‌ها/کارت‌های موجود را تغییر نده.
- ❌ `session-01` → `session-A` ممنوع.
- ❌ حذف یک بخش که کاربر تکمیل کرده، داده‌ی Progress او را یتیم می‌کند.
- ✅ اگر محتوای یک بخش را می‌خواهی عوض کنی، کارت‌ها را ویرایش کن، نه حذف/بازسازی.
- ✅ `card.id` را هرگز تغییر نده، وگرنه Hard Point / Review کاربر ناپدید می‌شود.

---

## ۲۵. راهنمای تطبیق برای دوره‌ی دیگر

برای ساخت یک دوره‌ی جدید (مثلاً «فارماکولوژی» یا «آناتومی»)، این مراحل را دنبال کن:

### قدم ۱: Fork / Clone پروژه

```bash
git clone <repo>
cd hematology-course
rm -rf .git
npm install
```

### قدم ۲: تغییر هویت

| فایل | تغییر |
|---|---|
| `package.json` | `name`, `version` |
| `index.html` | `<title>`, meta description |
| `src/data/course.json` | `title`, `description` |
| `public/manifest.webmanifest` | `name`, `short_name`, `description` |
| `src/components/layout/Sidebar.jsx` | لوگو (اگر خواستی) |
| `src/components/layout/Header.jsx` | لوگو |
| `src/pages/Home.jsx` | نام سازنده، دانشگاه/برند، لینک کانال (اگر کاربردی ندارد، حذف کن) |
| `src/styles/index.css` | اگر رنگ primary عوض می‌شود، `--color-primary` را تغییر بده |

### قدم ۳: تغییر localStorage keys

اگر می‌خواهی دو پروژه روی یک domain باشند، keys را تغییر بده:

```js
'hematology-progress'       → 'pharma-progress'
'hematology-hard-points'    → 'pharma-hard-points'
'hematology-review'         → 'pharma-review'
'hematology-theme'          → 'pharma-theme'
'hematology-onboarding'     → 'pharma-onboarding'
```

### قدم ۴: پاک کردن داده‌ی جلسات قدیمی

```bash
rm src/data/sessions/session-*.json
```

### قدم ۵: ساخت جلسات جدید

طبق **بخش ۲۴** عمل کن.

### قدم ۶: تطبیق اسکریپت‌های Enrichment (اختیاری)

در `scripts/enrich-json.js`:
- `BOLD_TERMS` را با اصطلاحات تخصصی دوره‌ی جدید پر کن (نام داروها، بیماری‌ها، آنزیم‌ها).
- `HIGHLIGHT_TERMS` را با بیماری‌های فارسی جدید.
- `WARNING_PHRASES` را با هشدارهای تخصصی.

### قدم ۷: تطبیق UI / برندینگ

- رنگ primary: در `src/styles/index.css` مقادیر `--color-primary*` را عوض کن.
- آیکون سایت (`public/assets/favicon.svg`).
- متن خوش‌آمد در `WelcomeTour.jsx`.

### چیزهایی که **تغییر نمی‌کنند**

- معماری Contextها.
- Routing.
- سیستم Card و RichText.
- الگوریتم Review (`REVIEW_INTERVALS` و `computeNextInterval`).
- Swipe Navigation.
- Layout و Navigation.
- PWA.
- اسکریپت‌های پایه.

### چک‌لیست نهایی

```
[ ] package.json آپدیت شد
[ ] index.html آپدیت شد
[ ] course.json آپدیت شد
[ ] session-*.json های جدید ساخته شدند
[ ] card.id ها با پیشوند session-XX- درست هستند
[ ] localStorage keys یکتا هستند
[ ] تم رنگی تطبیق داده شد
[ ] favicon عوض شد
[ ] نام برند در Sidebar/Header/Home عوض شد
[ ] WelcomeTour متناسب با دوره‌ی جدید آپدیت شد
[ ] npm run dev بدون خطا
[ ] یک session با ۳ کارت تست شد
```

---

## پیوست: وابستگی بین فایل‌ها

```
main.jsx
 ├── OnboardingContext ──→ localStorage: hematology-onboarding
 ├── ThemeContext ──────→ localStorage: hematology-theme
 ├── ProgressContext ───→ localStorage: hematology-progress
 │                         + data/loaders (محتوای جلسات)
 ├── HardPointsContext ─→ localStorage: hematology-hard-points
 ├── ReviewContext ─────→ localStorage: hematology-review
 │                         + utils/reviewUtils
 └── App.jsx
      └── AppRouter
           └── AppLayout
                ├── Sidebar → ThemeToggle
                ├── Header → ThemeToggle
                ├── BottomNav
                ├── Outlet
                │    ├── Home (useProgress + useHardPoints + useReview)
                │    ├── Sessions (useProgress + useReview)
                │    ├── Session (useProgress)
                │    ├── Section
                │    │    ├── SectionSessionProvider
                │    │    ├── CardRenderer → CardWrapper → 5 Card Components → RichText
                │    │    ├── QuizResults / WrongAnswerReview
                │    │    └── Button (تکمیل بخش)
                │    ├── HardPoints (useHardPoints + useReview)
                │    ├── Progress (useProgress + useHardPoints + useReview)
                │    └── Review (useReview + useHardPoints)
                ├── WelcomeTour
                └── InstallPrompt
```

---

## پیوست: نکات بحرانی

1. **`main.jsx` ترتیب Providerها مهم است** — `OnboardingProvider` بیرونی‌ترین (چون ThemeToggle در WelcomeTour هم هست؟ نه، ولی آینده‌نگرانه).
2. **`SectionSessionProvider` با `key={sectionId}`** — تا هر بار که وارد Section جدید می‌شوی، state ریست شود.
3. **`Section.jsx` دو نقطه‌ی «تکمیل بخش» دارد** — یکی در Summary، یکی در انتهای Card-flow. فقط در Summary است که واقعاً Complete می‌شود. (در نسخه‌ی فعلی، دکمه در Summary است.)
4. **`RichText` در کارت‌ها الزامی است** — بدون آن، `**` و `==` خام نمایش داده می‌شوند.
5. **`touch-pan-y` روی wrapper کارت** — حذف شده تا جدول‌ها بتوانند native scroll شوند.
6. **PWA فقط روی HTTPS** — برای تست موبایل، از cloudflared یا Vercel استفاده کن.
7. **`import.meta.glob` در dev کش می‌کند** — بعد از افزودن فایل JSON جدید، سرور را ری‌استارت کن.
8. **قبل از هر script روی JSONها، بکاپ بگیر.**
9. **`card.id` را هرگز تغییر نده** — Hard Points و Review با آن گره خورده‌اند.
10. **`course.json` فهرست است، نه منبع محتوا** — عنوان/توضیحات جلسه از `session-XX.json` خوانده می‌شود.

---

**پایان سند.**
```

---

## خلاصه‌ی این فایل

این سند شامل **۲۵ بخش** و دو پیوست است:

| بخش | محتوا |
|---|---|
| ۱-۳ | نمای کلی، تکنولوژی‌ها، ساختار پوشه‌ها |
| ۴-۵ | Schema داده‌ها + Loader |
| ۶-۷ | شش Context + localStorage |
| ۸-۹ | Routing + Layout |
| ۱۰-۱۱ | Card System + RichText |
| ۱۲-۱۵ | Progress + Hard Points + Quiz + Review |
| ۱۶-۱۹ | Onboarding + Dark Mode + PWA + Swipe |
| ۲۰-۲۲ | کامپوننت‌های مشترک + Design System + انیمیشن‌ها |
| ۲۳ | اسکریپت‌های کمکی |
| ۲۴ | قواعد افزودن جلسه |
| ۲۵ | راهنمای تطبیق کامل برای دوره‌ی دیگر |
| پیوست | وابستگی فایل‌ها + نکات بحرانی |

اگه یه هوش مصنوعی فقط این فایل رو بخونه، می‌تونه:

- **معماری کامل** رو بازسازی کنه (نه فقط یه تیکه).
- **Schema داده** رو دقیق بسازه.
- **منطق Contextها** رو پیاده کنه.
- **الگوریتم Review** رو دقیق کپی کنه.
- **همه‌ی کامپوننت‌ها** رو با رفتار درست بسازه.
- **برای دوره‌ی دیگه** بدون بازنویسی معماری، تطبیقش بده.

اگه دوست داری این سند رو به بخش‌های کوچیک‌تر بشکنم (مثلاً یه فایل برای Data Schema، یه فایل برای Components)، یا نمونه‌کد بیشتری برای هر بخش اضافه کنم، بگو.