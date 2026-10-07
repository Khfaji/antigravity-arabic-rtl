# 🚀 Antigravity Arabic Suite: Full Arabic & RTL Engine
**محرك التعريب وتكامل الواجهة العربية الشامل لـ Google Antigravity & Antigravity IDE بضغطة زر واحدة.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-0078D6.svg)](https://microsoft.com)
[![Node.js: 18+](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production_Ready-brightgreen.svg)]()

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
  - الرسائل العربية تستقر في اليمين، وتنعكس أدوات التحكم فيها (إرسال $\leftarrow$ تعديل $\leftarrow$ حذف).
  - سهم الإرسال العربي ينقلب أفقياً (`scaleX(-1)`) ليشير باتجاه اليسار المناسب للـ RTL.
  - الرسائل الإنجليزية تحتفظ بمحاذاتها اليسارية وترتيب أدواتها الأصلي (حذف $\leftarrow$ تعديل $\leftarrow$ إرسال).
* 🌲 **محرك المراقبة الشاملة والمستمرة (Hybrid Observer + Sync Engine):** يراقب كل تغيرات الـ DOM ويدمج تزامناً دورياً خفيفاً للغاية (< 15MB ذاكرة) لضمان تطبيق القواعد على أي رسالة جديدة فور إضافتها.
* 💻 **دعم متكامل وشامل (Standalone Desktop App & Antigravity IDE):** تثبيت وتفعيل إضافة الـ RTL الرسمية داخل محرر IDE برمجياً وبصمت تام.
* 🤖 **قواعد التوجيه المعرفي للذكاء الاصطناعي (`AGENTS.md` / `GEMINI.md`):** حقن تعليمات إلزامية تجبر الوكيل والمودل على صياغة الردود العربية بتغليف RTL صحيح مع عزل الأكواد بمسارات LTR واضحة.
* 🛡️ **تثبيت أصلي دائم دون كسر للملفات:** يعمل إما عبر الحقن الأصلي في شريان التطبيق أو عبر خدمة تشغيل ذاتي خفيفة مع بدء تشغيل النظام (Windows Startup).

---

## 🚀 التثبيت السريع (بضغطة زر واحدة)

### الطريقة الأولى: عبر المستودع المباشر (الموصى بها)
1. قم باستنساخ المستودع أو تحميله:
   ```bash
   git clone https://github.com/Khfaji/antigravity-arabic-rtl.git
   ```
2. اضغط مرتين على:
   👉 **`install.bat`**
3. سيتم فحص البيئة، وتثبيت Node.js تلقائياً إن لم يكن موجوداً، وحقن وتفعيل الدعم فورياً!

---

### الطريقة الثانية: أمر مباشر وسريع عبر PowerShell
افتح نافذة **PowerShell** وشغّل الأمر التالي:
```powershell
powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/Khfaji/antigravity-arabic-rtl/main/install.ps1' -OutFile '$env:TEMP\install.ps1'; & '$env:TEMP\install.ps1'"
```

---

## 🛠️ البنية التقنية وميكانيكية العمل

```
+-------------------------------------------------------------+
|                Google Antigravity Runtime                   |
+------------------------------+------------------------------+
                               |
            [Chrome DevTools Protocol (CDP) / Preload]
                               |
                               v
+-------------------------------------------------------------+
|               Antigravity Arabic RTL Engine                 |
|  - BiDi Plaintext Rule Engine (Strict Paragraph Isolation)  |
|  - Predominant Language Detection (Arabic vs Latin Count)   |
|  - Queued Messages Mirrored Controls & Arrow Inversion      |
|  - MutationObserver + Periodic Micro-Task Sync              |
+-------------------------------------------------------------+
```

1. **الربط الداخلي الآمن:** يتم الاتصال بنافذة العرض عبر بروتوكول DevTools أو عبر حقن معزول تماماً لا يمس شفرة المصدر الأساسية.
2. **عزل الأكواد البرمجية:** استثناء صريح لعناصر `pre, code, .monaco-editor, [class*="shiki"]` لضمان عدم تأثر أي كود أو محرر برمجي بالـ RTL.
3. **تطبيق القواعد المركزية:** دمج ملفات القواعد الموجهة في مسار `~/.gemini/config/rules/` للتأكد من امتثال المساعد الآلي لتعليمات اللغة العربية.

---

## 🗑️ إلغاء التثبيت

لحذف الخدمة واستعادة إعدادات التطبيق الافتراضية بنظافة تامة:
* شغّل ملف **`uninstall.bat`** وستتم إزالة كافة التعديلات والقواعد بأمان.

</div>

---

## 🌐 English Summary

**Antigravity Arabic Suite** is a full-fledged bidirectional (BiDi) localization engine engineered specifically for Google Antigravity and Antigravity IDE on Windows:
* **True Line-by-Line BiDi:** Allows mixed-language paragraphs in Lexical chat input without cross-line text corruption.
* **Predominant Language Counting:** Calculates character frequency to determine line direction, keeping code and tech terms strictly LTR.
* **Smart Queued Messages Handling:** Automatically aligns queued cards with mirrored action buttons and flipped send arrows for RTL messages.
* **Zero Disruption to Code:** Monaco editor, Markdown code blocks, and syntax containers remain completely LTR.
* **Seamless Installation:** One-click automated setup with zero manual configuration.

---

### License
This project is licensed under the [MIT License](LICENSE).
