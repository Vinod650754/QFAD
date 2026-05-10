#!/bin/bash

# API Integration Verification Script
# This script tests all critical endpoints to ensure deployment works correctly

BACKEND_URL="${1:-https://qfad.onrender.com}"
ML_URL="${2:-https://qfad-ml.onrender.com}"

echo "🔍 API Integration Verification"
echo "================================"
echo "Backend: $BACKEND_URL"
echo "ML Service: $ML_URL"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Backend Health
echo "Testing Backend Health Endpoints..."
echo "1. GET /"
response=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/)
if [ $response -eq 200 ]; then
  echo -e "${GREEN}✓ Backend root endpoint working${NC}"
else
  echo -e "${RED}✗ Backend root endpoint failed (HTTP $response)${NC}"
fi

echo "2. GET /health"
response=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/health)
if [ $response -eq 200 ]; then
  echo -e "${GREEN}✓ Backend health endpoint working${NC}"
else
  echo -e "${RED}✗ Backend health endpoint failed (HTTP $response)${NC}"
fi

# Test ML Service Health
echo ""
echo "Testing ML Service Health Endpoints..."
echo "1. GET /health"
response=$(curl -s -o /dev/null -w "%{http_code}" $ML_URL/health)
if [ $response -eq 200 ]; then
  echo -e "${GREEN}✓ ML service health endpoint working${NC}"
else
  echo -e "${RED}✗ ML service health endpoint failed (HTTP $response)${NC}"
fi

# Test Auth Signup
echo ""
echo "Testing Auth Endpoints..."
echo "1. POST /api/auth/signup"
TEST_EMAIL="test_$(date +%s)@example.com"
response=$(curl -s -X POST $BACKEND_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$TEST_EMAIL\",\"password\":\"testpass123\"}" \
  -o /dev/null -w "%{http_code}")
if [ $response -eq 201 ]; then
  echo -e "${GREEN}✓ Signup endpoint working${NC}"
  TOKEN_JSON=$(curl -s -X POST $BACKEND_URL/api/auth/signup \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test User\",\"email\":\"$TEST_EMAIL\",\"password\":\"testpass123\"}")
  TOKEN=$(echo $TOKEN_JSON | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "  Token obtained: ${TOKEN:0:20}..."
elif [ $response -eq 409 ]; then
  echo -e "${YELLOW}⚠ Signup returned 409 (user might exist)${NC}"
else
  echo -e "${RED}✗ Signup endpoint failed (HTTP $response)${NC}"
fi

# Test Auth Login
echo "2. POST /api/auth/login"
response=$(curl -s -X POST $BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"testpass123\"}" \
  -o /dev/null -w "%{http_code}")
if [ $response -eq 200 ] || [ $response -eq 201 ]; then
  echo -e "${GREEN}✓ Login endpoint working${NC}"
else
  echo -e "${RED}✗ Login endpoint failed (HTTP $response)${NC}"
fi

# Test Protected Route
echo "3. GET /api/auth/me (protected)"
if [ ! -z "$TOKEN" ]; then
  response=$(curl -s -X GET $BACKEND_URL/api/auth/me \
    -H "Authorization: Bearer $TOKEN" \
    -o /dev/null -w "%{http_code}")
  if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Protected auth endpoint working${NC}"
  else
    echo -e "${RED}✗ Protected auth endpoint failed (HTTP $response)${NC}"
  fi
else
  echo -e "${YELLOW}⚠ Skipped (no token available)${NC}"
fi

# Summary
echo ""
echo "================================"
echo "✓ Verification complete"
echo "If all endpoints show green, deployment is working correctly."
echo "If any endpoints show red, check:"
echo "  1. Render backend is running"
echo "  2. Render ML service is running"
echo "  3. MongoDB Atlas is accessible"
echo "  4. Environment variables are set correctly"
