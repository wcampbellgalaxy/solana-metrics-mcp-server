# Copilot Instructions for Solana Metrics MCP Server

This project is a Model Context Protocol (MCP) server specifically designed for analyzing Solana blockchain metrics from InfluxDB and generating Grafana dashboards.

## Project Overview

The server connects to a `sol_metrics` InfluxDB database containing 1200+ metrics from Tachyon Solana nodes and provides:

1. **Metric Discovery & Analysis**: Categorizes and explains Solana metrics
2. **Grafana Dashboard Generation**: Creates importable dashboard JSON files
3. **Code Context**: Links metrics to their Rust code definitions in Tachyon Solana

## Key Components

- **MCP SDK**: Uses @modelcontextprotocol/sdk for server implementation
- **InfluxDB Integration**: Connects to metrics database using @influxdata/influxdb-client
- **Metric Categorization**: Organizes metrics by Solana architecture components
- **Dashboard Templates**: Generates Grafana-compatible JSON configurations

## Metric Categories

The server categorizes metrics based on Solana's architecture:
- Consensus: voting, slots, epochs
- Network: gossip, turbine, cluster topology
- Banking: transaction processing, PoH
- Accounts: database operations, snapshots
- RPC: API handling, subscriptions
- Performance: system resources, benchmarks
- Jito/MEV: tip distribution, bundle processing

## Development Guidelines

1. Follow TypeScript best practices with strict typing
2. Use the MCP SDK patterns for tool implementation
3. Maintain metric categorization accuracy based on Solana documentation
4. Ensure Grafana dashboard compatibility
5. Reference Tachyon Solana codebase for metric explanations

## SDK Reference

- MCP Documentation: https://github.com/modelcontextprotocol/create-python-server
- This project uses the TypeScript/Node.js implementation

## Testing

Test the server by connecting it to Claude Desktop or other MCP clients and verifying:
- Metric listing functionality
- Category-based analysis
- Dashboard JSON generation
- Code search capabilities
