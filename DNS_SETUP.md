# DNS Configuration Guide for Ntandostore Subdomains

This guide explains how to set up real DNS subdomains for `ntando.store` and `ntando.cloud` domains.

## 🌐 Understanding the Current Setup

### Current State: Simulation Mode
The platform currently runs in **simulation mode** where:
- Subdomains like `portfolio.ntando.store` are created locally
- Demo URLs like `http://your-server.com/subdomain/portfolio` work immediately
- Real subdomains require DNS configuration

### What's Working Now:
✅ **Immediate Deployment**: Subdomain folders are created instantly
✅ **Demo URLs**: Accessible via `/subdomain/{name}` route
✅ **File Management**: All files are properly stored and served
✅ **Database Tracking**: Subdomain deployments are recorded

## 🔧 Real Subdomain Setup Steps

### Step 1: Domain Ownership
You must own the domains `ntando.store` and `ntando.cloud` to create real subdomains.

### Step 2: DNS Configuration
For each domain, you need to set up **wildcard DNS records**:

#### For `ntando.store`:
```dns
Type: A Record
Name: *.ntando.store
Value: YOUR_SERVER_IP_ADDRESS
TTL: 300 (or default)

Type: CNAME Record
Name: *.ntando.store
Value: your-app.onrender.com
TTL: 300 (or default)
```

#### For `ntando.cloud`:
```dns
Type: A Record
Name: *.ntando.cloud
Value: YOUR_SERVER_IP_ADDRESS
TTL: 300 (or default)

Type: CNAME Record
Name: *.ntando.cloud
Value: your-app.onrender.com
TTL: 300 (or default)
```

### Step 3: Server Configuration

#### For Render.com:
1. Go to your Render dashboard
2. Add custom domains: `ntando.store` and `ntando.cloud`
3. Render will provide DNS records to add
4. Add the wildcard records as shown above

#### For Self-Hosted Servers:
```nginx
# Nginx configuration for wildcard subdomains
server {
    listen 80;
    server_name *.ntando.store *.ntando.cloud;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 4: SSL Certificates
Use Let's Encrypt for wildcard SSL:

```bash
# For wildcard certificates
certbot certonly --manual -d *.ntando.store -d *.ntando.cloud
```

## 🚀 Deployment Options

### Option 1: Render.com (Recommended)
```bash
# 1. Deploy to Render
git push origin main

# 2. Add custom domains in Render dashboard
# - ntando.store
# - ntando.cloud

# 3. Add DNS records provided by Render
# 4. Add wildcard records as shown above
```

### Option 2: VPS/Dedicated Server
```bash
# 1. Point domains to your server IP
# 2. Configure Nginx/Apache for wildcard subdomains
# 3. Install SSL certificates
# 4. Deploy the application
```

### Option 3: Cloud Services
```bash
# AWS Route 53, Cloudflare, or similar
# Configure DNS records as shown above
# Point to your application server
```

## 🧪 Testing Subdomains

### Testing Simulation URLs (Works Now):
```bash
# Deploy a subdomain "portfolio"
# Demo URL: http://localhost:3000/subdomain/portfolio

# Test with curl:
curl http://localhost:3000/subdomain/portfolio
```

### Testing Real Subdomains (After DNS Setup):
```bash
# After DNS configuration:
curl http://portfolio.ntando.store
curl http://portfolio.ntando.cloud

# Or visit in browser:
# http://portfolio.ntando.store
# http://portfolio.ntando.cloud
```

## 📋 DNS Record Examples

### Cloudflare Setup:
1. Add `ntando.store` and `ntando.cloud` to Cloudflare
2. Create wildcard records:
   - Type: `CNAME`
   - Name: `*`
   - Target: `your-app.onrender.com`
   - Proxy: Enabled

### GoDaddy Setup:
1. Go to DNS Management
2. Add CNAME Record:
   - Type: `CNAME`
   - Name: `*` (or `*.ntando.store`)
   - Value: `your-app.onrender.com`
   - TTL: `1 Hour`

### Namecheap Setup:
1. Go to Advanced DNS
2. Add CNAME Record:
   - Type: `CNAME Record`
   - Host: `*` (or `*.ntando.store`)
   - Value: `your-app.onrender.com`
   - TTL: `Automatic`

## 🔍 Troubleshooting

### Common Issues:

#### 1. Subdomain Not Working
```bash
# Check DNS propagation:
dig portfolio.ntando.store
nslookup portfolio.ntando.store

# Should return your server IP or CNAME target
```

#### 2. SSL Certificate Issues
```bash
# Check certificate:
openssl s_client -connect portfolio.ntando.store:443

# Should show valid certificate chain
```

#### 3. Server Configuration
```bash
# Check if server responds to Host header:
curl -H "Host: portfolio.ntando.store" http://localhost:3000
```

### Debug Commands:
```bash
# Test subdomain routing locally:
curl -H "Host: test.ntando.store" http://localhost:3000

# Check file existence:
ls -la deployed/subdomains/

# Check server logs:
tail -f logs/app.log
```

## ⚡ Quick Start for Testing

### Test Right Now (Simulation Mode):
1. Login to dashboard
2. Deploy with subdomain name "test"
3. Visit: `http://localhost:3000/subdomain/test`

### Enable Real Subdomains:
1. Purchase/register `ntando.store` and `ntando.cloud`
2. Set up DNS as shown above
3. Configure server for wildcard subdomains
4. Deploy to production server
5. Test real subdomains

## 🎯 Production Deployment Checklist

### DNS Configuration:
- [ ] Own `ntando.store` and `ntando.cloud` domains
- [ ] Set up wildcard CNAME records
- [ ] Configure DNS to point to server
- [ ] Test DNS propagation

### Server Setup:
- [ ] Configure web server for wildcard subdomains
- [ ] Install SSL certificates (wildcard)
- [ ] Set up reverse proxy
- [ ] Test subdomain routing

### Application:
- [ ] Deploy to production server
- [ ] Configure environment variables
- [ ] Test subdomain creation
- [ ] Verify file serving

## 📞 Support

If you need help with DNS configuration:

1. **Check this guide first** - most issues are DNS-related
2. **Test simulation URLs** to ensure app works
3. **Verify DNS records** with online tools
4. **Contact domain registrar** for DNS help

---

## 🚀 Next Steps

Once DNS is configured, your subdomains will work exactly like real websites:

- `portfolio.ntando.store`
- `blog.ntando.cloud`
- `shop.ntando.store`
- `app.ntando.cloud`

Each subdomain will serve the deployed website files instantly!

**The simulation mode ensures everything works while you set up DNS. 🎉**