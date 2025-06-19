# Generated Solana Grafana Dashboards

This directory contains auto-generated Grafana dashboard JSON files created from real Solana metrics.

## Generated Dashboards (June 19, 2025)

### 🔧 **Consensus Dashboard** (`consensus-dashboard.json`)
- **8 panels** covering epoch rewards, banking operations, and slot confirmation
- Metrics: `bank-get_epoch_accounts_hash_to_serialize`, `epoch_rewards`, `duplicate_confirmed_slot`, etc.
- **Focus**: Validator consensus mechanisms and epoch management

### 🏦 **Banking Stage Dashboard** (`banking-dashboard.json`) 
- **20 panels** covering transaction processing and prioritization
- Metrics: `banking_stage-leader_prioritization_fees_info`, `banking_stage-loop-stats`, etc.
- **Focus**: Transaction throughput, leader scheduling, and fee processing

### 🌐 **Network Dashboard** (`network-dashboard.json`)
- **20 panels** covering gossip, shreds, and cluster communication  
- Metrics: `Gossip`, `cluster_nodes_broadcast`, `quic_streamer_tpu`, etc.
- **Focus**: Network topology, data propagation, and peer connectivity

### 💰 **Jito/MEV Dashboard** (`jito-mev-dashboard.json`)
- **10 panels** covering block engine and MEV relayer operations
- Metrics: `block_engine_stage-stats`, `bundle_stage-loop_stats`, etc.
- **Focus**: MEV extraction, block building, and bundle processing

### 📊 **RPC Service Dashboard** (`rpc-dashboard.json`)
- **2 panels** covering RPC subscriptions and client interactions
- Metrics: `rpc_subscriptions`, `rpc_subscriptions_recent_items`
- **Focus**: API service health and client connection monitoring

### ⚡ **Performance Dashboard** (`performance-dashboard.json`)
- **0 panels** (category needs refinement for system metrics)
- **Note**: System performance metrics may need different categorization

## Import Instructions

1. **Copy dashboard JSON** from any of the `*-dashboard.json` files
2. **In Grafana**: Go to "+" → "Import" 
3. **Paste JSON** and configure your InfluxDB data source
4. **Configure data source**: Set to your InfluxDB v1 instance with `sol_metrics` database

## Dashboard Features

- **Time Range**: Last 1 hour by default
- **Refresh**: 30 second auto-refresh
- **Panel Type**: Stat panels showing current values
- **Aggregation**: 1-minute mean averages
- **Layout**: 2-column grid layout (12-unit width each)

## Data Source Configuration

Ensure your Grafana InfluxDB data source has:
```
URL: http://your-influxdb-server:8086
Database: sol_metrics
User: [your-username]
Password: [your-password]
```

## Real Metrics Coverage

Generated from **231 actual Solana metrics** including:
- Consensus and epoch management
- Transaction processing pipeline  
- Network gossip and data propagation
- MEV/Jito block building operations
- RPC service monitoring
- Account database operations
- Performance and system metrics

These dashboards provide comprehensive monitoring for Solana validator operations and network health.
