#!/bin/bash

# Solana Metrics MCP Server - VS Code Usage Script
# This script helps you interact with the MCP server directly

set -e

echo "🎯 Solana Metrics MCP Server - VS Code Usage Guide"
echo "================================================="
echo ""

# Check if server is built
if [ ! -f "build/index.js" ]; then
    echo "Building server..."
    npm run build
fi

echo "📋 Available Commands:"
echo "1. test       - Run all tests"
echo "2. start      - Start the server interactively"
echo "3. metrics    - List all metrics"
echo "4. analyze    - Analyze metrics by category"
echo "5. dashboard  - Generate Grafana dashboard"
echo "6. search     - Search for metric in Rust code"
echo "7. inspector  - Open MCP Inspector (web GUI)"
echo ""

if [ $# -eq 0 ]; then
    echo "Usage: ./vs-code-usage.sh [command]"
    echo "Example: ./vs-code-usage.sh test"
    exit 1
fi

case $1 in
    "test")
        echo "🧪 Running comprehensive tests..."
        npm test
        ;;
    
    "start")
        echo "🚀 Starting MCP server in interactive mode..."
        echo "Send JSON-RPC requests to stdin, or press Ctrl+C to exit"
        node build/index.js
        ;;
    
    "metrics")
        echo "📊 Listing all metrics..."
        echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"cli","version":"1.0"}}}' | node build/index.js > /dev/null
        echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_metrics","arguments":{}}}' | node build/index.js | tail -n 1 | jq -r '.result.content[0].text'
        ;;
    
    "analyze")
        CATEGORY=${2:-"Consensus"}
        echo "🔍 Analyzing $CATEGORY metrics..."
        echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"cli","version":"1.0"}}}' | node build/index.js > /dev/null
        echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"analyze_metrics","arguments":{"category":"'$CATEGORY'"}}}' | node build/index.js | tail -n 1 | jq -r '.result.content[0].text'
        ;;
    
    "dashboard")
        CATEGORY=${2:-"Consensus"}
        NAME=${3:-"Solana Dashboard"}
        echo "📈 Generating Grafana dashboard for $CATEGORY..."
        echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"cli","version":"1.0"}}}' | node build/index.js > /dev/null
        echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"generate_dashboard","arguments":{"category":"'$CATEGORY'","dashboard_name":"'$NAME'"}}}' | node build/index.js | tail -n 1 | jq -r '.result.content[0].text'
        ;;
    
    "search")
        METRIC=${2:-"cluster_nodes_broadcast"}
        echo "🔎 Searching for metric: $METRIC"
        echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"cli","version":"1.0"}}}' | node build/index.js > /dev/null
        echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_rust_code","arguments":{"metric_name":"'$METRIC'"}}}' | node build/index.js | tail -n 1 | jq -r '.result.content[0].text'
        ;;
    
    "inspector")
        echo "🌐 Opening MCP Inspector..."
        echo "This will open a web interface for testing the MCP server"
        if command -v npx &> /dev/null; then
            npx @modelcontextprotocol/inspector node build/index.js
        else
            echo "❌ npx not found. Install Node.js or run: npm install -g @modelcontextprotocol/inspector"
        fi
        ;;
    
    *)
        echo "❌ Unknown command: $1"
        echo "Available commands: test, start, metrics, analyze, dashboard, search, inspector"
        exit 1
        ;;
esac
