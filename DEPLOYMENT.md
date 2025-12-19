# Ntandostore Hosting Platform - Deployment Guide

This guide will help you deploy the Ntandostore Hosting Platform to various hosting providers.

## 🚀 Quick Deployment Options

### 1. Render.com (Recommended)

**One-Click Deployment:**
1. Fork this repository
2. Create a new Web Service on Render.com
3. Connect your GitHub repository
4. Use the provided `render.yaml` configuration
5. Set environment variables
6. Deploy! 🎉

**Manual Setup:**
```bash
# Build Settings
Build Command: npm install
Start Command: node server.js

# Environment Variables
NODE_ENV=production
PORT=10000
SESSION_SECRET=your-secret-key
```

### 2. Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your-secret-key

# Deploy
git push heroku main
```

### 3. Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### 4. AWS EC2

```bash
# Connect to your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/your-username/ntandostore-hosting.git
cd ntandostore-hosting

# Install dependencies
npm install

# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start server.js --name "ntandostore"

# Setup PM2 startup
pm2 startup
pm2 save
```

### 5. DigitalOcean

```bash
# Create Droplet with Ubuntu 20.04+
# Follow AWS EC2 instructions
```

### 6. Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Session Security
SESSION_SECRET=your-super-secret-session-key

# Database
DB_PATH=./ntandostore.db

# File Storage
UPLOAD_DIR=./uploads
DEPLOY_DIR=./deployed
MAX_FILE_SIZE=104857600
```

### Optional Environment Variables

```bash
# CORS
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@ntandostore.com
```

## 🌐 Custom Domain Setup

### Render.com Custom Domain

1. **Add Custom Domain** in Render dashboard
2. **Update DNS Records**:
   ```
   Type: CNAME
   Name: @
   Value: your-app.onrender.com
   
   Type: CNAME
   Name: www
   Value: your-app.onrender.com
   ```

### Heroku Custom Domain

```bash
# Add custom domain
heroku domains:add yourdomain.com

# Point DNS to Heroku
# CNAME: yourdomain.com -> your-app.herokuapp.com
```

### AWS/Other Providers

1. **Configure Web Server** (Nginx/Apache)
2. **Set up SSL Certificate** (Let's Encrypt)
3. **Update DNS Records**

## 🔒 SSL/HTTPS Setup

### Automatic SSL (Render/Heroku)

Most platforms provide automatic SSL certificates.

### Manual SSL Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Database Setup

### SQLite (Default)

No setup required - database is created automatically.

### PostgreSQL (Optional)

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb ntandostore

# Update .env file
DATABASE_URL=postgresql://username:password@localhost:5432/ntandostore
```

### MongoDB (Optional)

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
sudo apt-get install -y mongodb-org

# Update .env file
MONGODB_URI=mongodb://localhost:27017/ntandostore
```

## 📁 File Storage

### Local Storage (Default)

Files are stored in `./uploads` and `./deployed` directories.

### AWS S3 Storage

```bash
# Install AWS SDK
npm install aws-sdk

# Update .env file
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### Google Cloud Storage

```bash
# Install GCP SDK
npm install @google-cloud/storage

# Update .env file
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_KEYFILE=path/to/service-account.json
GOOGLE_CLOUD_BUCKET=your-bucket-name
```

## 🔍 Monitoring & Logging

### Application Logging

```bash
# View logs
pm2 logs ntandostore

# Log rotation
pm2 install pm2-logrotate
```

### Uptime Monitoring

- **UptimeRobot**: Free monitoring service
- **Pingdom**: Advanced monitoring
- **StatusCake**: Alternative monitoring

### Error Tracking

```bash
# Install Sentry for error tracking
npm install @sentry/node

# Update .env file
SENTRY_DSN=your-sentry-dsn
```

## 🚀 Performance Optimization

### Caching

```bash
# Install Redis for caching
npm install redis

# Update .env file
REDIS_URL=redis://localhost:6379
```

### CDN Setup

1. **Cloudflare**: Free CDN and security
2. **AWS CloudFront**: AWS CDN service
3. **Fastly**: Enterprise CDN

### Compression

```bash
# Enable Gzip compression (already included)
# Add to nginx config for additional compression
```

## 🔧 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 PID
```

**2. Database Connection Issues**
```bash
# Check database file permissions
ls -la *.db

# Fix permissions
chmod 664 ntandostore.db
```

**3. File Upload Issues**
```bash
# Check upload directory permissions
ls -la uploads/

# Fix permissions
chmod 755 uploads/
```

**4. Memory Issues**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 server.js
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm start

# Or set in .env
DEBUG=*
```

## 📈 Scaling

### Horizontal Scaling

- **Load Balancer**: Nginx, HAProxy
- **Multiple Instances**: PM2 cluster mode
- **Database Replication**: Master-slave setup

### Vertical Scaling

- **Increase RAM**: More memory for file uploads
- **Add CPU**: Better processing performance
- **SSD Storage**: Faster file operations

## 🔄 Backup Strategy

### Automated Backups

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backups/ntandostore_$DATE.tar.gz uploads/ deployed/ *.db

# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

### Cloud Backups

- **AWS S3**: Object storage backup
- **Google Drive**: File backup
- **Dropbox**: Alternative backup

## 🎯 Production Checklist

### Security

- [ ] HTTPS/SSL configured
- [ ] Environment variables set
- [ ] File permissions secured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Session secrets strong

### Performance

- [ ] Gzip compression enabled
- [ ] CDN configured
- [ ] Caching implemented
- [ ] Database optimized
- [ ] Image optimization

### Monitoring

- [ ] Error tracking setup
- [ ] Uptime monitoring
- [ ] Log rotation configured
- [ ] Performance metrics
- [ ] Backup automation

### Deployment

- [ ] CI/CD pipeline
- [ ] Zero-downtime deployment
- [ ] Rollback strategy
- [ ] Environment separation
- [ ] Health checks

---

## 🆘 Support

If you encounter any issues during deployment:

1. **Check the logs**: Look for error messages
2. **Verify environment variables**: Ensure all required variables are set
3. **Check file permissions**: Ensure proper access rights
4. **Review documentation**: Consult the main README.md
5. **Create an issue**: Report problems on GitHub

---

**Happy Deploying! 🚀**