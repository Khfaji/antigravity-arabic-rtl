<div align="center">

# 🚀 Antigravity Arabic Suite: Full Arabic & RTL Engine
**محرك التعريب وتكامل الواجهة العربية الشامل لـ Google Antigravity & Antigravity IDE بضغطة زر واحدة.**

<p align="center">
  <a href="https://github.com/Khfaji/antigravity-arabic-suite/releases"><img src="https://img.shields.io/github/v/release/Khfaji/antigravity-arabic-suite?logo=github&color=38bdf8" alt="Latest Release" /></a>
  <a href="https://github.com/Khfaji/antigravity-arabic-suite/stargazers"><img src="https://img.shields.io/github/stars/Khfaji/antigravity-arabic-suite?color=facc15&logo=apachespark" alt="Stars" /></a>
  <a href="https://github.com/Khfaji/antigravity-arabic-suite/forks"><img src="https://img.shields.io/github/forks/Khfaji/antigravity-arabic-suite?color=c084fc" alt="Forks" /></a>
  <a href="https://github.com/Khfaji/antigravity-arabic-suite/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Khfaji/antigravity-arabic-suite?color=4ade80" alt="License" /></a>
</p>

<p align="center">
  <img src="assets/iraq-flag-waving.gif" width="130" alt="العلم العراقي يرفرف" /><br/>
  <b>صُنِعَ بِكُلِّ فَخْرٍ فِي العِرَاقِ</b>
</p>

</div>

---

<div dir="rtl">

## 🌟 أكثر من مجرد أداة لتغيير الاتجاه (Beyond Simple RTL)

ليس هذا المشروع مجرد تعديل شكلي أو سكريبت لتغيير اتجاه الصفحة؛ بل هو **منظومة هندسية متكاملة لبيئة المطور العربي (Arabic Developer Suite)** صُممت خصيصاً للتغلب على التحديات الهيكلية العميقة في تطبيق **Google Antigravity** ومحرره **Antigravity IDE**:

1. **التعامل مع محرر Lexical الحديث:** معالجة معقدة لفقرات المحرر ومسارات `<br>` التلقائية دون المساس بسير الـ Virtual DOM الداخلي.
2. **استقلالية السطر الواحد (Independent Line-by-Line BiDi):** نصوص خليطة في نفس الصندوق أو الرسالة (سطر عربي وسطر إنجليزي)؛ كل سطر يستقل بمحاذاته دون أن يسحب أحدهما الآخر!
3. **ميزة تفوّق عدد الأحرف (Predominant Character Count):** حساب دقيق لعدد الحروف العربية مقابل اللاتينية في السطر الواحد لمنع تشوه النصوص البرمجية أو المصطلحات التقنية.
4. **هندسة بطاقات الانتظار (Queued Messages Architecture):** محاذاة الرسائل المعلقة، مع عكس تسلسل الأزرار تلقائياً وعكس اتجاه أسهم الإرسال بحسب لغة كل رسالة على حدة.
5. **حصانة الأكواد والـ Monaco Editor:** حماية صارمة وشاملة لحاويات الكود البرمجي وشاشات المحرر لضمان بقائها LTR بنسبة 100%.

---

## 💎 المميزات الحصرية والذكية

* 🎯 **توجيه ديناميكي للسطور والفقرات (`unicode-bidi: plaintext`):** يتيح كتابة فقرات مشتركة، بحيث يبدأ السطر العربي من اليمين تماماً، والسطر الإنجليزي من أقصى اليسار داخل نفس صندوق الإدخال.
* ⚖️ **حساب غلبة الحروف (Predominant BiDi Engine):** السطر الذي يحتوي 90% إنجليزي مع كلمة عربية يبقى LTR، بينما السطر ذو الغالبية العربية يتجه لليمين تلقائياً.
* ⏳ **حل جذري لقائمة الانتظار (Queued Messages):**
  - الرسائل العربية تستقر في اليمين، وتترتب أدوات التحكم فيها بالترتيب (حذف $\leftarrow$ تعديل $\leftarrow$ إرسال).
  - سهم الإرسال العربي ينقلب أفقياً (`scaleX(-1)`) ليشير باتجاه اليسار المناسب للـ RTL.
  - الرسائل الإنجليزية تحتفظ بمحاذاتها اليسارية وترتيب أدواتها (Delete $\rightarrow$ Edit $\rightarrow$ Send).
* 🌲 **محرك المراقبة الشاملة والمستمرة (Hybrid Observer + Sync Engine):** يراقب كل تغيرات الـ DOM ويدمج تزامناً دورياً خفيفاً للغاية (< 15MB ذاكرة) لضمان تطبيق القواعد على أي رسالة جديدة فور إضافتها.
* 💻 **دعم متكامل وشامل (Standalone Desktop App & Antigravity IDE):** تثبيت وتفعيل إضافة الـ RTL الرسمية داخل محرر IDE برمجياً وبصمت تام.
* 🤖 **قواعد التوجيه المعرفي للذكاء الاصطناعي (`AGENTS.md` / `GEMINI.md`):** حقن تعليمات إلزامية تجبر الوكيل والمودل على صياغة الردود العربية بتغليف RTL صحيح مع عزل الأكواد بمسارات LTR واضحة.
* 🔄 **إعادة حقن واستجابة فورية بعد التحديثات (Update-Resilient CDP Engine):** ترصد الخدمة في الخلفية تشغيل نوافذ Antigravity فورياً وتقترن بها عبر بروتوكول التشخيص (CDP)، مما يضمن استمرار وتطبيق دعم العربية تلقائياً حتى عند قيام Google بطرح تحديثات واستبدال ملفات التطبيق.
* 🚀 **إقلاع مزدوج ذكي وشامل (Antigravity & IDE Dual-Launcher Pairing):** يقترن محرك الـ RTL تلقائياً باختصارات تشغيل كلٍّ من **تطبيق Antigravity ومحرر Antigravity IDE** على سطح المكتب وقائمة ابدأ؛ فيعمل الدعم تلقائياً عند فتحك لأيٍّ منهما حتى لو لم تكن الخدمة تعمل عند تسجيل الدخول!
* 🛡️ **تشغيل هادئ ومستقل مع بدء النظام:** تعمل الخدمة بخفة تامة مع إقلاع الويندوز (Windows Startup) وبدون تعديل ملفات معقد أو أي تأثير على أداء النظام (< 15MB ذاكرة).

---

## 🚀 التثبيت السريع (بضغطة زر واحدة)

### 1️⃣ الطريقة المباشرة (تحميل بنقرة واحدة - موصى بها)

<div align="center">

<a href="https://github.com/Khfaji/antigravity-arabic-suite/releases/download/v1.0.0/Antigravity-Arabic-Setup.bat">
  <img src="https://img.shields.io/badge/Download_Installer-Antigravity--Arabic--Setup.bat-2563eb?style=for-the-badge&logo=windows&logoColor=white" alt="Download Installer" />
</a>

</div>

* بعد تحميل الملف الصغير (أقل من 1KB)، فقط شغله بنقرة مزدوجة (`Double-Click`) وسيتولى تثبيت وتهيئة كل شيء تلقائياً.

---

### 2️⃣ الطريقة الثانية: أمر مباشر وفوري عبر PowerShell
إذا كنت تفضل سطر الأوامر دون تحميل أي ملف يدوياً، افتح نافذة **PowerShell** وشغّل الأمر التالي:
```powershell
powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/Khfaji/antigravity-arabic-suite/main/install.ps1' -OutFile '$env:TEMP\install.ps1'; & '$env:TEMP\install.ps1'"
```

---

### 3️⃣ الطريقة الثالثة: للمطورين (عبر المستودع)
```bash
git clone https://github.com/Khfaji/antigravity-arabic-suite.git
cd antigravity-arabic-suite
install.bat
```

---

## 🛠️ البنية التقنية وميكانيكية العمل

<table align="center">
<tr>
<td align="center">

```text
+-------------------------------------------------------------+
|                 Google Antigravity Runtime                  |
+------------------------------+------------------------------+
                               |
           [Chrome DevTools Protocol (CDP) / Preload]
                               |
                               v
+-------------------------------------------------------------+
|                Antigravity Arabic RTL Engine                |
|  - BiDi Plaintext Rule Engine (Strict Paragraph Isolation)  |
|  - Predominant Language Detection (Arabic vs Latin Count)   |
|  - Queued Messages Mirrored Controls & Arrow Inversion      |
|  - MutationObserver + Periodic Micro-Task Sync              |
+-------------------------------------------------------------+
```

</td>
</tr>
</table>

1. **الربط الداخلي الآمن:** يتم الاتصال بنافذة العرض عبر بروتوكول DevTools أو عبر حقن معزول تماماً لا يمس شفرة المصدر الأساسية.
2. **عزل الأكواد البرمجية:** استثناء صريح لعناصر `pre, code, .monaco-editor, [class*="shiki"]` لضمان عدم تأثر أي كود أو محرر برمجي بالـ RTL.
3. **تطبيق القواعد المركزية:** دمج ملفات القواعد الموجهة في مسار `~/.gemini/config/rules/` للتأكد من امتثال المساعد الآلي لتعليمات اللغة العربية.

---

## 🗑️ إلغاء التثبيت

لحذف الخدمة واستعادة إعدادات التطبيق الافتراضية بنظافة تامة:
* شغّل ملف **`uninstall.bat`** وستتم إزالة كافة التعديلات والقواعد بأمان.

<br />

<div align="center">

<img src="assets/iraq-flag-waving.gif" width="110" alt="العلم العراقي يرفرف" /><br/>
<b>صُنِعَ بِكُلِّ فَخْرٍ فِي العِرَاقِ</b>

</div>

</div>

---

## 🌐 English Summary

**Antigravity Arabic Suite** is a full-fledged bidirectional (BiDi) localization engine engineered specifically for Google Antigravity and Antigravity IDE on Windows:
* **True Line-by-Line BiDi:** Allows mixed-language paragraphs in Lexical chat input without cross-line text corruption.
* **Predominant Language Counting:** Calculates character frequency to determine line direction, keeping code and tech terms strictly LTR.
* **Smart Queued Messages Handling:** Automatically aligns queued cards with mirrored action buttons and flipped send arrows for RTL messages.
* **Dual-Launcher & Shortcut Pairing:** Automatically pairs with Desktop & Start Menu shortcuts for both **Antigravity and Antigravity IDE** to fire the background daemon whenever you launch either, guaranteeing RTL is always active.
* **Update-Resilient Architecture:** Runs independently via Chrome DevTools Protocol & Windows Startup, automatically attaching to Antigravity runtime even after Google updates the application packages.
* **Zero Disruption to Code:** Monaco editor, Markdown code blocks, and syntax containers remain completely LTR.
* **Seamless Installation:** One-click automated setup with zero manual configuration.

---

### License
This project is licensed under the [MIT License](LICENSE).
