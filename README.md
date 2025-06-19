# Solana Metrics MCP Server

This MCP server analyzes Solana metrics from InfluxDB and generates Grafana dashboards. It's designed to work with the `sol_metrics` database and provides intelligent categorization and analysis of blockchain metrics.

## Features

- **🔍 Metric Discovery**: Lists all available metrics from the sol_metrics InfluxDB database
- **🏷️ Intelligent Categorization**: Automatically categorizes metrics into logical groups (Consensus, Network, Banking, Accounts, RPC, Performance, Jito/MEV)
- **📊 Metric Analysis**: Provides detailed explanations of what each metric measures and why it's useful
- **📁 Auto-Dashboard Export**: Creates and saves importable Grafana dashboard JSON files to `grafana/` folder
- **🔎 Code Search**: Helps locate metric definitions in the Tachyon Solana Rust codebase
- **🔄 Dual InfluxDB Support**: Compatible with both InfluxDB v1 and v2
- **🛠️ VS Code Integration**: Works seamlessly as an MCP server in Visual Studio Code

## Installation

```bash
npm install
npm run build
```

## Configuration

Set the following environment variables to connect to your InfluxDB instance:

```bash
export INFLUX_URL="http://your-influxdb-server:8086"
export INFLUX_TOKEN="your_token"
export INFLUX_ORG="your_org"
export INFLUX_BUCKET="sol_metrics"
export INFLUX_VERSION="v1"  # or "v2" for InfluxDB v2
```

## Dashboard Export

When you generate dashboards using the `generate_dashboard` tool, the server automatically:

1. **Saves JSON files** to the `grafana/` folder in your project directory
2. **Creates timestamped backups** for version history
3. **Provides ready-to-import** Grafana dashboard configurations

Generated dashboard files:
- `consensus-dashboard.json` - Epoch rewards, slot confirmation, validator voting
- `network-dashboard.json` - Gossip, cluster info, retransmit metrics
- `banking-dashboard.json` - Transaction processing, prioritization fees
- `accounts-dashboard.json` - Account database, cache, hashing metrics
- `rpc-dashboard.json` - RPC service and subscription metrics
- `performance-dashboard.json` - CPU, memory, disk usage metrics
- `jito-mev-dashboard.json` - Block engine, bundle processing, MEV relayer metrics

## Usage with Claude Desktop

Add this server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "solana-metrics": {
      "command": "node",
      "args": ["/absolute/path/to/solana-metrics-mcp-server/build/index.js"]
    }
  }
}
```

## Available Tools

### 1. `list_metrics`
Lists all available metrics from the sol_metrics database.

### 2. `analyze_metrics`
Analyzes and categorizes metrics with detailed explanations.
- Parameters:
  - `category` (optional): Filter by category (Consensus, Network, Banking, Accounts, RPC, Performance, Jito/MEV, Other, All)

### 3. `generate_dashboard`
Generates a Grafana dashboard JSON for selected metrics.
- Parameters:
  - `category`: Category to generate dashboard for
  - `dashboard_name`: Name for the generated dashboard

### 4. `search_rust_code`
Searches for metric definitions in the Tachyon Solana Rust codebase.
- Parameters:
  - `metric_name`: Name of the metric to search for

## Metric Categories

The server organizes metrics into the following categories based on Solana's architecture:

- **Consensus**: Validator voting, slots, epochs, leader schedules
- **Network**: Cluster topology, gossip, turbine, TPU/TVU, repairs
- **Banking**: Transaction processing, PoH recording, leader slot utilization
- **Accounts**: Account database operations, hashing, snapshots
- **RPC**: API request handling, subscriptions, WebSocket connections
- **Performance**: System resources, throughput benchmarks
- **Jito/MEV**: MEV tips, bundle processing, block engine metrics

## Development

```bash
# Development mode
npm run dev

# Build only
npm run build

# Start server
npm start
```

## Contributing

This server is designed specifically for Tachyon Solana metrics analysis. For questions or improvements, please refer to the Solana metrics documentation and Tachyon codebase.
