#!/bin/bash

# Test script for authentication protection
# This script tests that POST, PATCH, DELETE routes require authentication
# while GET routes and login remain public

API_URL="http://localhost:3000"

echo "=== Authentication Protection Test ==="
echo ""

# Start API server in background
echo "Starting API server..."
cd /home/renew/Development/VsgKugelbergProjects/vsgkugelberg/apps/api
pnpm dev > /tmp/api-server.log 2>&1 &
API_PID=$!
sleep 5

# Test 1: GET routes should work without authentication
echo "Test 1: GET /health (should work without auth)"
curl -s -w "\nHTTP Status: %{http_code}\n" $API_URL/health
echo ""

echo "Test 2: GET /posts (should work without auth)"
curl -s -w "\nHTTP Status: %{http_code}\n" $API_URL/posts
echo ""

# Test 3: POST without auth should fail with 401
echo "Test 3: POST /posts without auth (should return 401)"
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  $API_URL/posts
echo ""

# Test 4: Login should work without auth (public route)
echo "Test 4: POST /auth/login (should work without auth)"
RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"testpass"}' \
  -w "\n%{http_code}" \
  -c /tmp/cookies.txt \
  $API_URL/auth/login)
echo "$RESPONSE"
echo ""

# Test 5: Extract token from login response and test authenticated request
echo "Test 5: Attempting to get JWT token from login..."
# Note: This would require a valid user in the database
echo "Skipping authenticated POST test (requires valid user setup)"
echo ""

# Cleanup
echo "Stopping API server..."
kill $API_PID 2>/dev/null
rm -f /tmp/cookies.txt /tmp/api-server.log

echo "=== Tests Complete ==="
