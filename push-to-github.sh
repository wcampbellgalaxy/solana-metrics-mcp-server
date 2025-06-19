#!/bin/bash

# Script to push the Solana Metrics MCP Server to GitHub
# Usage: ./push-to-github.sh [repository-url]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Pushing Solana Metrics MCP Server to GitHub${NC}"

# Check if repository URL is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Please provide the GitHub repository URL${NC}"
    echo "Example: ./push-to-github.sh https://github.com/yourusername/solana-metrics-mcp-server.git"
    exit 1
fi

REPO_URL="$1"

echo -e "${BLUE}📝 Repository URL: $REPO_URL${NC}"

# Verify we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "src/index.ts" ]; then
    echo -e "${RED}❌ Error: This doesn't appear to be the Solana Metrics MCP Server directory${NC}"
    exit 1
fi

# Check git status
echo -e "${BLUE}🔍 Checking git status...${NC}"
git status

# Add remote origin
echo -e "${BLUE}📡 Adding remote origin...${NC}"
git remote add origin "$REPO_URL" || echo "Remote origin already exists"

# Push to GitHub
echo -e "${BLUE}⬆️  Pushing to GitHub...${NC}"
git push -u origin main

echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
echo -e "${GREEN}🎉 Your Solana Metrics MCP Server is now available at: $REPO_URL${NC}"

# Display next steps
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Visit your GitHub repository: $REPO_URL"
echo "2. Add a description and topics to your repository"
echo "3. Create a release if desired"
echo "4. Share the repository URL with your team"
echo "5. Consider adding GitHub Actions for CI/CD"

echo -e "${GREEN}🔗 Quick links:${NC}"
echo "- Repository: $REPO_URL"
echo "- Clone command: git clone $REPO_URL"
echo "- Setup instructions: See README.md in the repository"
