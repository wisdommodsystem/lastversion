# Render Deployment Guide

## Overview
This guide will help you deploy your survey application to Render, a cloud platform that provides free hosting for web applications.

## Prerequisites
- GitHub account
- MongoDB Atlas account (for database)
- Render account (free)

## Files Added/Modified for Render

### 1. `render.yaml` (New)
Render configuration file that defines:
- Service type and environment
- Build and start commands
- Health check endpoint
- Environment variables
- Security headers

### 2. `server.js` (Modified)
Added Render-specific features:
- Health check endpoint (`/health`)
- Keep-alive endpoint (`/ping`)
- Render-specific server binding (`0.0.0.0`)
- Render environment detection

### 3. `.env` (Modified)
Added Render environment variables:
- `RENDER=1` (auto-set by Render)
- `RENDER_EXTERNAL_HOSTNAME` (auto-set by Render)

## Deployment Steps

### Step 1: Prepare Your Repository
1. Push all changes to your GitHub repository
2. Ensure `render.yaml` is in the root directory

### Step 2: Set Up MongoDB Atlas
1. Create a MongoDB Atlas cluster (free tier)
2. Create a database user
3. Get your connection string
4. Whitelist Render's IP addresses (or use 0.0.0.0/0 for simplicity)

### Step 3: Deploy to Render
1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Set the following environment variables in Render dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `ALLOWED_ORIGINS`: Your Render app URL (e.g., `https://your-app.onrender.com`)

### Step 4: Configure Environment Variables
In Render dashboard, go to your service → Environment:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/survey_db?retryWrites=true&w=majority
ALLOWED_ORIGINS=https://your-app-name.onrender.com
SESSION_SECRET=your-secret-key
DATA_FILE_PATH=./survey_responses.json
```

## Health Check
Render will automatically monitor your app using the `/health` endpoint, which returns:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "port": 10000
}
```

## Keep-Alive Feature
The `/ping` endpoint prevents your free Render service from sleeping due to inactivity.

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that `package.json` has correct dependencies
   - Ensure Node.js version is compatible (>=18.0.0)

2. **App Crashes on Startup**
   - Check environment variables are set correctly
   - Verify MongoDB connection string
   - Check Render logs for specific errors

3. **Database Connection Issues**
   - Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
   - Verify connection string format
   - Check database user permissions

4. **CORS Errors**
   - Update `ALLOWED_ORIGINS` with your Render app URL
   - Format: `https://your-app-name.onrender.com`

### Checking Logs
1. Go to your Render dashboard
2. Select your service
3. Click on "Logs" tab
4. Look for startup messages and errors

### Testing Deployment
1. Visit your app URL: `https://your-app-name.onrender.com`
2. Test health check: `https://your-app-name.onrender.com/health`
3. Submit a survey to test functionality
4. Check if responses are saved in MongoDB

## Free Tier Limitations
- Service sleeps after 15 minutes of inactivity
- 750 hours per month (enough for most projects)
- Slower cold starts
- Limited bandwidth

## Upgrading to Paid Plan
For production apps, consider upgrading to:
- No sleeping
- Faster performance
- More bandwidth
- Custom domains
- SSL certificates

## Support
If you encounter issues:
1. Check Render documentation
2. Review application logs
3. Verify environment variables
4. Test MongoDB connection separately

## Security Notes
- Never commit sensitive data to Git
- Use environment variables for secrets
- Regularly rotate API keys and passwords
- Monitor your app for unusual activity