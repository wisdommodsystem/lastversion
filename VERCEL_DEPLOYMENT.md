# نشر المشروع على Vercel - دليل شامل

## المشكلة الشائعة
إذا كنت تواجه رسالة "Sorry, there was an error submitting the survey" بعد النشر على Vercel، فهذا الدليل سيساعدك في حل المشكلة.

## الخطوات المطلوبة

### 1. التأكد من الملفات المطلوبة
تأكد من وجود هذه الملفات في مشروعك:
- `vercel.json` ✅
- `.env.example` ✅
- `server.js` (محدث للعمل مع Vercel) ✅

### 2. إعداد قاعدة البيانات MongoDB
1. إنشاء حساب على [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. إنشاء cluster جديد
3. إنشاء database user
4. الحصول على connection string
5. إضافة `0.0.0.0/0` في Network Access للسماح لجميع IP addresses

### 3. النشر على Vercel

#### الطريقة الأولى: عبر GitHub
1. رفع المشروع على GitHub
2. ربط حساب Vercel بـ GitHub
3. استيراد المشروع من GitHub
4. إضافة متغيرات البيئة (انظر القسم التالي)

#### الطريقة الثانية: عبر Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

### 4. إعداد متغيرات البيئة في Vercel
اذهب إلى Project Settings > Environment Variables وأضف:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/survey_db
ALLOWED_ORIGINS=https://your-project.vercel.app
VERCEL=1
```

**مهم**: استبدل `your-project.vercel.app` برابط مشروعك الفعلي على Vercel.

### 5. إعادة النشر
بعد إضافة متغيرات البيئة، قم بإعادة النشر:
- إما عبر push جديد على GitHub
- أو عبر `vercel --prod`

## التحقق من عمل المشروع

### 1. فحص الـ Logs
1. اذهب إلى Vercel Dashboard
2. اختر مشروعك
3. اذهب إلى Functions tab
4. انقر على أي function لرؤية الـ logs

### 2. اختبار API endpoints
تأكد من عمل هذه الروابط:
- `https://your-project.vercel.app/` (الصفحة الرئيسية)
- `https://your-project.vercel.app/api/counter` (العداد العالمي)

### 3. اختبار إرسال الاستبيان
1. افتح الموقع
2. اختر اللغة
3. املأ الاستبيان
4. اضغط إرسال
5. يجب أن تظهر رسالة نجاح

## حل المشاكل الشائعة

### المشكلة: "Sorry, there was an error submitting the survey"
**الحلول:**
1. تحقق من متغيرات البيئة في Vercel
2. تأكد من صحة رابط MongoDB
3. تحقق من الـ logs في Vercel Dashboard
4. تأكد من أن CORS يسمح لنطاق Vercel

### المشكلة: "Cannot connect to MongoDB"
**الحلول:**
1. تحقق من صحة MONGODB_URI
2. تأكد من إضافة `0.0.0.0/0` في MongoDB Network Access
3. تحقق من صحة username وpassword

### المشكلة: "CORS Error"
**الحلول:**
1. تأكد من إضافة رابط Vercel في ALLOWED_ORIGINS
2. تحقق من أن الرابط صحيح (https://your-project.vercel.app)

## نصائح إضافية

1. **استخدم MongoDB Atlas**: أفضل من الخوادم المحلية
2. **فعل الـ logs**: لمراقبة الأخطاء
3. **اختبر محلياً أولاً**: تأكد من عمل المشروع محلياً قبل النشر
4. **استخدم HTTPS**: Vercel يوفر HTTPS تلقائياً

## الدعم
إذا واجهت مشاكل أخرى، تحقق من:
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)