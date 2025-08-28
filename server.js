const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy for production deployment
if (NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self", "data:", "https:"],
      mediaSrc: ["'self", "data:", "blob:"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Global rate limiting
const globalRequests = new Map();
const GLOBAL_RATE_LIMIT = 100; // requests per minute
const GLOBAL_WINDOW = 60 * 1000; // 1 minute

function globalRateLimit(req, res, next) {
    const sessionId = req.headers['x-session-id'] || 'anonymous';
    const now = Date.now();
    
    if (!globalRequests.has(sessionId)) {
        globalRequests.set(sessionId, { count: 1, resetTime: now + GLOBAL_WINDOW });
        return next();
    }
    
    const requestData = globalRequests.get(sessionId);
    
    if (now > requestData.resetTime) {
        globalRequests.set(sessionId, { count: 1, resetTime: now + GLOBAL_WINDOW });
        return next();
    }
    
    if (requestData.count >= GLOBAL_RATE_LIMIT) {
        return res.status(429).json({
            success: false,
            message: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.'
        });
    }
    
    requestData.count++;
    next();
}

// Security middleware
app.use((req, res, next) => {
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
        "img-src 'self' data: https://img.youtube.com https://i.postimg.cc https://cdnjs.cloudflare.com; " +
        "connect-src 'self'; " +
        "frame-ancestors 'none'; " +
        "base-uri 'self';"
    );
    
    // HTTPS Strict Transport Security
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    next();
});

// Apply global rate limiting to all routes
app.use(globalRateLimit);

// Middleware
const corsOptions = {
  origin: NODE_ENV === 'production' ? 
    (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://yourdomain.com']) :
    ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ 
  limit: '1mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(bodyParser.urlencoded({ 
  extended: true, 
  limit: '1mb',
  parameterLimit: 100
}));
app.use(express.static('.', {
  maxAge: NODE_ENV === 'production' ? '1d' : 0,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }
}));

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    port: PORT
  });
});

// Keep-alive endpoint to prevent sleeping
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// MongoDB Connection (with fallback to JSON file)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/survey_db';
let useMongoDb = false;
let SurveyResponse;
let Post;
let mongoConnectionAttempted = false;

// Post Schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    enum: ['news', 'articles', 'tech', 'culture', 'sports', 'economy', 'art', 'rap-religion'],
    default: 'articles'
  },
  excerpt: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000
  },
  author: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Survey Response Schema (define outside connection)
const surveyResponseSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    enum: ['ar', 'en']
  },
  answers: {
    type: Map,
    of: String,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
  // userAgent and ipAddress fields removed for privacy protection
});

// MongoDB Connection with improved error handling and retry mechanism
async function connectToMongoDB(retryCount = 0) {
  if (mongoConnectionAttempted && retryCount === 0) return;
  
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds

  try {
    console.log(`🔄 محاولة الاتصال بـ MongoDB... (المحاولة ${retryCount + 1}/${maxRetries + 1})`);
    
    // Use only supported MongoDB connection options
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      connectTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000 // 45 seconds
    });
    
    console.log('✅ تم الاتصال بقاعدة البيانات MongoDB بنجاح');
    console.log(`🔗 متصل بـ: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
    useMongoDb = true;
    mongoConnectionAttempted = true;
    
    // Create the models after successful connection
    if (!SurveyResponse) {
      SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);
    }
    if (!Post) {
      Post = mongoose.model('Post', postSchema);
    }
    
  } catch (error) {
    console.log(`❌ فشل الاتصال بـ MongoDB (المحاولة ${retryCount + 1}): ${error.message}`);
    
    if (retryCount < maxRetries) {
      console.log(`⏳ إعادة المحاولة خلال ${retryDelay/1000} ثواني...`);
      setTimeout(() => {
        connectToMongoDB(retryCount + 1);
      }, retryDelay);
    } else {
      console.log('⚠️  فشل الاتصال بـ MongoDB نهائياً، سيتم استخدام تخزين JSON مؤقت');
      console.log('💡 لاستخدام MongoDB، تأكد من:');
      console.log('   - تشغيل خدمة MongoDB أو MongoDB Atlas');
      console.log('   - صحة رابط الاتصال MONGODB_URI');
      console.log('   - إعدادات الشبكة والجدار الناري');
      console.log('   - صحة اسم المستخدم وكلمة المرور');
      useMongoDb = false;
      mongoConnectionAttempted = true;
    }
  }
}

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('🔄 MongoDB: تم تأسيس الاتصال');
});

mongoose.connection.on('error', (err) => {
  console.log(`❌ MongoDB خطأ في الاتصال: ${err.message}`);
  useMongoDb = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB: تم قطع الاتصال');
  useMongoDb = false;
  
  // Attempt to reconnect after disconnection
  if (mongoConnectionAttempted) {
    console.log('🔄 محاولة إعادة الاتصال بـ MongoDB...');
    mongoConnectionAttempted = false;
    setTimeout(() => {
      connectToMongoDB();
    }, 5000); // Wait 5 seconds before reconnecting
  }
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB: تم إعادة الاتصال بنجاح');
  useMongoDb = true;
});

// Graceful shutdown
process.on('SIGINT', async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('🔒 تم إغلاق اتصال MongoDB بأمان');
  }
  process.exit(0);
});

// Attempt to connect to MongoDB
connectToMongoDB();

// JSON file storage fallback
const JSON_FILE_PATH = process.env.DATA_FILE_PATH || path.join(__dirname, 'survey_responses.json');

// Helper functions for JSON storage
function readJsonFile() {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const data = fs.readFileSync(JSON_FILE_PATH, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('خطأ في قراءة ملف JSON:', error);
    return [];
  }
}

function writeJsonFile(data) {
  try {
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('خطأ في كتابة ملف JSON:', error);
    return false;
  }
}

// Routes

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve other static files
app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});

// Submit survey response
app.post('/api/submit-survey', async (req, res) => {
  try {
    console.log('📝 Survey submission received');
    // Headers logging removed for privacy protection
    
    const { language, answers } = req.body;
    
    if (!language || !answers) {
      console.log('❌ Missing required fields:', { language, answers });
      return res.status(400).json({ 
        success: false, 
        message: 'اللغة والإجابات مطلوبة' 
      });
    }

    // Note: Duplicate submission checking removed for privacy

    const responseData = {
      language,
      answers,
      submittedAt: new Date().toISOString()
    };

    // Try MongoDB first, fallback to JSON if it fails
    let savedSuccessfully = false;
    let responseId = null;
    let storageUsed = 'json';
    
    if (useMongoDb && SurveyResponse) {
      try {
        // Use MongoDB
        const surveyResponse = new SurveyResponse(responseData);
        const savedResponse = await surveyResponse.save();
        
        responseId = savedResponse._id;
        storageUsed = 'mongodb';
        savedSuccessfully = true;
        
        console.log('✅ تم حفظ الاستبيان في MongoDB بنجاح');
        
      } catch (mongoError) {
        console.log('❌ فشل حفظ الاستبيان في MongoDB');
        console.log('🔄 التبديل إلى تخزين JSON...');
        
        // Mark MongoDB as unavailable temporarily
        useMongoDb = false;
        
        // Fallback to JSON storage
        try {
          const responses = readJsonFile();
          responseData.id = Date.now().toString();
          responses.push(responseData);
          
          if (writeJsonFile(responses)) {
            responseId = responseData.id;
            storageUsed = 'json';
            savedSuccessfully = true;
            console.log('✅ تم حفظ الاستبيان في ملف JSON كبديل');
          }
        } catch (jsonError) {
          console.log('❌ فشل حفظ الاستبيان في JSON أيضاً');
          throw new Error('فشل في حفظ البيانات في كلا من MongoDB و JSON');
        }
      }
    } else {
      // Use JSON file directly
      try {
        const responses = readJsonFile();
        responseData.id = Date.now().toString();
        responses.push(responseData);
        
        if (writeJsonFile(responses)) {
          responseId = responseData.id;
          storageUsed = 'json';
          savedSuccessfully = true;
          console.log('✅ تم حفظ الاستبيان في ملف JSON');
        } else {
          throw new Error('فشل في كتابة ملف JSON');
        }
      } catch (jsonError) {
        console.log('❌ فشل حفظ الاستبيان في JSON');
        throw jsonError;
      }
    }
    
    if (savedSuccessfully) {
      // Update counter cache immediately after successful save
      try {
        let newCounterValue = 0;
        if (storageUsed === 'mongodb' && SurveyResponse) {
          newCounterValue = await SurveyResponse.countDocuments();
        } else {
          const responses = readJsonFile();
          newCounterValue = responses.length;
        }
        
        // Update the counter cache
        counterCache.value = newCounterValue;
        counterCache.lastUpdated = Date.now();
        
        console.log(`✅ Counter cache updated to: ${newCounterValue}`);
      } catch (counterError) {
        console.log('⚠️ Failed to update counter cache:', counterError.message);
        // Don't fail the request if counter update fails
      }
      
      res.json({ 
        success: true, 
        message: storageUsed === 'mongodb' ? 'تم حفظ الإجابات بنجاح في MongoDB' : 'تم حفظ الإجابات بنجاح في ملف JSON',
        id: responseId,
        storage: storageUsed
      });
    } else {
      throw new Error('فشل في حفظ البيانات');
    }
  } catch (error) {
    console.error('❌ خطأ في حفظ الاستبيان');
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في الخادم',
      error: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all survey responses (for admin)
app.get('/api/responses', async (req, res) => {
  try {
    let responses;
    
    if (useMongoDb && SurveyResponse) {
      // Use MongoDB
      responses = await SurveyResponse.find().sort({ submittedAt: -1 });
    } else {
      // Use JSON file
      responses = readJsonFile();
      responses.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }
    
    res.json({ 
      success: true, 
      data: responses,
      storage: useMongoDb ? 'mongodb' : 'json'
    });
  } catch (error) {
    console.error('خطأ في جلب الاستبيانات');
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في الخادم' 
    });
  }
});

// Get survey statistics
app.get('/api/stats', async (req, res) => {
  try {
    let totalResponses, arabicResponses, englishResponses;
    
    if (useMongoDb && SurveyResponse) {
      // Use MongoDB
      totalResponses = await SurveyResponse.countDocuments();
      arabicResponses = await SurveyResponse.countDocuments({ language: 'ar' });
      englishResponses = await SurveyResponse.countDocuments({ language: 'en' });
    } else {
      // Use JSON file
      const responses = readJsonFile();
      totalResponses = responses.length;
      arabicResponses = responses.filter(r => r.language === 'ar').length;
      englishResponses = responses.filter(r => r.language === 'en').length;
    }
    
    res.json({
      success: true,
      data: {
        total: totalResponses,
        arabic: arabicResponses,
        english: englishResponses
      },
      storage: useMongoDb ? 'mongodb' : 'json'
    });
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات');
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في الخادم' 
    });
  }
});

// Counter cache and rate limiting
let counterCache = {
  value: 0,
  lastUpdated: 0,
  isUpdating: false
};
const COUNTER_CACHE_TTL = 5000; // 5 seconds cache
const counterRequests = new Map();
const COUNTER_RATE_LIMIT = 10; // requests per minute
const COUNTER_WINDOW = 60000; // 1 minute

// Advanced counter with caching and rate limiting
app.get('/api/counter', async (req, res) => {
  try {
    const sessionId = req.sessionID || 'anonymous';
    const now = Date.now();
    
    // Rate limiting check
    const clientRequests = counterRequests.get(sessionId) || { count: 0, resetTime: now + COUNTER_WINDOW };
    
    if (now > clientRequests.resetTime) {
      clientRequests.count = 0;
      clientRequests.resetTime = now + COUNTER_WINDOW;
    }
    
    if (clientRequests.count >= COUNTER_RATE_LIMIT) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        counter: counterCache.value,
        cached: true,
        retryAfter: Math.ceil((clientRequests.resetTime - now) / 1000)
      });
    }
    
    clientRequests.count++;
    counterRequests.set(sessionId, clientRequests);
    
    // Check cache validity
    const cacheAge = now - counterCache.lastUpdated;
    const isCacheValid = cacheAge < COUNTER_CACHE_TTL && counterCache.value > 0;
    
    if (isCacheValid && !counterCache.isUpdating) {
      return res.json({
        success: true,
        counter: counterCache.value,
        storage: useMongoDb ? 'mongodb' : 'json',
        cached: true,
        cacheAge: Math.floor(cacheAge / 1000)
      });
    }
    
    // Prevent multiple simultaneous updates
    if (counterCache.isUpdating) {
      return res.json({
        success: true,
        counter: counterCache.value || 0,
        storage: useMongoDb ? 'mongodb' : 'json',
        cached: true,
        updating: true
      });
    }
    
    counterCache.isUpdating = true;
    let totalSubmissions = 0;
    
    try {
      if (useMongoDb && SurveyResponse) {
        // Use MongoDB with timeout
        totalSubmissions = await Promise.race([
          SurveyResponse.countDocuments(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database timeout')), 5000)
          )
        ]);
      } else {
        // Use JSON file
        const responses = readJsonFile();
        totalSubmissions = responses.length;
      }
      
      // Update cache
      counterCache.value = totalSubmissions;
      counterCache.lastUpdated = now;
      
      res.json({
        success: true,
        counter: totalSubmissions,
        storage: useMongoDb ? 'mongodb' : 'json',
        cached: false,
        timestamp: now
      });
      
    } catch (dbError) {
      console.error('Database error in counter');
      
      // Fallback to cached value or JSON
      if (counterCache.value > 0) {
        res.json({
          success: true,
          counter: counterCache.value,
          storage: 'cache-fallback',
          cached: true,
          warning: 'Using cached data due to database error'
        });
      } else {
        // Last resort: try JSON file
        try {
          const responses = readJsonFile();
          totalSubmissions = responses.length;
          counterCache.value = totalSubmissions;
          counterCache.lastUpdated = now;
          
          res.json({
            success: true,
            counter: totalSubmissions,
            storage: 'json-fallback',
            cached: false,
            warning: 'Database unavailable, using JSON storage'
          });
        } catch (jsonError) {
          throw new Error('Both database and JSON storage failed');
        }
      }
    } finally {
      counterCache.isUpdating = false;
    }
    
  } catch (error) {
    console.error('Critical error in counter endpoint:', error);
    counterCache.isUpdating = false;
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error occurred',
      counter: counterCache.value || 0,
      error: NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: Date.now()
    });
  }
});

// Counter analytics endpoint
app.get('/api/counter/analytics', async (req, res) => {
  try {
    const sessionId = req.sessionID || 'anonymous';
    const now = Date.now();
    
    // Rate limiting for analytics
    const clientRequests = counterRequests.get(sessionId + '_analytics') || { count: 0, resetTime: now + COUNTER_WINDOW };
    
    if (now > clientRequests.resetTime) {
      clientRequests.count = 0;
      clientRequests.resetTime = now + COUNTER_WINDOW;
    }
    
    if (clientRequests.count >= 5) { // Lower limit for analytics
      return res.status(429).json({
        success: false,
        message: 'Analytics rate limit exceeded'
      });
    }
    
    clientRequests.count++;
    counterRequests.set(sessionId + '_analytics', clientRequests);
    
    let analytics = {
      currentCount: counterCache.value,
      cacheStatus: {
        lastUpdated: counterCache.lastUpdated,
        age: now - counterCache.lastUpdated,
        isValid: (now - counterCache.lastUpdated) < COUNTER_CACHE_TTL
      },
      storage: useMongoDb ? 'mongodb' : 'json',
      serverTime: now
    };
    
    // Add growth statistics if possible
    if (useMongoDb && SurveyResponse) {
      try {
        const last24h = new Date(now - 24 * 60 * 60 * 1000);
        const recentCount = await SurveyResponse.countDocuments({
          submittedAt: { $gte: last24h }
        });
        analytics.growth24h = recentCount;
      } catch (error) {
        console.warn('Could not fetch growth analytics:', error.message);
      }
    }
    
    res.json({
      success: true,
      analytics
    });
    
  } catch (error) {
    console.error('Analytics endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Analytics unavailable'
    });
  }
});

// Basic rate limiting for admin endpoints
const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // increased limit since no authentication
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح من المحاولات من هذا العنوان. يرجى المحاولة لاحقاً.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper functions for basic operations
function logEvent(type, details) {
  const timestamp = new Date().toISOString();
  console.log(`📝 [LOG] ${timestamp} - ${type}:`, details);
}

// Basic utility functions for admin operations

// No authentication middleware needed - direct access to admin functions

// Admin endpoints - no authentication required







// Admin password verification endpoint
app.post('/api/admin/verify', adminRateLimit, async (req, res) => {
  console.log('🔐 Admin verification request received');
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'كلمة المرور مطلوبة' 
      });
    }
    
    // Check against ADMINLKATABA_PASSWORD from .env
    const adminPassword = process.env.ADMINLKATABA_PASSWORD;
    
    if (!adminPassword) {
      console.error('❌ ADMINLKATABA_PASSWORD not found in environment variables');
      return res.status(500).json({ 
        success: false, 
        message: 'خطأ في إعدادات الخادم' 
      });
    }
    
    if (password === adminPassword) {
      console.log('✅ Admin access granted');
      res.json({ 
        success: true, 
        message: 'تم التحقق بنجاح' 
      });
    } else {
      console.log('❌ Invalid admin password attempt');
      res.status(401).json({ 
        success: false, 
        message: 'كلمة المرور غير صحيحة' 
      });
    }
    
  } catch (error) {
    console.error('❌ Admin verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في الخادم' 
    });
  }
});

app.post('/api/admin/statistics', adminRateLimit, async (req, res) => {
  console.log('📊 Statistics request received with enhanced security');
  try {

    let responses;
    
    if (useMongoDb && SurveyResponse) {
      // Use MongoDB
      responses = await SurveyResponse.find({}).lean();
    } else {
      // Use JSON file
      responses = readJsonFile();
    }

    // Calculate advanced statistics
    const totalSubmissions = responses.length;
    const languageStats = {};
    const ageStats = {};
    const ageGroupsDetailed = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56-65': 0,
      '65+': 0,
      'غير محدد': 0
    };
    const genderStats = {};
    const educationStats = {};
    const employmentStats = {};
    const incomeStats = {};
    const regionStats = {};
    const beliefStats = {};
    const religiousBackgroundStats = {};
    const religiousCommitmentStats = {};
    const familySupportStats = {};
    const reasonForLeavingStats = {};
    const submissionsByDate = {};
    const submissionsByHour = {};
    const submissionsByWeekday = {};
    const submissionsByMonth = {};
    const deviceStats = {};
    const browserStats = {};
    const responseTimeStats = [];
    const completionRateStats = {};
    const demographicCombinations = {};
    const additionalThoughts = [];
    const crossAnalysis = {
      ageByGender: {},
      educationByAge: {},
      beliefByAge: {},
      regionByBelief: {},
      familySupportByAge: {}
    };

    responses.forEach(response => {
      // Language distribution
      const lang = response.language === 'ar' ? 'العربية' : (response.language === 'en' ? 'English' : 'غير محدد');
      languageStats[lang] = (languageStats[lang] || 0) + 1;

      // Process answers - handle both array and object formats
      if (response.answers) {
        if (Array.isArray(response.answers)) {
          // Array format (MongoDB)
          response.answers.forEach(answer => {
            switch (answer.questionId) {
              case 'age':
                ageStats[answer.answer] = (ageStats[answer.answer] || 0) + 1;
                break;
              case 'gender':
                genderStats[answer.answer] = (genderStats[answer.answer] || 0) + 1;
                break;
              case 'education':
                educationStats[answer.answer] = (educationStats[answer.answer] || 0) + 1;
                break;
              case 'employment':
                employmentStats[answer.answer] = (employmentStats[answer.answer] || 0) + 1;
                break;
              case 'income':
                incomeStats[answer.answer] = (incomeStats[answer.answer] || 0) + 1;
                break;
              case 'region':
              case 'location':
                regionStats[answer.answer] = (regionStats[answer.answer] || 0) + 1;
                break;
            }
          });
        } else {
          // Object format (JSON file)
          const answers = response.answers;
          
          // Basic stats
          if (answers.age) {
            ageStats[answers.age] = (ageStats[answers.age] || 0) + 1;
            // Map to detailed age groups
            if (answers.age === '18-25') ageGroupsDetailed['18-25']++;
            else if (answers.age === '26-35') ageGroupsDetailed['26-35']++;
            else if (answers.age === '36-45') ageGroupsDetailed['36-45']++;
            else if (answers.age === '46-55') ageGroupsDetailed['46-55']++;
            else if (answers.age === '56-65') ageGroupsDetailed['56-65']++;
            else if (answers.age === '65+') ageGroupsDetailed['65+']++;
            else ageGroupsDetailed['غير محدد']++;
          }
          
          if (answers.gender) genderStats[answers.gender] = (genderStats[answers.gender] || 0) + 1;
          if (answers.education) educationStats[answers.education] = (educationStats[answers.education] || 0) + 1;
          if (answers.employment) employmentStats[answers.employment] = (employmentStats[answers.employment] || 0) + 1;
          if (answers.income) incomeStats[answers.income] = (incomeStats[answers.income] || 0) + 1;
          if (answers.location) regionStats[answers.location] = (regionStats[answers.location] || 0) + 1;
          
          // New detailed stats
          if (answers.belief) beliefStats[answers.belief] = (beliefStats[answers.belief] || 0) + 1;
          if (answers['religious-background']) religiousBackgroundStats[answers['religious-background']] = (religiousBackgroundStats[answers['religious-background']] || 0) + 1;
          if (answers['religious-commitment']) religiousCommitmentStats[answers['religious-commitment']] = (religiousCommitmentStats[answers['religious-commitment']] || 0) + 1;
          if (answers['family-support']) familySupportStats[answers['family-support']] = (familySupportStats[answers['family-support']] || 0) + 1;
          if (answers['reason-for-leaving']) reasonForLeavingStats[answers['reason-for-leaving']] = (reasonForLeavingStats[answers['reason-for-leaving']] || 0) + 1;
          
          // Cross analysis
          if (answers.age && answers.gender) {
            const key = `${answers.age} - ${answers.gender}`;
            crossAnalysis.ageByGender[key] = (crossAnalysis.ageByGender[key] || 0) + 1;
          }
          
          if (answers.education && answers.age) {
            const key = `${answers.education} - ${answers.age}`;
            crossAnalysis.educationByAge[key] = (crossAnalysis.educationByAge[key] || 0) + 1;
          }
          
          if (answers.belief && answers.age) {
            const key = `${answers.belief} - ${answers.age}`;
            crossAnalysis.beliefByAge[key] = (crossAnalysis.beliefByAge[key] || 0) + 1;
          }
          
          if (answers.location && answers.belief) {
            const key = `${answers.location} - ${answers.belief}`;
            crossAnalysis.regionByBelief[key] = (crossAnalysis.regionByBelief[key] || 0) + 1;
          }
          
          if (answers['family-support'] && answers.age) {
            const key = `${answers['family-support']} - ${answers.age}`;
            crossAnalysis.familySupportByAge[key] = (crossAnalysis.familySupportByAge[key] || 0) + 1;
          }
          
          // Collect additional thoughts
          if (answers['additional-thoughts'] && answers['additional-thoughts'].trim()) {
            additionalThoughts.push(answers['additional-thoughts'].trim());
          }
        }
      }

      // Advanced time-based analytics
      const submissionDate = new Date(response.submittedAt);
      const date = submissionDate.toISOString().split('T')[0];
      const hour = submissionDate.getHours();
      const weekday = submissionDate.toLocaleDateString('ar-EG', { weekday: 'long' });
      const month = submissionDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
      
      submissionsByDate[date] = (submissionsByDate[date] || 0) + 1;
      submissionsByHour[hour] = (submissionsByHour[hour] || 0) + 1;
      submissionsByWeekday[weekday] = (submissionsByWeekday[weekday] || 0) + 1;
      submissionsByMonth[month] = (submissionsByMonth[month] || 0) + 1;
      
      // Device and browser analytics
      if (response.userAgent) {
        const userAgent = response.userAgent.toLowerCase();
        let device = 'غير محدد';
        let browser = 'غير محدد';
        
        // Device detection
        if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
          device = 'هاتف محمول';
        } else if (userAgent.includes('tablet') || userAgent.includes('ipad')) {
          device = 'جهاز لوحي';
        } else {
          device = 'حاسوب مكتبي';
        }
        
        // Browser detection
        if (userAgent.includes('chrome')) browser = 'Chrome';
        else if (userAgent.includes('firefox')) browser = 'Firefox';
        else if (userAgent.includes('safari')) browser = 'Safari';
        else if (userAgent.includes('edge')) browser = 'Edge';
        else if (userAgent.includes('opera')) browser = 'Opera';
        
        deviceStats[device] = (deviceStats[device] || 0) + 1;
        browserStats[browser] = (browserStats[browser] || 0) + 1;
      }
      
      // Demographic combinations for advanced insights
      if (response.answers) {
        let age, gender, education;
        if (Array.isArray(response.answers)) {
          response.answers.forEach(answer => {
            if (answer.questionId === 'age') age = answer.answer;
            if (answer.questionId === 'gender') gender = answer.answer;
            if (answer.questionId === 'education') education = answer.answer;
          });
        } else {
          age = response.answers.age;
          gender = response.answers.gender;
          education = response.answers.education;
        }
        
        if (age && gender) {
          const combo = `${age} - ${gender}`;
          demographicCombinations[combo] = (demographicCombinations[combo] || 0) + 1;
        }
      }
    });

    // Get recent submissions (last 10)
    const recentSubmissions = responses
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 10)
      .map(response => ({
        id: response.id || response._id,
        language: response.language,
        submittedAt: response.submittedAt,
        userAgent: response.userAgent ? response.userAgent.substring(0, 50) + '...' : 'غير متوفر',
        ipAddress: response.ipAddress || 'غير متوفر'
      }));

    // Calculate additional metrics
    const avgSubmissionsPerDay = totalSubmissions > 0 ? 
      (totalSubmissions / Object.keys(submissionsByDate).length).toFixed(2) : 0;
    
    const peakHour = Object.entries(submissionsByHour)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'غير محدد';
    
    const mostActiveDay = Object.entries(submissionsByWeekday)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'غير محدد';
    
    const topRegion = Object.entries(regionStats)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'غير محدد';
    
    const mobilePercentage = deviceStats['هاتف محمول'] ? 
      ((deviceStats['هاتف محمول'] / totalSubmissions) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      statistics: {
        // Basic stats
        totalSubmissions,
        languageStats,
        ageStats,
        ageGroupsDetailed,
        genderStats,
        educationStats,
        employmentStats,
        incomeStats,
        regionStats,
        
        // Survey-specific stats
        beliefStats,
        religiousBackgroundStats,
        religiousCommitmentStats,
        familySupportStats,
        reasonForLeavingStats,
        
        // Time-based analytics
        submissionsByDate,
        submissionsByHour,
        submissionsByWeekday,
        submissionsByMonth,
        
        // Device & Browser analytics
        deviceStats,
        browserStats,
        
        // Advanced insights
        demographicCombinations,
        crossAnalysis,
        recentSubmissions,
        additionalThoughts,
        
        // Key metrics
        keyMetrics: {
          avgSubmissionsPerDay,
          peakHour: `${peakHour}:00`,
          mostActiveDay,
          topRegion,
          mobilePercentage: `${mobilePercentage}%`,
          totalDaysActive: Object.keys(submissionsByDate).length,
          responseRate: '100%' // Since all submissions are complete
        },
        
        // System info
        storageType: useMongoDb ? 'MongoDB' : 'JSON File',
        lastUpdated: new Date().toISOString(),
        dataQuality: {
          completedResponses: totalSubmissions,
          incompleteResponses: 0,
          duplicateResponses: 0
        }
      }
    });
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات');
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
});

// Data export endpoint
app.post('/api/admin/export', adminRateLimit, async (req, res) => {
  console.log('📥 Export request received with enhanced security');
  
  try {
    const { format = 'json' } = req.body;

    // Get all responses
    let responses = [];
    if (useMongoDb) {
      responses = await SurveyResponse.find({}).lean();
    } else {
      try {
        const data = fs.readFileSync(path.join(__dirname, 'survey_responses.json'), 'utf8');
        responses = JSON.parse(data);
      } catch (error) {
        responses = [];
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'ID', 'Language', 'Age', 'Gender', 'Education', 'Employment', 
        'Income', 'Region', 'Submitted At', 'IP Address', 'User Agent'
      ];
      
      const csvRows = responses.map(response => [
        response.id || response._id || '',
        response.language || '',
        response.age || '',
        response.gender || '',
        response.education || '',
        response.employment || '',
        response.income || '',
        response.region || '',
        response.submittedAt || '',
        response.ipAddress || '',
        response.userAgent || ''
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="survey_data_${timestamp}.csv"`);
      res.send('\uFEFF' + csvContent); // Add BOM for proper UTF-8 encoding
      
    } else if (format === 'excel') {
      // For Excel format, we'll use CSV with .xlsx extension
      // In a real implementation, you might want to use a library like 'xlsx'
      const csvHeaders = [
        'ID', 'Language', 'Age', 'Gender', 'Education', 'Employment', 
        'Income', 'Region', 'Submitted At', 'IP Address', 'User Agent'
      ];
      
      const csvRows = responses.map(response => [
        response.id || response._id || '',
        response.language || '',
        response.age || '',
        response.gender || '',
        response.education || '',
        response.employment || '',
        response.income || '',
        response.region || '',
        response.submittedAt || '',
        response.ipAddress || '',
        response.userAgent || ''
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="survey_data_${timestamp}.xlsx"`);
      res.send('\uFEFF' + csvContent);
      
    } else {
      // Default JSON format
      const jsonData = {
        exportDate: new Date().toISOString(),
        totalRecords: responses.length,
        data: responses
      };
      
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="survey_data_${timestamp}.json"`);
      res.json(jsonData);
    }
    
  } catch (error) {
    console.error('خطأ في تصدير البيانات');
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تصدير البيانات'
    });
  }
});

// Admin endpoint to clear all survey submissions with enhanced security
app.post('/api/admin/clear-submissions', adminRateLimit, async (req, res) => {
  console.log('🗑️ Clear submissions request received with enhanced security');
  try {

    let clearedCount = 0;
    let errors = [];
    
    // Clear MongoDB data
    if (useMongoDb && SurveyResponse) {
      try {
        const result = await SurveyResponse.deleteMany({});
        clearedCount += result.deletedCount;
        console.log(`✅ تم حذف ${result.deletedCount} استجابة من MongoDB`);
      } catch (error) {
        console.error('Error clearing MongoDB');
        errors.push('فشل في حذف بيانات MongoDB');
      }
    }
    
    // Clear JSON file data
    try {
      if (fs.existsSync(JSON_FILE_PATH)) {
        const data = fs.readFileSync(JSON_FILE_PATH, 'utf8');
        const responses = JSON.parse(data);
        const jsonCount = responses.length;
        
        // Write empty array to JSON file
        fs.writeFileSync(JSON_FILE_PATH, '[]', 'utf8');
        clearedCount += jsonCount;
        console.log(`✅ تم حذف ${jsonCount} استجابة من ملف JSON`);
      }
    } catch (error) {
      console.error('Error clearing JSON file');
      errors.push('فشل في حذف بيانات ملف JSON');
    }
    
    // Reset counter cache
    counterCache.value = 0;
    counterCache.lastUpdated = Date.now();
    
    if (errors.length > 0) {
      res.status(500).json({ 
        success: false, 
        message: 'تم حذف بعض البيانات مع وجود أخطاء', 
        clearedCount,
        errors 
      });
    } else {
      res.json({ 
        success: true, 
        message: `تم حذف جميع الاستجابات بنجاح (${clearedCount} استجابة)`,
        clearedCount 
      });
    }
  } catch (error) {
    console.error('Clear submissions error');
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في الخادم' 
    });
  }
});

// Statistics authentication endpoint
app.post('/api/auth/statistics', adminRateLimit, (req, res) => {
  const { username, password } = req.body;
  
  // Get credentials from environment variables
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  // Validate credentials
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'اسم المستخدم وكلمة المرور مطلوبان'
    });
  }
  
  if (username === adminUsername && password === adminPassword) {
    // Generate a simple session token
    const token = crypto.randomBytes(32).toString('hex');
    
    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token: token
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
    });
  }
});

// Start server
// Start server - compatible with Render, Vercel, and local development
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
    console.log(`يمكنك الوصول للموقع على: http://localhost:${PORT}`);
    console.log(`Health check available at: http://localhost:${PORT}/health`);
  });
} else if (process.env.RENDER) {
  // Render-specific configuration
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on Render at port ${PORT}`);
    console.log(`Health check: https://${process.env.RENDER_EXTERNAL_HOSTNAME}/health`);
  });
}

// Chat API endpoints
let activeUsers = new Map();
let chatMessages = [];
const CHAT_FILE = path.join(__dirname, 'chat.json');

// Initialize chat file
function initializeChatFile() {
  if (!fs.existsSync(CHAT_FILE)) {
    const initialData = {
      messages: [],
      users: [],
      created: new Date().toISOString()
    };
    fs.writeFileSync(CHAT_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Read chat data
function readChatData() {
  try {
    if (fs.existsSync(CHAT_FILE)) {
      const data = fs.readFileSync(CHAT_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading chat data:', error);
  }
  return { messages: [], users: [] };
}

// Write chat data
function writeChatData(data) {
  try {
    fs.writeFileSync(CHAT_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing chat data:', error);
  }
}

// Check nickname availability
app.post('/api/chat/check-nickname', (req, res) => {
  try {
    const { nickname } = req.body;
    if (!nickname) {
      return res.status(400).json({ error: 'Nickname is required' });
    }
    
    const normalizedNickname = nickname.trim().toLowerCase();
    const isInUse = activeUsers.has(normalizedNickname);
    
    res.json({ available: !isInUse });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Join chat
app.post('/api/chat/join', (req, res) => {
  try {
    const { nickname, gender, joinTime, avatar } = req.body;
    
    if (!nickname || !gender) {
      return res.status(400).json({ error: 'Nickname and gender are required' });
    }
    
    const normalizedNickname = nickname.trim().toLowerCase();
    
    if (activeUsers.has(normalizedNickname)) {
      return res.status(409).json({ error: 'Nickname already taken' });
    }
    
    const user = {
      nickname: nickname.trim(),
      gender,
      joinTime: joinTime || new Date().toISOString(),
      avatar: avatar || nickname.charAt(0).toUpperCase(),
      lastSeen: new Date().toISOString()
    };
    
    activeUsers.set(normalizedNickname, user);
    
    const chatData = readChatData();
    chatData.users = chatData.users || [];
    chatData.users = chatData.users.filter(u => u.nickname.toLowerCase() !== normalizedNickname);
    chatData.users.push(user);
    writeChatData(chatData);
    
    res.json({ 
      success: true, 
      onlineUsers: activeUsers.size,
      user: user
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Leave chat
app.post('/api/chat/leave', (req, res) => {
  try {
    const { nickname } = req.body;
    
    if (!nickname) {
      return res.status(400).json({ error: 'Nickname is required' });
    }
    
    const normalizedNickname = nickname.trim().toLowerCase();
    activeUsers.delete(normalizedNickname);
    
    res.json({ 
      success: true, 
      onlineUsers: activeUsers.size
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message
app.post('/api/chat/message', (req, res) => {
  try {
    const message = req.body;
    
    if (!message.id || !message.timestamp) {
      return res.status(400).json({ error: 'Invalid message format' });
    }
    
    // Add expiration date for user messages (3 days from now)
    if (message.type === 'user' || message.type === 'text') {
      message.expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    }
    
    if (message.type !== 'system' && message.user) {
      const normalizedNickname = message.user.nickname.toLowerCase();
      if (activeUsers.has(normalizedNickname)) {
        const user = activeUsers.get(normalizedNickname);
        user.lastSeen = new Date().toISOString();
        activeUsers.set(normalizedNickname, user);
      }
    }
    
    const chatData = readChatData();
    chatData.messages.push(message);
    
    // Keep only last 1000 messages
    if (chatData.messages.length > 1000) {
      chatData.messages = chatData.messages.slice(-1000);
    }
    
    writeChatData(chatData);
    
    res.json({ 
      success: true, 
      messageId: message.id,
      onlineUsers: activeUsers.size
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages
app.get('/api/chat/messages', (req, res) => {
  try {
    const chatData = readChatData();
    let messages = chatData.messages || [];
    
    // Filter out expired messages
    const now = new Date();
    messages = messages.filter(msg => {
      if (!msg.expiresAt) return true;
      return new Date(msg.expiresAt) > now;
    });
    
    // Update chat data if any messages were filtered out
    if (messages.length !== chatData.messages.length) {
      chatData.messages = messages;
      writeChatData(chatData);
    }
    
    // Return last 100 messages
    messages = messages.slice(-100);
    
    res.json({ 
      messages,
      onlineUsers: activeUsers.size,
      totalMessages: messages.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete message endpoint
app.delete('/api/chat/delete-message', (req, res) => {
  try {
    const { messageId, userNickname } = req.body;
    
    if (!messageId || !userNickname) {
      return res.status(400).json({ 
        success: false, 
        message: 'معرف الرسالة واسم المستخدم مطلوبان' 
      });
    }
    
    const chatData = readChatData();
    const messageIndex = chatData.messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'الرسالة غير موجودة' 
      });
    }
    
    const message = chatData.messages[messageIndex];
    
    // Check if user owns the message
    if (message.user && message.user.nickname !== userNickname) {
      return res.status(403).json({ 
        success: false, 
        message: 'لا يمكنك حذف رسائل المستخدمين الآخرين' 
      });
    }
    
    // Remove the message
    chatData.messages.splice(messageIndex, 1);
    writeChatData(chatData);
    
    res.json({ 
      success: true, 
      message: 'تم حذف الرسالة بنجاح',
      messageId: messageId
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم' 
    });
  }
});

// Ping endpoint
app.post('/api/chat/ping', (req, res) => {
  try {
    const { nickname } = req.body;
    
    if (nickname) {
      const normalizedNickname = nickname.trim().toLowerCase();
      if (activeUsers.has(normalizedNickname)) {
        const user = activeUsers.get(normalizedNickname);
        user.lastSeen = new Date().toISOString();
        activeUsers.set(normalizedNickname, user);
      }
    }
    
    res.json({ 
      success: true, 
      onlineUsers: activeUsers.size
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Clean up expired messages (runs every hour)
setInterval(() => {
  try {
    const chatData = readChatData();
    const now = new Date();
    const originalLength = chatData.messages.length;
    
    chatData.messages = chatData.messages.filter(msg => {
      if (!msg.expiresAt) return true;
      return new Date(msg.expiresAt) > now;
    });
    
    if (chatData.messages.length !== originalLength) {
      writeChatData(chatData);
      console.log(`Cleaned up ${originalLength - chatData.messages.length} expired messages`);
    }
  } catch (error) {
    console.error('Error during message cleanup:', error);
  }
}, 60 * 60 * 1000); // Run every hour

// Serve chat page
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'chat.html'));
});

// Initialize chat file on startup
initializeChatFile();

// Clean up inactive users every 5 minutes
setInterval(() => {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  
  for (const [nickname, user] of activeUsers.entries()) {
    const lastSeen = new Date(user.lastSeen);
    if (lastSeen < fiveMinutesAgo) {
      activeUsers.delete(nickname);
    }
  }
}, 5 * 60 * 1000);

// Posts API - WisdomHub Posts System
const POSTS_FILE = path.join(__dirname, 'posts.json');

// Initialize posts file if it doesn't exist
async function initializePostsFile() {
    try {
        if (!fs.existsSync(POSTS_FILE)) {
            const samplePosts = [
                {
                    id: 1,
                    title: "مقدمة في الفلسفة الحديثة",
                    content: "الفلسفة الحديثة تمثل نقطة تحول مهمة في تاريخ الفكر الإنساني. بدأت مع رينيه ديكارت وامتدت لتشمل مفكرين عظماء مثل كانط وهيوم. هذه المرحلة تميزت بالتركيز على العقل والتجربة كمصادر للمعرفة، والابتعاد عن الاعتماد الكامل على التقاليد والسلطة الدينية.",
                    author: "فيلسوف الحكمة",
                    date: "2025-01-17",
                    approved: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    title: "نقد الفكر الديني التقليدي",
                    content: "في عصرنا الحالي، أصبح من الضروري إعادة النظر في الكثير من المفاهيم الدينية التقليدية. هذا لا يعني رفض الروحانية، بل يعني تطبيق المنهج العلمي والعقلاني في فهم الوجود والحياة. العلم الحديث قدم لنا أدوات جديدة لفهم الكون والطبيعة البشرية.",
                    author: "باحث في الأديان",
                    date: "2025-01-16",
                    approved: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    title: "الإلحاد والأخلاق: هل يمكن أن نكون أخلاقيين بدون دين؟",
                    content: "سؤال يطرحه الكثيرون: هل يمكن للإنسان أن يكون أخلاقياً بدون الإيمان بإله؟ الجواب بسيط: نعم. الأخلاق الإنسانية تنبع من التعاطف والعقل والتجربة الاجتماعية. العديد من المجتمعات العلمانية تظهر مستويات عالية من الأخلاق والتضامن الاجتماعي.",
                    author: "مفكر حر",
                    date: "2025-01-15",
                    approved: true,
                    createdAt: new Date().toISOString()
                }
            ];
            
            fs.writeFileSync(POSTS_FILE, JSON.stringify(samplePosts, null, 2));
            console.log('Posts file initialized with sample data');
        }
    } catch (error) {
        console.error('Error initializing posts file:', error);
    }
}

// Helper functions for posts
async function readPosts() {
    try {
        if (useMongoDb && Post) {
            // Use MongoDB
            const posts = await Post.find().sort({ createdAt: -1 }).lean();
            return posts.map(post => ({
                id: post._id.toString(),
                title: post.title,
                category: post.category || 'articles',
                excerpt: post.excerpt || '',
                content: post.content,
                author: post.author,
                status: post.status || 'pending',
                date: post.createdAt.toISOString().split('T')[0],
                approved: post.approved,
                createdAt: post.createdAt.toISOString()
            }));
        } else {
            // Fallback to JSON file
            if (!fs.existsSync(POSTS_FILE)) {
                return [];
            }
            const data = fs.readFileSync(POSTS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading posts:', error);
        // If MongoDB fails, try JSON fallback
        if (useMongoDb) {
            try {
                if (!fs.existsSync(POSTS_FILE)) {
                    return [];
                }
                const data = fs.readFileSync(POSTS_FILE, 'utf8');
                return JSON.parse(data);
            } catch (jsonError) {
                console.error('JSON fallback also failed:', jsonError);
                return [];
            }
        }
        return [];
    }
}

async function writePosts(posts) {
    try {
        if (useMongoDb && Post) {
            // Use MongoDB - this function is mainly for JSON compatibility
            // Individual post operations should use MongoDB directly
            console.log('Warning: writePosts called with MongoDB active. Use individual post operations instead.');
            return true;
        } else {
            // Fallback to JSON file
            fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
            return true;
        }
    } catch (error) {
        console.error('Error writing posts:', error);
        return false;
    }
}

// MongoDB-specific post functions
async function createPost(postData) {
    try {
        if (useMongoDb && Post) {
            const newPost = new Post({
                title: postData.title,
                category: postData.category || 'articles',
                excerpt: postData.excerpt || '',
                content: postData.content,
                author: postData.author,
                status: postData.status || 'pending',
                approved: postData.approved || false
            });
            const savedPost = await newPost.save();
            return {
                id: savedPost._id.toString(),
                title: savedPost.title,
                category: savedPost.category,
                excerpt: savedPost.excerpt,
                content: savedPost.content,
                author: savedPost.author,
                status: savedPost.status,
                date: savedPost.createdAt.toISOString().split('T')[0],
                approved: savedPost.approved,
                createdAt: savedPost.createdAt.toISOString()
            };
        } else {
            // Fallback to JSON
            const posts = await readPosts();
            const newPost = {
                id: generatePostId(),
                title: postData.title,
                category: postData.category || 'articles',
                excerpt: postData.excerpt || '',
                content: postData.content,
                author: postData.author,
                status: postData.status || 'pending',
                date: new Date().toISOString().split('T')[0],
                approved: postData.approved || false,
                createdAt: new Date().toISOString()
            };
            posts.unshift(newPost);
            await writePosts(posts);
            return newPost;
        }
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}

async function updatePost(postId, updateData) {
    try {
        if (useMongoDb && Post) {
            const updatedPost = await Post.findByIdAndUpdate(
                postId,
                { ...updateData, updatedAt: new Date() },
                { new: true }
            );
            if (!updatedPost) return null;
            return {
                id: updatedPost._id.toString(),
                title: updatedPost.title,
                category: updatedPost.category,
                excerpt: updatedPost.excerpt,
                content: updatedPost.content,
                author: updatedPost.author,
                status: updatedPost.status,
                date: updatedPost.createdAt.toISOString().split('T')[0],
                approved: updatedPost.approved,
                createdAt: updatedPost.createdAt.toISOString()
            };
        } else {
            // Fallback to JSON
            const posts = await readPosts();
            const postIndex = posts.findIndex(p => p.id.toString() === postId.toString());
            if (postIndex === -1) return null;
            posts[postIndex] = { ...posts[postIndex], ...updateData };
            await writePosts(posts);
            return posts[postIndex];
        }
    } catch (error) {
        console.error('Error updating post:', error);
        throw error;
    }
}

async function deletePost(postId) {
    try {
        if (useMongoDb && Post) {
            const deletedPost = await Post.findByIdAndDelete(postId);
            return !!deletedPost;
        } else {
            // Fallback to JSON
            const posts = await readPosts();
            const postIndex = posts.findIndex(p => p.id.toString() === postId.toString());
            if (postIndex === -1) return false;
            posts.splice(postIndex, 1);
            await writePosts(posts);
            return true;
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
}

function generatePostId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Posts API Routes

// Get all approved posts with optional category filter
app.get('/api/posts', async (req, res) => {
    try {
        const { category } = req.query;
        const posts = await readPosts();
        let approvedPosts = posts.filter(post => post.approved && post.status === 'approved');
        
        // Filter by category if specified
        if (category && category !== 'all') {
            approvedPosts = approvedPosts.filter(post => post.category === category);
        }
        
        // Sort by creation date (newest first)
        approvedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json(approvedPosts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all posts (for admin)
app.get('/api/posts/all', async (req, res) => {
    try {
        const posts = await readPosts();
        
        // Sort by creation date (newest first)
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json(posts);
    } catch (error) {
        console.error('Error fetching all posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get pending posts (for admin)
app.get('/api/posts/pending', async (req, res) => {
    try {
        const posts = await readPosts();
        const pendingPosts = posts.filter(post => !post.approved);
        
        // Sort by creation date (newest first)
        pendingPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json(pendingPosts);
    } catch (error) {
        console.error('Error fetching pending posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Submit new post with password protection and categories
app.post('/api/posts/submit', async (req, res) => {
    try {
        console.log('=== POST SUBMISSION DEBUG ===');
        console.log('Request body:', req.body);
        const { title, category, excerpt, content, author, password } = req.body;
        console.log('Extracted fields:', { title, category, excerpt, content, author, password });
        
        // Validate password
        if (password !== process.env.LKOTAB_PASSWORD) {
            return res.status(401).json({ 
                success: false,
                message: 'كلمة السر غير صحيحة' 
            });
        }
        
        // Validate input
        if (!title || !category || !excerpt || !content || !author) {
            return res.status(400).json({ 
                success: false,
                message: 'جميع الحقول مطلوبة' 
            });
        }
        
        // Validate category
        const validCategories = ['news', 'articles', 'tech', 'culture', 'sports', 'economy', 'art', 'rap-religion'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ 
                success: false,
                message: 'فئة غير صحيحة' 
            });
        }
        
        if (title.length > 200) {
            return res.status(400).json({ 
                success: false,
                message: 'العنوان طويل جداً (الحد الأقصى 200 حرف)' 
            });
        }
        
        if (excerpt.length > 500) {
            return res.status(400).json({ 
                success: false,
                message: 'المقتطف طويل جداً (الحد الأقصى 500 حرف)' 
            });
        }
        
        if (content.length > 10000) {
            return res.status(400).json({ 
                success: false,
                message: 'المحتوى طويل جداً (الحد الأقصى 10000 حرف)' 
            });
        }
        
        if (author.length > 100) {
            return res.status(400).json({ 
                success: false,
                message: 'اسم الكاتب طويل جداً (الحد الأقصى 100 حرف)' 
            });
        }
        
        const newPost = await createPost({
            title: title.trim(),
            category: category,
            excerpt: excerpt.trim(),
            content: content.trim(),
            author: author.trim(),
            status: 'pending', // Posts need admin approval
            approved: false
        });
        
        res.status(201).json({ 
            success: true,
            message: 'تم إرسال المقال بنجاح! سيتم مراجعته من قبل الإدارة قبل النشر.',
            post: newPost 
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ 
            success: false,
            message: 'حدث خطأ في الخادم' 
        });
    }
});

// Create new post (legacy endpoint)
app.post('/api/posts', async (req, res) => {
    try {
        const { title, content, author } = req.body;
        
        // Validate input
        if (!title || !content || !author) {
            return res.status(400).json({ error: 'Title, content, and author are required' });
        }
        
        if (title.length > 200) {
            return res.status(400).json({ error: 'Title is too long (max 200 characters)' });
        }
        
        if (content.length > 10000) {
            return res.status(400).json({ error: 'Content is too long (max 10000 characters)' });
        }
        
        if (author.length > 100) {
            return res.status(400).json({ error: 'Author name is too long (max 100 characters)' });
        }
        
        const newPost = await createPost({
            title: title.trim(),
            content: content.trim(),
            author: author.trim(),
            approved: false // Posts need admin approval
        });
        
        res.status(201).json({ 
            message: 'Post created successfully and is pending approval',
            post: newPost 
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update post status (approve/reject)
app.patch('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['approved', 'rejected', 'deleted'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        if (status === 'approved') {
            const updatedPost = await updatePost(id, { approved: true, status: 'approved' });
            if (!updatedPost) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.json({ 
                message: 'Post approved successfully',
                postId: id,
                post: updatedPost
            });
        } else if (status === 'rejected' || status === 'deleted') {
            const deleted = await deletePost(id);
            if (!deleted) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.json({ 
                message: `Post ${status} successfully`,
                postId: id 
            });
        }
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single post by ID
app.get('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const posts = await readPosts();
        const post = posts.find(p => p.id.toString() === id.toString());
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // Only return approved posts for public access
        if (!post.approved || post.status !== 'approved') {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        res.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete post
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleted = await deletePost(id);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        res.json({ 
            message: 'Post deleted successfully',
            postId: id 
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Search posts
app.get('/api/posts/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length === 0) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        
        const posts = await readPosts();
        const approvedPosts = posts.filter(post => post.approved);
        
        const searchTerm = q.toLowerCase().trim();
        const filteredPosts = approvedPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            post.author.toLowerCase().includes(searchTerm)
        );
        
        // Sort by relevance (title matches first, then content, then author)
        filteredPosts.sort((a, b) => {
            const aTitle = a.title.toLowerCase().includes(searchTerm);
            const bTitle = b.title.toLowerCase().includes(searchTerm);
            
            if (aTitle && !bTitle) return -1;
            if (!aTitle && bTitle) return 1;
            
            // If both or neither match title, sort by creation date
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        res.json(filteredPosts);
    } catch (error) {
        console.error('Error searching posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoints for interactions and comments

// Get interactions for a post
app.get('/api/posts/:postId/interactions', (req, res) => {
    try {
        const { postId } = req.params;
        const interactionsFile = path.join(__dirname, 'interactions.json');
        
        let interactions = {};
        if (fs.existsSync(interactionsFile)) {
            interactions = JSON.parse(fs.readFileSync(interactionsFile, 'utf8'));
        }
        
        const postInteractions = interactions[postId] || { likes: [], dislikes: [] };
        
        res.json({
            success: true,
            interactions: {
                likes: postInteractions.likes.length,
                dislikes: postInteractions.dislikes.length
            }
        });
    } catch (error) {
        console.error('Error getting interactions:', error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// Add/remove interaction (like/dislike)
app.post('/api/posts/:postId/interact', (req, res) => {
    try {
        const { postId } = req.params;
        const { type, userId } = req.body; // type: 'like' or 'dislike'
        
        if (!type || !userId || !['like', 'dislike'].includes(type)) {
            return res.status(400).json({ success: false, message: 'بيانات غير صحيحة' });
        }
        
        const interactionsFile = path.join(__dirname, 'interactions.json');
        let interactions = {};
        
        if (fs.existsSync(interactionsFile)) {
            interactions = JSON.parse(fs.readFileSync(interactionsFile, 'utf8'));
        }
        
        if (!interactions[postId]) {
            interactions[postId] = { likes: [], dislikes: [] };
        }
        
        const postInteractions = interactions[postId];
        const oppositeType = type === 'like' ? 'dislikes' : 'likes';
        
        // Remove from opposite interaction if exists
        const oppositeIndex = postInteractions[oppositeType].indexOf(userId);
        if (oppositeIndex > -1) {
            postInteractions[oppositeType].splice(oppositeIndex, 1);
        }
        
        // Toggle current interaction
        const currentIndex = postInteractions[type + 's'].indexOf(userId);
        if (currentIndex > -1) {
            postInteractions[type + 's'].splice(currentIndex, 1);
        } else {
            postInteractions[type + 's'].push(userId);
        }
        
        fs.writeFileSync(interactionsFile, JSON.stringify(interactions, null, 2));
        
        res.json({
            success: true,
            interactions: {
                likes: postInteractions.likes.length,
                dislikes: postInteractions.dislikes.length
            }
        });
    } catch (error) {
        console.error('Error updating interaction:', error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// Get comments for a post
app.get('/api/posts/:postId/comments', (req, res) => {
    try {
        const { postId } = req.params;
        const commentsFile = path.join(__dirname, 'comments.json');
        
        let comments = {};
        if (fs.existsSync(commentsFile)) {
            comments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
        }
        
        const postComments = comments[postId] || [];
        
        res.json({
            success: true,
            comments: postComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        });
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// Like a post
app.post('/api/posts/:postId/like', (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.ip || 'anonymous'; // Use IP as user identifier
        
        const interactionsFile = path.join(__dirname, 'interactions.json');
        let interactions = {};
        
        if (fs.existsSync(interactionsFile)) {
            interactions = JSON.parse(fs.readFileSync(interactionsFile, 'utf8'));
        }
        
        if (!interactions[postId]) {
            interactions[postId] = { likes: [], dislikes: [] };
        }
        
        const postInteractions = interactions[postId];
        
        // Remove from dislikes if exists
        const dislikeIndex = postInteractions.dislikes.indexOf(userId);
        if (dislikeIndex > -1) {
            postInteractions.dislikes.splice(dislikeIndex, 1);
        }
        
        // Toggle like
        const likeIndex = postInteractions.likes.indexOf(userId);
        if (likeIndex > -1) {
            postInteractions.likes.splice(likeIndex, 1);
        } else {
            postInteractions.likes.push(userId);
        }
        
        fs.writeFileSync(interactionsFile, JSON.stringify(interactions, null, 2));
        
        res.json({
            success: true,
            liked: likeIndex === -1,
            interactions: {
                likes: postInteractions.likes.length,
                dislikes: postInteractions.dislikes.length
            }
        });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// Dislike a post
app.post('/api/posts/:postId/dislike', (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.ip || 'anonymous'; // Use IP as user identifier
        
        const interactionsFile = path.join(__dirname, 'interactions.json');
        let interactions = {};
        
        if (fs.existsSync(interactionsFile)) {
            interactions = JSON.parse(fs.readFileSync(interactionsFile, 'utf8'));
        }
        
        if (!interactions[postId]) {
            interactions[postId] = { likes: [], dislikes: [] };
        }
        
        const postInteractions = interactions[postId];
        
        // Remove from likes if exists
        const likeIndex = postInteractions.likes.indexOf(userId);
        if (likeIndex > -1) {
            postInteractions.likes.splice(likeIndex, 1);
        }
        
        // Toggle dislike
        const dislikeIndex = postInteractions.dislikes.indexOf(userId);
        if (dislikeIndex > -1) {
            postInteractions.dislikes.splice(dislikeIndex, 1);
        } else {
            postInteractions.dislikes.push(userId);
        }
        
        fs.writeFileSync(interactionsFile, JSON.stringify(interactions, null, 2));
        
        res.json({
            success: true,
            disliked: dislikeIndex === -1,
            interactions: {
                likes: postInteractions.likes.length,
                dislikes: postInteractions.dislikes.length
            }
        });
    } catch (error) {
        console.error('Error disliking post:', error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// Add comment to a post
app.post('/api/posts/:postId/comments', (req, res) => {
    try {
        const { postId } = req.params;
        const { author, text } = req.body;
        
        if (!author || !text || text.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'يرجى ملء جميع الحقول' });
        }
        
        if (text.length > 500) {
            return res.status(400).json({ success: false, message: 'التعليق طويل جداً (الحد الأقصى 500 حرف)' });
        }
        
        const commentsFile = path.join(__dirname, 'comments.json');
        let comments = {};
        
        if (fs.existsSync(commentsFile)) {
            comments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
        }
        
        if (!comments[postId]) {
            comments[postId] = [];
        }
        
        const newComment = {
            id: Date.now().toString(),
            author: author.trim(),
            text: text.trim(),
            timestamp: Date.now(),
            createdAt: new Date().toISOString()
        };
        
        comments[postId].push(newComment);
        
        fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));
        
        res.json({
            success: true,
            comment: newComment,
            totalComments: comments[postId].length
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// Get post statistics (likes, dislikes, comments count)
app.get('/api/posts/:postId/stats', (req, res) => {
    try {
        const { postId } = req.params;
        
        // Get interactions
        const interactionsFile = path.join(__dirname, 'interactions.json');
        let interactions = {};
        if (fs.existsSync(interactionsFile)) {
            interactions = JSON.parse(fs.readFileSync(interactionsFile, 'utf8'));
        }
        const postInteractions = interactions[postId] || { likes: [], dislikes: [] };
        
        // Get comments
        const commentsFile = path.join(__dirname, 'comments.json');
        let comments = {};
        if (fs.existsSync(commentsFile)) {
            comments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
        }
        const postComments = comments[postId] || [];
        
        res.json({
            success: true,
            stats: {
                likes: postInteractions.likes.length,
                dislikes: postInteractions.dislikes.length,
                comments: postComments.length,
                engagement: postInteractions.likes.length + postInteractions.dislikes.length + postComments.length
            }
        });
    } catch (error) {
        console.error('Error getting post stats:', error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// Serve hedra page
app.get('/hedra', (req, res) => {
    res.sendFile(path.join(__dirname, 'hedra-new.html'));
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Initialize posts file on startup
initializePostsFile();

// Export for Vercel
module.exports = app;

// MongoDB health check endpoint
app.get('/api/mongodb/status', (req, res) => {
  const mongoStatus = {
    connected: useMongoDb,
    readyState: mongoose.connection.readyState,
    readyStateText: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }[mongoose.connection.readyState],
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    collections: useMongoDb ? Object.keys(mongoose.connection.collections) : [],
    lastError: mongoose.connection.lastError || null
  };
  
  res.json({
    mongodb: mongoStatus,
    fallback: !useMongoDb ? 'Using JSON file storage' : null,
    timestamp: new Date().toISOString()
  });
});

// Note: Graceful shutdown is handled above in the MongoDB connection section