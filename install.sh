#!/bin/bash

# Ntandostore Hosting Platform Installation Script

echo "🚀 Installing Ntandostore Hosting Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18.0 or higher."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 18.0 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads
mkdir -p deployed
mkdir -p logs

echo "✅ Directories created"

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating environment file..."
    cp .env.example .env
    
    # Generate a random session secret
    SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || date +%s | sha256sum | base64 | head -c 32)
    
    if [ "$SESSION_SECRET" != "" ]; then
        sed -i.bak "s/your-super-secret-session-key-change-this-in-production/$SESSION_SECRET/" .env
        rm .env.bak
    fi
    
    echo "✅ Environment file created"
else
    echo "ℹ️  Environment file already exists"
fi

# Set file permissions
echo "🔒 Setting file permissions..."
chmod +x install.sh
chmod 755 server.js

echo "✅ File permissions set"

# Check if Git is initialized
if [ ! -d .git ]; then
    echo "🔧 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: Ntandostore Hosting Platform"
    echo "✅ Git repository initialized"
fi

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Review and update the .env file if needed"
echo "2. Start the application: npm start"
echo "3. Open your browser and navigate to http://localhost:3000"
echo "4. Login with:"
echo "   Username: Ntando"
echo "   Password: Ntando"
echo ""
echo "🌐 For Render.com deployment:"
echo "1. Push your code to GitHub"
echo "2. Create a new Web Service on Render.com"
echo "3. Use the provided render.yaml configuration"
echo ""
echo "📚 For more information, see README.md"
echo ""
echo "🚀 Ntandostore - Deploy your ideas, instantly!"