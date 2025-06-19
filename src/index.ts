#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  Tool,
  TextContent,
  CallToolResult
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import fs from 'fs';
import path from 'path';

// Get the directory where this script is located
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Server configuration
const server = new Server({
  name: "solana-metrics-mcp-server",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

// InfluxDB configuration
const INFLUX_URL = process.env.INFLUX_URL || 'http://your-influxdb-server:8086';
const INFLUX_TOKEN = process.env.INFLUX_TOKEN || 'your_influxdb_token';
const INFLUX_ORG = process.env.INFLUX_ORG || '';
const INFLUX_BUCKET = process.env.INFLUX_BUCKET || 'sol_metrics';

// Note: This server supports both InfluxDB v1 and v2
// For v1, we'll use direct HTTP queries; for v2, we'll use the client library
const INFLUX_VERSION = process.env.INFLUX_VERSION || 'v1'; // default to v1

// Initialize InfluxDB client (for v2)
const influxDB = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
const queryApi = influxDB.getQueryApi(INFLUX_ORG);

// Metric categories based on Solana architecture
const METRIC_CATEGORIES = {
  'Consensus': [
    'validator_vote',
    'validator_skip_rate',
    'slot_height',
    'root_slot',
    'confirmed_slot',
    'finalized_slot',
    'epoch',
    'leader_schedule'
  ],
  'Network': [
    'cluster_nodes',
    'gossip',
    'turbine',
    'tpu',
    'tvu',
    'repair',
    'shred',
    'retransmit'
  ],
  'Banking': [
    'banking_stage',
    'transaction',
    'poh_recorder',
    'leader_slot_utilization',
    'vote_transaction'
  ],
  'Accounts': [
    'accounts_db',
    'accounts_hash',
    'cache_hash_data',
    'snapshot',
    'accounts_background_service'
  ],
  'RPC': [
    'rpc_service',
    'rpc_subscriptions',
    'jsonrpc'
  ],
  'Performance': [
    'cpu_usage',
    'memory_usage',
    'disk_usage',
    'network_io',
    'bench_tps'
  ],
  'Jito/MEV': [
    'tip_distributor',
    'mev_tips',
    'bundle',
    'block_engine'
  ]
};

// Grafana dashboard template
interface GrafanaPanel {
  id: number;
  title: string;
  type: string;
  targets: Array<{
    expr?: string;
    query?: string;
    datasource: string;
  }>;
  fieldConfig: {
    defaults: {
      unit: string;
      displayName?: string;
    };
  };
  gridPos: {
    h: number;
    w: number;
    x: number;
    y: number;
  };
}

interface GrafanaDashboard {
  dashboard: {
    id: null;
    title: string;
    tags: string[];
    timezone: string;
    panels: GrafanaPanel[];
    time: {
      from: string;
      to: string;
    };
    refresh: string;
    schemaVersion: number;
    version: 0;
  };
  folderId: null;
  overwrite: boolean;
}

// Helper functions
// Function to save dashboard JSON to file
async function saveDashboardToFile(dashboard: GrafanaDashboard, category: string): Promise<string> {
  try {
    // Create grafana directory if it doesn't exist
    const grafanaDir = path.join(__dirname, '..', 'grafana');
    if (!fs.existsSync(grafanaDir)) {
      fs.mkdirSync(grafanaDir, { recursive: true });
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const categoryName = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `${categoryName}-dashboard.json`;
    const timestampedFilename = `${categoryName}-dashboard-${timestamp}.json`;
    
    const filePath = path.join(grafanaDir, filename);
    const timestampedFilePath = path.join(grafanaDir, timestampedFilename);

    // Save both current and timestamped versions
    const jsonContent = JSON.stringify(dashboard, null, 2);
    
    fs.writeFileSync(filePath, jsonContent, 'utf8');
    fs.writeFileSync(timestampedFilePath, jsonContent, 'utf8');

    return filePath;
  } catch (error) {
    console.error('Error saving dashboard to file:', error);
    throw error;
  }
}

//existing code...

// Helper function to query InfluxDB v1
async function queryInfluxV1(query: string, database: string = INFLUX_BUCKET): Promise<any> {
  try {
    const url = new URL('/query', INFLUX_URL);
    url.searchParams.append('q', query);
    if (database) {
      url.searchParams.append('db', database);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('InfluxDB v1 query error:', error);
    throw error;
  }
}

async function getMetricsList(): Promise<string[]> {
  try {
    if (INFLUX_VERSION === 'v1') {
      // Use InfluxDB v1 API
      const result = await queryInfluxV1('SHOW MEASUREMENTS');
      const measurements: string[] = [];
      
      if (result.results && result.results[0] && result.results[0].series) {
        const series = result.results[0].series[0];
        if (series && series.values) {
          measurements.push(...series.values.map((v: any[]) => v[0]));
        }
      }
      
      return measurements;
    } else {
      // Use InfluxDB v2 API
      const query = `
        import "influxdata/influxdb/schema"
        schema.measurements(bucket: "${INFLUX_BUCKET}")
      `;
      
      const metrics: string[] = [];
      await queryApi.queryRows(query, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          if (o._value && typeof o._value === 'string') {
            metrics.push(o._value);
          }
        },
        error(error) {
          console.error('Error querying metrics:', error);
        },
        complete() {
          console.log('Metrics query completed');
        },
      });
      
      return metrics;
    }
  } catch (error) {
    console.error('Error querying metrics:', error);
    return [];
  }
}

async function getMetricDetails(metricName: string): Promise<any> {
  try {
    if (INFLUX_VERSION === 'v1') {
      // Use InfluxDB v1 API - get recent data and field info
      const queries = [
        `SELECT * FROM "${metricName}" ORDER BY time DESC LIMIT 1`,
        `SHOW FIELD KEYS FROM "${metricName}"`,
        `SHOW TAG KEYS FROM "${metricName}"`
      ];
      
      const details: any = { measurement: metricName };
      
      for (const query of queries) {
        try {
          const result = await queryInfluxV1(query);
          if (result.results && result.results[0]) {
            const res = result.results[0];
            if (res.series && res.series[0]) {
              const series = res.series[0];
              if (query.includes('FIELD KEYS')) {
                details.fields = series.values?.map((v: any[]) => ({ name: v[0], type: v[1] })) || [];
              } else if (query.includes('TAG KEYS')) {
                details.tags = series.values?.map((v: any[]) => v[0]) || [];
              } else if (query.includes('SELECT')) {
                details.columns = series.columns || [];
                details.recent_values = series.values?.[0] || [];
              }
            }
          }
        } catch (err) {
          console.log(`Query failed for ${metricName}: ${query}`, err);
        }
      }
      
      return details;
    } else {
      // Use InfluxDB v2 API
      const query = `
        from(bucket: "${INFLUX_BUCKET}")
          |> range(start: -1h)
          |> filter(fn: (r) => r._measurement == "${metricName}")
          |> limit(n: 1)
          |> yield()
      `;
      
      const details: any = {};
      await queryApi.queryRows(query, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          Object.keys(o).forEach(key => {
            if (key.startsWith('_') || key === 'table' || key === 'result') return;
            details[key] = o[key];
          });
        },
        error(error) {
          console.error(`Error querying metric ${metricName}:`, error);
        },
        complete() {
          console.log(`Metric ${metricName} details query completed`);
        },
      });
      
      return details;
    }
  } catch (error) {
    console.error(`Failed to get details for metric ${metricName}:`, error);
    return {};
  }
}

function categorizeMetric(metricName: string): string {
  for (const [category, keywords] of Object.entries(METRIC_CATEGORIES)) {
    if (keywords.some(keyword => metricName.toLowerCase().includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  return 'Other';
}

function explainMetric(metricName: string): { explanation: string; usefulness: string; category: string } {
  const category = categorizeMetric(metricName);
  
  // Detailed explanations based on Solana documentation and code analysis
  const explanations: { [key: string]: { explanation: string; usefulness: string } } = {
    // Consensus metrics
    'validator_vote': {
      explanation: 'Tracks validator voting activity including vote transactions, vote credits, and voting latency',
      usefulness: 'Critical for monitoring validator participation in consensus and earning rewards'
    },
    'slot_height': {
      explanation: 'Current slot height processed by the validator',
      usefulness: 'Essential for tracking blockchain progress and identifying sync issues'
    },
    'root_slot': {
      explanation: 'The most recent rooted slot that has been confirmed by supermajority',
      usefulness: 'Indicates finality and helps identify potential forks or consensus issues'
    },
    'confirmed_slot': {
      explanation: 'Slots that have been confirmed but not yet rooted',
      usefulness: 'Shows transaction confirmation progress and helps detect confirmation delays'
    },
    'epoch': {
      explanation: 'Current epoch number and epoch progress',
      usefulness: 'Important for understanding reward cycles, leader schedules, and stake account changes'
    },
    
    // Network metrics
    'cluster_nodes': {
      explanation: 'Information about cluster topology including node connections and gossip participation',
      usefulness: 'Essential for monitoring network health and identifying connectivity issues'
    },
    'gossip': {
      explanation: 'Gossip protocol metrics including message rates, peer connections, and data propagation',
      usefulness: 'Critical for network health monitoring and identifying gossip-related performance issues'
    },
    'turbine': {
      explanation: 'Turbine block propagation metrics including shred transmission and reception rates',
      usefulness: 'Key for monitoring block propagation efficiency and network performance'
    },
    'shred': {
      explanation: 'Shred-related metrics including creation, transmission, and verification statistics',
      usefulness: 'Important for block propagation monitoring and identifying data transmission issues'
    },
    
    // Banking metrics
    'banking_stage': {
      explanation: 'Transaction processing metrics from the banking stage including throughput and latency',
      usefulness: 'Critical for monitoring transaction processing performance and identifying bottlenecks'
    },
    'poh_recorder': {
      explanation: 'Proof of History recording metrics including tick generation and hash computation',
      usefulness: 'Essential for timing accuracy and identifying PoH-related performance issues'
    },
    'leader_slot_utilization': {
      explanation: 'How effectively a validator utilizes their leader slots for transaction processing',
      usefulness: 'Key metric for validator performance and potential MEV optimization'
    },
    
    // Accounts metrics
    'accounts_db': {
      explanation: 'Account database performance metrics including read/write operations and cache statistics',
      usefulness: 'Critical for monitoring account data access performance and identifying storage bottlenecks'
    },
    'accounts_hash': {
      explanation: 'Account hash computation metrics for state verification and snapshot creation',
      usefulness: 'Important for monitoring state integrity and snapshot performance'
    },
    'snapshot': {
      explanation: 'Snapshot creation and restoration metrics',
      usefulness: 'Essential for backup/recovery monitoring and fast validator startup'
    },
    
    // RPC metrics
    'rpc_service': {
      explanation: 'RPC request handling metrics including request rates, response times, and error rates',
      usefulness: 'Critical for monitoring API performance and user experience'
    },
    'rpc_subscriptions': {
      explanation: 'WebSocket subscription metrics for real-time data streaming',
      usefulness: 'Important for monitoring subscription health and real-time data delivery'
    },
    
    // Jito/MEV metrics
    'tip_distributor': {
      explanation: 'MEV tip distribution metrics from Jito including tip amounts and distribution efficiency',
      usefulness: 'Key for monitoring MEV revenue and tip redistribution performance'
    },
    'bundle': {
      explanation: 'Bundle processing metrics including bundle submission rates and execution success',
      usefulness: 'Critical for MEV strategy optimization and bundle execution monitoring'
    }
  };
  
  // Find the best match for the metric name
  let bestMatch = { explanation: 'Unknown metric - requires further analysis', usefulness: 'Impact unclear without additional context' };
  
  for (const [key, value] of Object.entries(explanations)) {
    if (metricName.toLowerCase().includes(key.toLowerCase())) {
      bestMatch = value;
      break;
    }
  }
  
  return {
    explanation: bestMatch.explanation,
    usefulness: bestMatch.usefulness,
    category
  };
}

function generateGrafanaPanel(metricName: string, panelId: number, x: number, y: number): GrafanaPanel {
  const metricInfo = explainMetric(metricName);
  
  return {
    id: panelId,
    title: `${metricName} (${metricInfo.category})`,
    type: "stat",
    targets: [{
      query: `from(bucket: "${INFLUX_BUCKET}") |> range(start: -1h) |> filter(fn: (r) => r._measurement == "${metricName}") |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)`,
      datasource: "InfluxDB"
    }],
    fieldConfig: {
      defaults: {
        unit: "short",
        displayName: metricName
      }
    },
    gridPos: {
      h: 8,
      w: 12,
      x: x,
      y: y
    }
  };
}

// Tool implementations
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_metrics",
        description: "List all available metrics from the sol_metrics InfluxDB database",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "analyze_metrics",
        description: "Analyze metrics and categorize them with explanations",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "Filter by category (Consensus, Network, Banking, Accounts, RPC, Performance, Jito/MEV, Other)",
              enum: Object.keys(METRIC_CATEGORIES).concat(['Other', 'All'])
            }
          },
        },
      },
      {
        name: "generate_dashboard",
        description: "Generate a Grafana dashboard JSON for selected metrics",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "Category to generate dashboard for",
              enum: Object.keys(METRIC_CATEGORIES).concat(['Other', 'All'])
            },
            dashboard_name: {
              type: "string",
              description: "Name for the generated dashboard"
            }
          },
          required: ["category", "dashboard_name"]
        },
      },
      {
        name: "search_rust_code",
        description: "Search for metric definitions in the Solana Rust codebase",
        inputSchema: {
          type: "object",
          properties: {
            metric_name: {
              type: "string",
              description: "Name of the metric to search for in the codebase"
            }
          },
          required: ["metric_name"]
        },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "list_metrics":
        const metrics = await getMetricsList();
        return {
          content: [
            {
              type: "text",
              text: `Found ${metrics.length} metrics in sol_metrics database:\n\n${metrics.join('\n')}`
            } as TextContent
          ]
        } as CallToolResult;

      case "analyze_metrics":
        const allMetrics = await getMetricsList();
        const categoryFilter = args?.category as string || 'All';
        
        const categorizedMetrics: { [key: string]: Array<{ name: string; details: any }> } = {};
        
        for (const metric of allMetrics) {
          const category = categorizeMetric(metric);
          if (categoryFilter !== 'All' && category !== categoryFilter) continue;
          
          if (!categorizedMetrics[category]) {
            categorizedMetrics[category] = [];
          }
          
          const metricInfo = explainMetric(metric);
          categorizedMetrics[category].push({
            name: metric,
            details: metricInfo
          });
        }
        
        let analysisText = `## Solana Metrics Analysis\n\n`;
        
        for (const [category, metrics] of Object.entries(categorizedMetrics)) {
          analysisText += `### ${category} (${metrics.length} metrics)\n\n`;
          
          for (const metric of metrics) {
            analysisText += `**${metric.name}**\n`;
            analysisText += `- *Explanation*: ${metric.details.explanation}\n`;
            analysisText += `- *Usefulness*: ${metric.details.usefulness}\n\n`;
          }
        }
        
        return {
          content: [
            {
              type: "text",
              text: analysisText
            } as TextContent
          ]
        } as CallToolResult;

      case "generate_dashboard":
        const dashboardCategory = args?.category as string;
        const dashboardName = args?.dashboard_name as string;
        
        const dashboardMetrics = await getMetricsList();
        const filteredMetrics = dashboardCategory === 'All' 
          ? dashboardMetrics 
          : dashboardMetrics.filter(m => categorizeMetric(m) === dashboardCategory);
        
        const panels: GrafanaPanel[] = [];
        let panelId = 1;
        let x = 0;
        let y = 0;
        
        for (const metric of filteredMetrics.slice(0, 20)) { // Limit to 20 panels
          panels.push(generateGrafanaPanel(metric, panelId, x, y));
          panelId++;
          x = x === 12 ? 0 : 12;
          if (x === 0) y += 8;
        }
        
        const dashboard: GrafanaDashboard = {
          dashboard: {
            id: null,
            title: dashboardName,
            tags: ["solana", "metrics", dashboardCategory.toLowerCase()],
            timezone: "browser",
            panels: panels,
            time: {
              from: "now-1h",
              to: "now"
            },
            refresh: "30s",
            schemaVersion: 16,
            version: 0
          },
          folderId: null,
          overwrite: true
        };
        
        // Save dashboard to file
        let savedFilePath = '';
        try {
          savedFilePath = await saveDashboardToFile(dashboard, dashboardCategory);
        } catch (error) {
          console.error('Failed to save dashboard to file:', error);
        }
        
        const savedMessage = savedFilePath ? `\n\n✅ **Dashboard saved to:** \`${path.basename(savedFilePath)}\`\n\nThe dashboard has been saved to the \`grafana/\` folder and can be imported directly into Grafana.` : '';
        
        return {
          content: [
            {
              type: "text",
              text: `# Grafana Dashboard: ${dashboardName}\n\nGenerated dashboard with ${panels.length} panels for ${dashboardCategory} metrics.${savedMessage}\n\n\`\`\`json\n${JSON.stringify(dashboard, null, 2)}\n\`\`\``
            } as TextContent
          ]
        } as CallToolResult;

      case "search_rust_code":
        const metricName = args?.metric_name as string;
        // This would search through the Solana codebase
        // For now, we'll return placeholder information
        const codeSearchResult = `
# Code Search Results for: ${metricName}

## Potential Locations in Solana Codebase:

### 1. Metric Definition
\`\`\`rust
// Likely in: turbine/src/broadcast_stage/broadcast_metrics.rs
datapoint_info!(
    "${metricName}",
    ("field_name", value, i64),
);
\`\`\`

### 2. Usage Context
Based on the metric category (${categorizeMetric(metricName)}), this metric is likely:
- **Purpose**: ${explainMetric(metricName).explanation}
- **Business Value**: ${explainMetric(metricName).usefulness}

### 3. Related Files to Check:
- \`/metrics/src/datapoint.rs\` - Core metrics infrastructure
- \`/turbine/src/\` - Network propagation metrics
- \`/core/src/banking_stage.rs\` - Transaction processing metrics
- \`/accounts-db/src/\` - Account database metrics
- \`/rpc/src/\` - RPC service metrics

### 4. Search Commands:
\`\`\`bash
# Search for metric definition
grep -r "${metricName}" solana/
# Search for datapoint usage
grep -r "datapoint.*${metricName}" solana/
\`\`\`
        `;
        
        return {
          content: [
            {
              type: "text",
              text: codeSearchResult
            } as TextContent
          ]
        } as CallToolResult;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        } as TextContent
      ],
      isError: true,
    } as CallToolResult;
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Solana Metrics MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
