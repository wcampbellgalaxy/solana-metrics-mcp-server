# Grafana Dashboards

This directory contains auto-generated Grafana dashboard JSON files created by the Solana Metrics MCP Server.

## Dashboard Categories

The MCP server generates dashboards for different metric categories:

- **`consensus-dashboard.json`** - Epoch rewards, slot confirmation, validator voting metrics
- **`network-dashboard.json`** - Gossip, cluster info, retransmit, and network topology metrics  
- **`banking-dashboard.json`** - Transaction processing, prioritization fees, and banking stage metrics
- **`accounts-dashboard.json`** - Account database, cache, hashing, and storage metrics
- **`rpc-dashboard.json`** - RPC service, subscriptions, and client interaction metrics
- **`performance-dashboard.json`** - CPU, memory, disk usage, and system performance metrics
- **`jito-mev-dashboard.json`** - Block engine, bundle processing, and MEV relayer metrics

## Usage

1. **Generate dashboards** using the MCP server tools:
   ```bash
   ./vs-code-usage.sh dashboard
   ```

2. **Import to Grafana**:
   - Copy the JSON content from the desired dashboard file
   - In Grafana, go to "+" → "Import"
   - Paste the JSON and configure your InfluxDB data source

3. **Customize**: Edit the generated JSON files to adjust:
   - Time ranges
   - Refresh intervals  
   - Panel layouts
   - Alert thresholds

## Data Source Configuration

Ensure your Grafana InfluxDB data source is configured with:
- **URL**: Your InfluxDB server endpoint
- **Database**: `sol_metrics` (for InfluxDB v1) or appropriate bucket (for InfluxDB v2)
- **Authentication**: Appropriate credentials

## Auto-Generation

These dashboard files are automatically updated when the MCP server generates new dashboards. The server saves dashboards with timestamps to track changes over time.
