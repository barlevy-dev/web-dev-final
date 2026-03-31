#!/bin/bash

# StudyGram Phase 1 Verification Script
# This script verifies that Phase 1 setup is complete and working

echo "🔍 StudyGram Phase 1 Verification"
echo "=================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Function to print test result
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

echo "📦 Test 1: Project Structure"
echo "----------------------------"
test -d "backend" && test -d "frontend"
test_result $? "Backend and frontend directories exist"

test -d "certs" && test -d "scripts"
test_result $? "Certs and scripts directories exist"

test -f "README.md"
test_result $? "Root README.md exists"

test -f "backend/README.md"
test_result $? "Backend README.md exists"

test -f "frontend/README.md"
test_result $? "Frontend README.md exists"

test -f ".gitignore"
test_result $? "Root .gitignore exists"

echo ""
echo "🔐 Test 2: HTTPS Certificates"
echo "----------------------------"
test -f "certs/server.key"
test_result $? "SSL private key exists"

test -f "certs/server.crt"
test_result $? "SSL certificate exists"

echo ""
echo "⚙️  Test 3: Backend Configuration"
echo "----------------------------"
test -f "backend/package.json"
test_result $? "package.json exists"

test -f "backend/tsconfig.json"
test_result $? "tsconfig.json exists"

test -f "backend/jest.config.js"
test_result $? "jest.config.js exists"

test -f "backend/nodemon.json"
test_result $? "nodemon.json exists"

test -f "backend/.env.example"
test_result $? ".env.example exists"

test -f "backend/.eslintrc.json"
test_result $? ".eslintrc.json exists"

test -f "backend/.prettierrc.json"
test_result $? ".prettierrc.json exists"

echo ""
echo "📂 Test 4: Backend Source Structure"
echo "----------------------------"
test -d "backend/src"
test_result $? "src directory exists"

test -f "backend/src/app.ts"
test_result $? "app.ts exists"

test -f "backend/src/server.ts"
test_result $? "server.ts exists"

test -d "backend/src/config"
test_result $? "config directory exists"

test -f "backend/src/config/database.ts"
test_result $? "database.ts exists"

test -f "backend/src/config/swagger.ts"
test_result $? "swagger.ts exists"

test -d "backend/src/models"
test_result $? "models directory exists"

test -d "backend/src/routes"
test_result $? "routes directory exists"

test -d "backend/src/services"
test_result $? "services directory exists"

test -d "backend/src/controllers"
test_result $? "controllers directory exists"

test -d "backend/src/middleware"
test_result $? "middleware directory exists"

test -d "backend/src/types"
test_result $? "types directory exists"

test -d "backend/src/utils"
test_result $? "utils directory exists"

test -d "backend/src/tests"
test_result $? "tests directory exists"

echo ""
echo "📦 Test 5: Dependencies"
echo "----------------------------"
test -d "backend/node_modules"
test_result $? "node_modules exists"

test -f "backend/package-lock.json"
test_result $? "package-lock.json exists"

echo ""
echo "🔨 Test 6: TypeScript Build"
echo "----------------------------"
cd backend
if npm run build > /dev/null 2>&1; then
    test_result 0 "TypeScript builds successfully"
else
    test_result 1 "TypeScript build failed"
fi

test -d "dist"
test_result $? "dist directory created"

test -f "dist/app.js"
test_result $? "app.js compiled"

test -f "dist/server.js"
test_result $? "server.js compiled"

test -d "dist/config"
test_result $? "config directory compiled"

cd ..

echo ""
echo "📁 Test 7: Upload Directories"
echo "----------------------------"
test -d "backend/uploads"
test_result $? "uploads directory exists"

test -d "backend/uploads/profiles"
test_result $? "uploads/profiles directory exists"

test -d "backend/uploads/posts"
test_result $? "uploads/posts directory exists"

echo ""
echo "=================================="
echo "📊 RESULTS"
echo "=================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Phase 1 is complete and ready to commit.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review PHASE1_VERIFICATION.md for detailed verification"
    echo "  2. Optionally test the server (requires MongoDB):"
    echo "     cd backend && npm run dev"
    echo "  3. Commit Phase 1 when ready"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the errors above.${NC}"
    echo ""
    echo "For troubleshooting, see: PHASE1_VERIFICATION.md"
    exit 1
fi
