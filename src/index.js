#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var influxdb_client_1 = require("@influxdata/influxdb-client");
// Server configuration
var server = new index_js_1.Server({
    name: "solana-metrics-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// InfluxDB configuration
var INFLUX_URL = process.env.INFLUX_URL || 'http://your-influxdb-server:8086';
var INFLUX_TOKEN = process.env.INFLUX_TOKEN || 'your_influxdb_token';
var INFLUX_ORG = process.env.INFLUX_ORG || '';
var INFLUX_BUCKET = process.env.INFLUX_BUCKET || 'sol_metrics';
// Initialize InfluxDB client
var influxDB = new influxdb_client_1.InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
var queryApi = influxDB.getQueryApi(INFLUX_ORG);
// Metric categories based on Solana architecture
var METRIC_CATEGORIES = {
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
// Helper functions
function getMetricsList() {
    return __awaiter(this, void 0, void 0, function () {
        var query, metrics_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    query = "\n      import \"influxdata/influxdb/schema\"\n      schema.measurements(bucket: \"".concat(INFLUX_BUCKET, "\")\n    ");
                    metrics_1 = [];
                    return [4 /*yield*/, queryApi.queryRows(query, {
                            next: function (row, tableMeta) {
                                var o = tableMeta.toObject(row);
                                if (o._value && typeof o._value === 'string') {
                                    metrics_1.push(o._value);
                                }
                            },
                            error: function (error) {
                                console.error('Error querying metrics:', error);
                            },
                            complete: function () {
                                console.log('Metrics query completed');
                            },
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, metrics_1];
                case 2:
                    error_1 = _a.sent();
                    console.error('Failed to get metrics list:', error_1);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getMetricDetails(metricName) {
    return __awaiter(this, void 0, void 0, function () {
        var query, details_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    query = "\n      from(bucket: \"".concat(INFLUX_BUCKET, "\")\n        |> range(start: -1h)\n        |> filter(fn: (r) => r._measurement == \"").concat(metricName, "\")\n        |> limit(n: 1)\n        |> yield()\n    ");
                    details_1 = {};
                    return [4 /*yield*/, queryApi.queryRows(query, {
                            next: function (row, tableMeta) {
                                var o = tableMeta.toObject(row);
                                Object.keys(o).forEach(function (key) {
                                    if (key.startsWith('_') || key === 'table' || key === 'result')
                                        return;
                                    details_1[key] = o[key];
                                });
                            },
                            error: function (error) {
                                console.error("Error querying metric ".concat(metricName, ":"), error);
                            },
                            complete: function () {
                                console.log("Metric ".concat(metricName, " details query completed"));
                            },
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, details_1];
                case 2:
                    error_2 = _a.sent();
                    console.error("Failed to get details for metric ".concat(metricName, ":"), error_2);
                    return [2 /*return*/, {}];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function categorizeMetric(metricName) {
    for (var _i = 0, _a = Object.entries(METRIC_CATEGORIES); _i < _a.length; _i++) {
        var _b = _a[_i], category = _b[0], keywords = _b[1];
        if (keywords.some(function (keyword) { return metricName.toLowerCase().includes(keyword.toLowerCase()); })) {
            return category;
        }
    }
    return 'Other';
}
function explainMetric(metricName) {
    var category = categorizeMetric(metricName);
    // Detailed explanations based on Solana documentation and Tachyon code analysis
    var explanations = {
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
    var bestMatch = { explanation: 'Unknown metric - requires further analysis', usefulness: 'Impact unclear without additional context' };
    for (var _i = 0, _a = Object.entries(explanations); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (metricName.toLowerCase().includes(key.toLowerCase())) {
            bestMatch = value;
            break;
        }
    }
    return {
        explanation: bestMatch.explanation,
        usefulness: bestMatch.usefulness,
        category: category
    };
}
function generateGrafanaPanel(metricName, panelId, x, y) {
    var metricInfo = explainMetric(metricName);
    return {
        id: panelId,
        title: "".concat(metricName, " (").concat(metricInfo.category, ")"),
        type: "stat",
        targets: [{
                query: "from(bucket: \"".concat(INFLUX_BUCKET, "\") |> range(start: -1h) |> filter(fn: (r) => r._measurement == \"").concat(metricName, "\") |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)"),
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
server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, {
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
                        description: "Search for metric definitions in the Tachyon Solana Rust codebase",
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
            }];
    });
}); });
server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_1, args, _b, metrics, allMetrics, categoryFilter, categorizedMetrics, _i, allMetrics_1, metric, category, metricInfo, analysisText, _c, _d, _e, category, metrics_3, _f, metrics_2, metric, dashboardCategory_1, dashboardName, dashboardMetrics, filteredMetrics, panels, panelId, x, y, _g, _h, metric, dashboard, metricName, codeSearchResult, error_3;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                _j.trys.push([0, 10, , 11]);
                _a = request.params, name_1 = _a.name, args = _a.arguments;
                _b = name_1;
                switch (_b) {
                    case "list_metrics": return [3 /*break*/, 1];
                    case "analyze_metrics": return [3 /*break*/, 3];
                    case "generate_dashboard": return [3 /*break*/, 5];
                    case "search_rust_code": return [3 /*break*/, 7];
                }
                return [3 /*break*/, 8];
            case 1: return [4 /*yield*/, getMetricsList()];
            case 2:
                metrics = _j.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Found ".concat(metrics.length, " metrics in sol_metrics database:\n\n").concat(metrics.join('\n'))
                            }
                        ]
                    }];
            case 3: return [4 /*yield*/, getMetricsList()];
            case 4:
                allMetrics = _j.sent();
                categoryFilter = (args === null || args === void 0 ? void 0 : args.category) || 'All';
                categorizedMetrics = {};
                for (_i = 0, allMetrics_1 = allMetrics; _i < allMetrics_1.length; _i++) {
                    metric = allMetrics_1[_i];
                    category = categorizeMetric(metric);
                    if (categoryFilter !== 'All' && category !== categoryFilter)
                        continue;
                    if (!categorizedMetrics[category]) {
                        categorizedMetrics[category] = [];
                    }
                    metricInfo = explainMetric(metric);
                    categorizedMetrics[category].push({
                        name: metric,
                        details: metricInfo
                    });
                }
                analysisText = "## Solana Metrics Analysis\n\n";
                for (_c = 0, _d = Object.entries(categorizedMetrics); _c < _d.length; _c++) {
                    _e = _d[_c], category = _e[0], metrics_3 = _e[1];
                    analysisText += "### ".concat(category, " (").concat(metrics_3.length, " metrics)\n\n");
                    for (_f = 0, metrics_2 = metrics_3; _f < metrics_2.length; _f++) {
                        metric = metrics_2[_f];
                        analysisText += "**".concat(metric.name, "**\n");
                        analysisText += "- *Explanation*: ".concat(metric.details.explanation, "\n");
                        analysisText += "- *Usefulness*: ".concat(metric.details.usefulness, "\n\n");
                    }
                }
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: analysisText
                            }
                        ]
                    }];
            case 5:
                dashboardCategory_1 = args === null || args === void 0 ? void 0 : args.category;
                dashboardName = args === null || args === void 0 ? void 0 : args.dashboard_name;
                return [4 /*yield*/, getMetricsList()];
            case 6:
                dashboardMetrics = _j.sent();
                filteredMetrics = dashboardCategory_1 === 'All'
                    ? dashboardMetrics
                    : dashboardMetrics.filter(function (m) { return categorizeMetric(m) === dashboardCategory_1; });
                panels = [];
                panelId = 1;
                x = 0;
                y = 0;
                for (_g = 0, _h = filteredMetrics.slice(0, 20); _g < _h.length; _g++) { // Limit to 20 panels
                    metric = _h[_g];
                    panels.push(generateGrafanaPanel(metric, panelId, x, y));
                    panelId++;
                    x = x === 12 ? 0 : 12;
                    if (x === 0)
                        y += 8;
                }
                dashboard = {
                    dashboard: {
                        id: null,
                        title: dashboardName,
                        tags: ["solana", "metrics", dashboardCategory_1.toLowerCase()],
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
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "# Grafana Dashboard: ".concat(dashboardName, "\n\nGenerated dashboard with ").concat(panels.length, " panels for ").concat(dashboardCategory_1, " metrics.\n\n```json\n").concat(JSON.stringify(dashboard, null, 2), "\n```")
                            }
                        ]
                    }];
            case 7:
                metricName = args === null || args === void 0 ? void 0 : args.metric_name;
                codeSearchResult = "\n# Code Search Results for: ".concat(metricName, "\n\n## Potential Locations in Tachyon Solana Codebase:\n\n### 1. Metric Definition\n```rust\n// Likely in: turbine/src/broadcast_stage/broadcast_metrics.rs\ndatapoint_info!(\n    \"").concat(metricName, "\",\n    (\"field_name\", value, i64),\n);\n```\n\n### 2. Usage Context\nBased on the metric category (").concat(categorizeMetric(metricName), "), this metric is likely:\n- **Purpose**: ").concat(explainMetric(metricName).explanation, "\n- **Business Value**: ").concat(explainMetric(metricName).usefulness, "\n\n### 3. Related Files to Check:\n- `/metrics/src/datapoint.rs` - Core metrics infrastructure\n- `/turbine/src/` - Network propagation metrics\n- `/core/src/banking_stage.rs` - Transaction processing metrics\n- `/accounts-db/src/` - Account database metrics\n- `/rpc/src/` - RPC service metrics\n\n### 4. Search Commands:\n```bash\n# Search for metric definition\ngrep -r \"").concat(metricName, "\" tachyon-solana/\n# Search for datapoint usage\ngrep -r \"datapoint.*").concat(metricName, "\" tachyon-solana/\n```\n        ");
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: codeSearchResult
                            }
                        ]
                    }];
            case 8: throw new Error("Unknown tool: ".concat(name_1));
            case 9: return [3 /*break*/, 11];
            case 10:
                error_3 = _j.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Error: ".concat(error_3 instanceof Error ? error_3.message : String(error_3))
                            }
                        ],
                        isError: true,
                    }];
            case 11: return [2 /*return*/];
        }
    });
}); });
// Start the server
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transport = new stdio_js_1.StdioServerTransport();
                    return [4 /*yield*/, server.connect(transport)];
                case 1:
                    _a.sent();
                    console.error("Solana Metrics MCP Server running on stdio");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
