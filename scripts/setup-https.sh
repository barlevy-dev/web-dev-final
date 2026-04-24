#!/bin/bash

# StudyGram HTTPS Setup Script
# Generates self-signed SSL certificates for localhost development

echo "🔐 Setting up HTTPS certificates for StudyGram..."
echo ""

# Create certs directory if it doesn't exist
mkdir -p certs

# Check if certificates already exist
if [ -f "certs/server.key" ] && [ -f "certs/server.crt" ]; then
    echo "⚠️  Certificates already exist in certs/ directory"
    read -p "Do you want to regenerate them? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled. Using existing certificates."
        exit 0
    fi
    echo "🗑️  Removing old certificates..."
    rm -f certs/server.key certs/server.crt
fi

echo "📝 Generating self-signed SSL certificate..."
echo ""

# Generate self-signed certificate
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout certs/server.key \
  -out certs/server.crt \
  -days 365 \
  -subj "/C=IL/ST=Israel/L=Tel-Aviv/O=StudyGram/OU=Development/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

# Check if generation was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSL certificates generated successfully!"
    echo ""
    echo "📁 Certificate location:"
    echo "   Private Key: $(pwd)/certs/server.key"
    echo "   Certificate: $(pwd)/certs/server.crt"
    echo ""
    echo "⏰ Certificate valid for: 365 days"
    echo ""
    echo "🔔 Important Notes:"
    echo "   1. Your browser will show a security warning because this is a self-signed certificate"
    echo "   2. Click 'Advanced' and 'Proceed to localhost' to accept the certificate"
    echo "   3. This is normal for local development and safe to ignore"
    echo ""
    echo "🚀 You can now run:"
    echo "   cd backend && npm run dev     # Start backend server"
    echo "   cd frontend && npm run dev    # Start frontend server"
    echo ""
else
    echo ""
    echo "❌ Failed to generate certificates"
    echo "   Make sure OpenSSL is installed: brew install openssl (macOS) or apt-get install openssl (Linux)"
    exit 1
fi
