# Survey Application with MongoDB Storage

## نظام الاستبيان مع تخزين MongoDB

هذا التطبيق عبارة عن استبيان تفاعلي يدعم اللغتين العربية والإنجليزية مع تخزين الإجابات في قاعدة بيانات MongoDB.

## المتطلبات

### 1. Node.js
- تأكد من تثبيت Node.js (الإصدار 14 أو أحدث)
- يمكنك تحميله من: https://nodejs.org/

### 2. MongoDB
يمكنك استخدام إحدى الطرق التالية:

#### الطريقة الأولى: MongoDB محلي
1. قم بتحميل وتثبيت MongoDB من: https://www.mongodb.com/try/download/community
2. تأكد من تشغيل خدمة MongoDB

#### الطريقة الثانية: MongoDB Atlas (السحابي - مجاني)
1. إنشاء حساب على: https://www.mongodb.com/atlas
2. إنشاء cluster مجاني
3. الحصول على connection string
4. استبدال الرابط في ملف `server.js`:
```javascript
const MONGODB_URI = 'your-mongodb-atlas-connection-string';
```

## التثبيت والتشغيل

### 1. تثبيت المكتبات
```bash
npm install
```

### 2. تشغيل الخادم
```bash
node server.js
```
أو للتطوير مع إعادة التشغيل التلقائي:
```bash
npm run dev
```

### 3. فتح التطبيق
افتح المتصفح واذهب إلى: http://localhost:3000

## الميزات

- ✅ استبيان تفاعلي بـ 10 أسئلة
- ✅ دعم اللغتين العربية والإنجليزية
- ✅ تصميم متجاوب يعمل على جميع الأجهزة
- ✅ حفظ الإجابات في MongoDB أو ملف JSON
- ✅ واجهات برمجة تطبيقات جاهزة للاستخدام
- ✅ إحصائيات مفصلة للاستبيانات
- ✅ عداد عالمي حقيقي لعدد الإرسالات
- ✅ جاهز للاستضافة على منصات السحابة

### 🌟 الواجهة الأمامية
- تصميم حديث ومتجاوب
- دعم اللغتين العربية والإنجليزية
- تأثيرات بصرية متقدمة
- تنقل سلس بين الأسئلة
- إمكانية التمرير للأسئلة الطويلة

### 🗄️ قاعدة البيانات
- تخزين آمن في MongoDB
- حفظ اللغة المختارة
- تسجيل وقت الإرسال
- حفظ معلومات المتصفح والـ IP

### 🔧 API Endpoints

#### إرسال الاستبيان
```
POST /api/submit-survey
```
Body:
```json
{
  "language": "ar",
  "answers": {
    "question1": "answer1",
    "question2": "answer2"
  }
}
```

#### عرض جميع الإجابات (للإدارة)
```
GET /api/responses
```

#### عرض الإحصائيات
```
GET /api/stats
```

## هيكل قاعدة البيانات

```javascript
{
  _id: ObjectId,
  language: "ar" | "en",
  answers: {
    "question_id": "answer_value",
    // ...
  },
  submittedAt: Date,
  userAgent: String,
  ipAddress: String
}
```

## الملفات الرئيسية

- `index.html` - الواجهة الأمامية
- `style.css` - التصميم والتنسيق
- `script.js` - منطق JavaScript
- `server.js` - خادم Node.js
- `package.json` - إعدادات المشروع

## استكشاف الأخطاء

### خطأ في الاتصال بقاعدة البيانات
1. تأكد من تشغيل MongoDB
2. تحقق من صحة connection string
3. تأكد من صحة اسم المستخدم وكلمة المرور (للـ Atlas)

### خطأ في إرسال الاستبيان
1. تحقق من console في المتصفح
2. تأكد من تشغيل الخادم على المنفذ 3000
3. تحقق من logs الخادم

## التطوير

لإضافة أسئلة جديدة، عدّل متغير `surveyQuestions` في ملف `script.js`.

## الأمان

- تم إضافة CORS للحماية
- تسجيل IP address للمراقبة
- التحقق من صحة البيانات قبل الحفظ

## الاستضافة والنشر

### إعداد متغيرات البيئة
1. انسخ ملف `.env.example` إلى `.env`:
```bash
cp .env.example .env
```

2. حدث القيم في ملف `.env`:
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string
ALLOWED_ORIGINS=https://yourdomain.com
```

### Heroku
1. إنشاء حساب على Heroku وتثبيت Heroku CLI
2. تشغيل الأوامر التالية:
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-connection-string
heroku config:set ALLOWED_ORIGINS=https://your-app-name.herokuapp.com
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Vercel (الموصى به)
1. إنشاء ملف `vercel.json` للتكوين (مضمن بالفعل)
2. تثبيت Vercel CLI: `npm i -g vercel`
3. تسجيل الدخول: `vercel login`
4. ربط المشروع بـ GitHub
5. استيراد المشروع في Vercel
6. **مهم**: إضافة متغيرات البيئة في إعدادات Vercel:
   - `NODE_ENV=production`
   - `MONGODB_URI=your_mongodb_connection_string`
   - `ALLOWED_ORIGINS=https://yourdomain.vercel.app`
   - `VERCEL=1`
7. النشر باستخدام `vercel --prod`

**حل مشاكل Vercel:**
إذا واجهت خطأ في إرسال الاستبيان:
1. تحقق من سجلات Vercel functions في لوحة التحكم
2. تأكد من إعداد متغيرات البيئة بشكل صحيح
3. تحقق من أن CORS يتضمن نطاق Vercel الخاص بك

### Render (بديل مجاني ممتاز)
1. إنشاء ملف `render.yaml` للتكوين (مضمن بالفعل)
2. رفع المشروع إلى GitHub
3. إنشاء حساب على [render.com](https://render.com)
4. ربط المستودع من GitHub
5. **مهم**: إضافة متغيرات البيئة في إعدادات Render:
   - `NODE_ENV=production`
   - `MONGODB_URI=your_mongodb_connection_string`
   - `ALLOWED_ORIGINS=https://your-app.onrender.com`
6. النشر التلقائي عند كل push

**مميزات Render:**
- Health check تلقائي على `/health`
- Keep-alive endpoint على `/ping`
- نشر تلقائي من GitHub
- SSL مجاني
- سجلات مفصلة

### Railway
1. ربط المشروع بـ GitHub
2. نشر المشروع على Railway
3. إضافة متغيرات البيئة في إعدادات Railway

### DigitalOcean App Platform
1. ربط المشروع بـ GitHub
2. إنشاء تطبيق جديد على DigitalOcean
3. تحديد `npm start` كأمر التشغيل
4. إضافة متغيرات البيئة المطلوبة

### Render
1. ربط المشروع بـ GitHub
2. إنشاء Web Service جديد
3. تحديد `npm start` كأمر التشغيل
4. إضافة متغيرات البيئة

## الدعم

للمساعدة أو الاستفسارات، يرجى التواصل مع فريق التطوير.

---

**ملاحظة**: تأكد من تشغيل MongoDB قبل بدء استخدام التطبيق.