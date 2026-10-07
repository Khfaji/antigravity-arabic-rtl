# 🌐 Antigravity Arabic & RTL Support
**تفعيل الدعم الكامل للغة العربية واتجاه اليمين إلى اليسار (RTL) في Google Antigravity بضغطة زر واحدة.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-0078D6.svg)](https://microsoft.com)
[![Node.js: 18+](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)

---

<div dir="rtl">

## 📖 نظرة عامة (Overview)

تطبيق **Google Antigravity** رائع للمطورين، لكن واجهته مبنية بالإنجليزية (`direction: ltr`) بشكل افتراضي، مما يسبب مشاكل متعددة للمستخدم العربي:
1. **صندوق الكتابة (Chat Input):** يفرض كتابة النص وعلامات الترقيم من اليسار (`dir="ltr"`).
2. **الرسائل المرسلة:** بعد إرسال رسالتك، تنقلب وتستقر على اليسار بدلاً من اليمين.
3. **ردود الذكاء الاصطناعي:** تخرج أحياناً باتجاه غير متناسق مع علامات الترقيم والأرقام.

**يقوم هذا المشروع بحل كل هذه المشاكل بضغطة زر واحدة ودون الحاجة لتعديل ملفات التطبيق الأصلية!**

---

## 📋 المتطلبات (Prerequisites)

* **نظام التشغيل:** نظام Windows 10 أو Windows 11.
* **برنامج Antigravity:** مثبت ويعمل على جهازك.
* **بيئة Node.js (الإصدار 18 فما فوق):**
  > 💡 **ملاحظة ذكية:** لا تقلق إذا لم تكن قد قمت بتثبيت Node.js مسبقاً! يقوم ملف التثبيت التلقائي `install.bat` بفحص جهازك وتثبيت Node.js LTS لك تلقائياً وبصمت عبر `winget`.

---

## ✨ المميزات الرئيسية

* 🎯 **توجيه تلقائي لصندوق المحادثة (`dir="auto"`):** بمجرد أن تكتب أول حرف عربي، ينتقل المؤشر والنص فوراً إلى اليمين دون الحاجة للضغط على أي اختصار يدوي.
* 📨 **محاذاة الرسائل المرسلة لليمين:** كل رسالة عربية ترسلها تستقر في اليمين تلقائياً وبترتيب سليم للعلامات والأقواس.
* 🤖 **قواعد موجهة للمساعد (Global AI Rules):** يلتزم الذكاء الاصطناعي تلقائياً بتنسيق الردود العربية من اليمين لليسار، مع الحفاظ الكامل على اتجاه الأكواد البرمجية (LTR).
* ⚡ **يعمل بصمت تام وخفة فائقة:** خدمة خفيفة في الخلفية (< 20MB من الذاكرة) بدون أي نوافذ سوداء أو إزعاج.
* 🔄 **تشغيل تلقائي دائم:** يبدأ تلقائياً مع تشغيل جهازك (Windows Startup + Registry) ولا يتأثر بإغلاق أو فتح التطبيق.
* 🛡️ **آمن تماماً (Zero Dependencies):** يعتمد على مكتبات Node.js القياسية المدمجة فقط بدون أي حزم خارجية من npm.

---

## 🚀 طريقة التثبيت (بضغطة زر واحدة)

### الطريقة الأولى: التحميل والتشغيل المباشر (الموصى بها)
1. قم بتحميل المشروع كملف ZIP أو استنسخه عبر Git:
   ```bash
   git clone https://github.com/<your-username>/antigravity-arabic-rtl.git
   ```
2. اضغط مرتين (Double Click) على الملف:
   👉 **`install.bat`**
3. مبروك! سيتم إعداد كل شيء وتشغيل الخدمة فوراً في ثانية واحدة!

---

### الطريقة الثانية: عبر سطر أوامر PowerShell (أمر واحد فقط)
افتح **PowerShell** والصق هذا الأمر:
```powershell
powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/<your-username>/antigravity-arabic-rtl/main/install.ps1' -OutFile '$env:TEMP\install.ps1'; & '$env:TEMP\install.ps1'"
```

> ⚠️ **ملاحظة هامة بخصوص اسم المستخدم (`<your-username>`):**
> * في حال استخدامك للأوامر أعلاه مباشرة عبر الإنترنت (التفعيل اليدوي عبر الرابط أو عند عمل Fork للمشروع)، **يجب استبدال `<your-username>` باسم حسابك على GitHub** (أو كتابة **`Khfaji`** لتحميل النسخة الرسمية مباشرة).
> * **أما داخل جهازك (Windows):** لا داعي للقلق إطلاقاً! فمسارات الويندوز واسم المستخدم على جهازك يتم التعرف عليها وحلها **تلقائياً بنسبة 100%** عبر سكريبت التثبيت دون أي تدخل منك.

---

## 🛠️ كيف يعمل هذا المشروع برمجياً؟

1. **الربط مع منفذ المطورين (Chrome DevTools Protocol):**  
   يقرأ المنفذ النشط للتطبيق من ملف `DevToolsActivePort` الخاص بـ Antigravity ويتصل عبر WebSocket محلي وآمن (`127.0.0.1`).
2. **حقن التنسيق الذكي (`unicode-bidi: plaintext`):**  
   يقوم بضبط عناصر النصوص لتمييز الحروف العربية تلقائياً ومحاذاتها لليمين دون تشويه الأكواد أو النصوص الإنجليزية.
3. **مراقب DOM دائم (MutationObserver):**  
   يراقب أي محادثة جديدة، رسالة جديدة، أو تبويب جديد يتم فتحه في التطبيق، ويقوم بتطبيق خاصية `dir="auto"` عليه فور ظهوره.
4. **تثبيت القواعد العامة (`AGENTS.md` / `GEMINI.md`):**  
   يضع توجيهات النظام الخاصة بدعم العربية في مسار `~/.gemini/config/` ليعمل التنسيق في كافة المحادثات والمشاريع تلقائياً.

---

## 🗑️ إلغاء التثبيت

إذا أردت في أي وقت إزالة الخدمة والقواعد بالكامل:
* اضغط مرتين على ملف **`uninstall.bat`**، وسيتم إيقاف الخدمة وحذف كل الإعدادات تلقائياً.

</div>

---

## 🌐 English Summary

**Antigravity Arabic & RTL Support** provides full bidirectional (RTL) support for Google Antigravity on Windows:
* Automatically switches the chat input editor to RTL as soon as you type Arabic.
* Automatically aligns sent and received Arabic chat messages to the right with correct punctuation.
* Injects global AI instructions (`AGENTS.md`) so responses are natively formatted with RTL.
* Runs silently in the background via a lightweight daemon with zero external npm dependencies.
* One-click installation via `install.bat`.

### Prerequisites
* Windows 10 or 11
* Google Antigravity installed
* Node.js 18+ (Automatically installed by `install.bat` via winget if not found)

### License
This project is licensed under the [MIT License](LICENSE).
