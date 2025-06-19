# How to Use the Solana Metrics MCP Server in VS Code

Since you don't have Claude Desktop, here are several ways to use and test this MCP server directly in VS Code:

## Method 1: Quick Test (Recommended)

Run the automated test to see all functionality:

```bash
npm test
```

This will:
- Build the server
- Start it automatically
- Test all 4 tools (list_metrics, analyze_metrics, generate_dashboard, search_rust_code)
- Show you sample outputs

## Method 2: Manual Testing with VS Code Terminal

1. **Start the server in one terminal:**
   ```bash
   npm run dev
   ```

2. **In another terminal, send JSON-RPC requests:**
   ```bash
   # List all available tools
   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node build/index.js
   
   # List all metrics
   echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_metrics","arguments":{}}}' | node build/index.js
   
   # Analyze consensus metrics
   echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"analyze_metrics","arguments":{"category":"Consensus"}}}' | node build/index.js
   ```

## Method 3: Use with MCP Inspector (Recommended for Development)

Install the MCP Inspector for a GUI interface:

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

This opens a web interface where you can:
- See all available tools
- Test each tool with a GUI
- View responses in a formatted way

## Method 4: Integration with Other MCP Clients

The server works with any MCP client. Some options:

1. **Python client** (if you prefer Python):
   ```python
   from mcp import Client, StdioServerTransport
   import subprocess
   
   # Start server and connect
   transport = StdioServerTransport(["node", "build/index.js"])
   client = Client("test-client")
   # ... use client
   ```

2. **Use with Continue.dev** (VS Code extension):
   - Install Continue.dev extension
   - Configure it to use your MCP server

## Method 5: Create Custom VS Code Extension

You could create a simple VS Code extension that:
- Connects to your MCP server
- Provides commands for each tool
- Shows results in VS Code panels

## Environment Setup

Before testing, set your InfluxDB credentials:

```bash
export INFLUX_URL="http://your-influxdb-server:8086"
export INFLUX_TOKEN="your_actual_token"
export INFLUX_BUCKET="sol_metrics"
```

Or create a `.env` file (copy from `.env.example`).

## What Each Tool Does

1. **`list_metrics`**: Lists all 1200+ metrics from your InfluxDB
2. **`analyze_metrics`**: Categorizes metrics by Solana components (Consensus, Network, Banking, etc.)
3. **`generate_dashboard`**: Creates Grafana dashboard JSON you can import
4. **`search_rust_code`**: Helps find where metrics are defined in Tachyon Solana code

## Sample Workflow

1. **Discover metrics**: `npm test` to see what's available
2. **Analyze by category**: Focus on specific Solana components
3. **Generate dashboards**: Create Grafana dashboards for monitoring
4. **Understand code**: Find where metrics are implemented

## Troubleshooting

- **Connection issues**: Check InfluxDB credentials and network access
- **Build errors**: Run `npm run build` to see TypeScript issues
- **Server not responding**: Try restarting with `npm run dev`

## Next Steps

Once you've tested the server, you can:
- Integrate it with your preferred MCP client
- Customize the metric categorization
- Add more Grafana dashboard templates
- Create automation scripts for regular metric analysis
