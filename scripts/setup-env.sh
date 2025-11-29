#!/bin/bash

# Environment Setup Script
# This script helps set up environment variables

echo "🚀 Nigerian Real Estate Platform - Environment Setup"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Frontend .env
echo -e "${YELLOW}Setting up frontend environment...${NC}"
cat > frontend/.env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=${SUPABASE_URL:-https://your-project.supabase.co}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-your-anon-key-here}

# Backend API URL
VITE_API_URL=${VITE_API_URL:-http://localhost:5000}
EOF
echo -e "${GREEN}✓ Frontend .env created${NC}"

# Backend .env
echo -e "${YELLOW}Setting up backend environment...${NC}"
cat > backend/.env << EOF
# Server Configuration
PORT=${PORT:-5000}
NODE_ENV=${NODE_ENV:-development}

# Frontend URL
FRONTEND_URL=${FRONTEND_URL:-http://localhost:5173}

# Supabase Configuration
SUPABASE_URL=${SUPABASE_URL:-https://your-project.supabase.co}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-your-anon-key-here}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-your-service-role-key-here}

# Paystack Configuration
PAYSTACK_SECRET_KEY=${PAYSTACK_SECRET_KEY:-sk_test_your-secret-key}
PAYSTACK_PUBLIC_KEY=${PAYSTACK_PUBLIC_KEY:-pk_test_your-public-key}

# Email Configuration
SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}
SMTP_PORT=${SMTP_PORT:-587}
SMTP_SECURE=${SMTP_SECURE:-false}
SMTP_USER=${SMTP_USER:-your-email@gmail.com}
SMTP_PASS=${SMTP_PASS:-your-app-password}
SMTP_FROM=${SMTP_FROM:-your-email@gmail.com}

# Twilio Configuration (Optional)
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID:-}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN:-}
TWILIO_VERIFY_SERVICE_SID=${TWILIO_VERIFY_SERVICE_SID:-}

# CORS Configuration
CORS_ORIGIN=${CORS_ORIGIN:-http://localhost:5173}
EOF
echo -e "${GREEN}✓ Backend .env created${NC}"

echo ""
echo -e "${GREEN}✅ Environment files created!${NC}"
echo ""
echo "Next steps:"
echo "1. Update the values in frontend/.env and backend/.env"
echo "2. Run database SQL scripts in Supabase"
echo "3. Configure Paystack webhook"
echo ""

