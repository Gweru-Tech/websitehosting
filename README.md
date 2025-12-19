# Ntandostore Hosting Platform

A comprehensive web hosting platform that allows users to upload files, deploy websites, and manage custom domains. Built with Node.js, Express, and SQLite.

## 🚀 Features

- **User Authentication**: Secure login system with session management
- **File Upload & Management**: Drag-and-drop file uploads with support for all file types
- **Website Deployment**: Instant deployment of static websites
- **Custom Domain Support**: Connect your own domains or use subdomains
- **Responsive Dashboard**: Modern, intuitive user interface
- **Security**: Enterprise-grade security with SSL and rate limiting
- **Scalable**: Built to handle high traffic and large file uploads
- **Render.com Ready**: Pre-configured for easy deployment

## 📋 Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- Git (for deployment)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ntandostore-hosting.git
   cd ntandostore-hosting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration:
   - Set your `SESSION_SECRET`
   - Configure database settings
   - Set up email credentials (optional)

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - Login with:
     - Username: `Ntando`
     - Password: `Ntando`

## 🌐 Deployment on Render.com

### Automatic Deployment

1. **Push your code to GitHub**
2. **Connect to Render.com**
   - Create a new Web Service on Render
   - Connect your GitHub repository
   - Use the provided `render.yaml` configuration
3. **Configure environment variables** in Render dashboard
4. **Deploy** - Render will automatically build and deploy your app

### Manual Deployment Steps

1. **Create a new Web Service** on Render.com
2. **Set Build Command**: `npm install`
3. **Set Start Command**: `node server.js`
4. **Add Environment Variables**:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `SESSION_SECRET=your-secret-key`
5. **Deploy** the service

### Custom Domain Setup

1. **Add your domain** in the Render dashboard
2. **Update DNS records** as instructed by Render
3. **Configure SSL** (automatically handled by Render)

## 📁 Project Structure

```
ntandostore-hosting/
├── public/                 # Frontend assets
│   ├── index.html         # Landing page
│   ├── dashboard.html     # User dashboard
│   ├── style.css          # Main stylesheet
│   ├── script.js          # Frontend JavaScript
│   └── dashboard.js       # Dashboard JavaScript
├── uploads/               # User uploaded files
├── deployed/              # Deployed websites
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── render.yaml            # Render.com configuration
├── .env.example           # Environment variables template
└── README.md              # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/auth-status` - Check authentication status

### File Management
- `POST /api/upload` - Upload files
- `GET /api/files` - Get user files
- `DELETE /api/files/:id` - Delete file

### Website Deployment
- `POST /api/deploy` - Deploy website
- `GET /api/websites` - Get deployed websites
- `DELETE /api/websites/:id` - Delete website

## 🎨 Frontend Features

### Landing Page
- Modern gradient design with animations
- Feature showcase
- Login form with validation
- Responsive design

### Dashboard
- File manager with drag-and-drop
- Website deployment interface
- Statistics and analytics
- Real-time updates

## 🔒 Security Features

- **Session Management**: Secure session handling with HTTP-only cookies
- **Rate Limiting**: Protection against brute force attacks
- **File Validation**: Secure file upload handling
- **CORS Protection**: Cross-origin resource sharing controls
- **Helmet.js**: Security headers and XSS protection
- **Input Validation**: Server-side validation for all inputs

## 📊 Supported File Types

The platform supports **all file types** for maximum flexibility:
- **Images**: JPG, PNG, GIF, SVG, WebP
- **Documents**: PDF, DOC, DOCX, TXT, MD
- **Videos**: MP4, AVI, MOV, WebM
- **Audio**: MP3, WAV, OGG
- **Archives**: ZIP, RAR, TAR, GZ
- **Code**: HTML, CSS, JS, JSON, XML
- **And many more...**

## 🌍 Custom Domain Support

### Setting Up Custom Domains

1. **Access your dashboard**
2. **Deploy a website** with custom domain
3. **Update DNS records**:
   ```
   Type: CNAME
   Name: your-domain.com
   Value: your-app.onrender.com
   ```
4. **Wait for SSL propagation** (usually 5-10 minutes)

### Subdomain Support

- Automatic subdomain creation: `your-site.ntandostore.onrender.com`
- Wildcard SSL certificate support
- Easy domain management

## 🚀 Performance Features

- **CDN Integration**: Global content delivery
- **File Compression**: Automatic GZIP compression
- **Caching**: Browser and server-side caching
- **Image Optimization**: Automatic image resizing
- **Lazy Loading**: Optimized content loading

## 📈 Monitoring & Analytics

- **Real-time Statistics**: File uploads, website deployments
- **Usage Tracking**: Storage usage, bandwidth monitoring
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Response times, uptime monitoring

## 🔧 Development

### Running Tests
```bash
npm test
```

### Code Formatting
```bash
npm run format
```

### Building for Production
```bash
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: support@ntandostore.com
- **Documentation**: [Full Documentation](https://docs.ntandostore.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/ntandostore-hosting/issues)

## 🎯 Roadmap

- [ ] Multi-user support with roles
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations
- [ ] Mobile app
- [ ] Team collaboration features
- [ ] Advanced security features
- [ ] Performance optimizations
- [ ] Global CDN integration

## 🙏 Acknowledgments

- Express.js framework
- SQLite database
- Multer for file uploads
- Render.com for hosting
- All contributors and users

---

**Ntandostore** - Deploy your ideas, instantly! 🚀