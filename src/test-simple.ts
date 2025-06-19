#!/usr/bin/env node

/**
 * Simple CLI tool to test the Solana Metrics MCP Server
 * This sends JSON-RPC messages directly to test the server functionality
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function sendMCPRequest(serverProcess: any, request: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 10000);

    let responseData = '';
    
    const onData = (data: Buffer) => {
      responseData += data.toString();
      try {
        // Try to parse the accumulated data as JSON
        const lines = responseData.split('\n').filter(line => line.trim());
        for (const line of lines) {
          if (line.trim()) {
            const response = JSON.parse(line);
            if (response.id === request.id) {
              clearTimeout(timeout);
              serverProcess.stdout.off('data', onData);
              resolve(response);
              return;
            }
          }
        }
      } catch (e) {
        // Not complete JSON yet, continue collecting
      }
    };

    serverProcess.stdout.on('data', onData);
    
    // Send the request
    serverProcess.stdin.write(JSON.stringify(request) + '\n');
  });
}

async function testMCPServer() {
  console.log("🎯 Starting Solana Metrics MCP Server Test");
  console.log("=========================================\n");

  // Start the server
  const serverPath = join(__dirname, '../build/index.js');
  console.log(`Starting server: ${serverPath}`);
  
  const serverProcess = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: {
      ...process.env,
      INFLUX_URL: process.env.INFLUX_URL || "http://your-influxdb-server:8086",
      INFLUX_TOKEN: process.env.INFLUX_TOKEN || "your_influxdb_token",
      INFLUX_BUCKET: process.env.INFLUX_BUCKET || "sol_metrics"
    }
  });

  // Give the server a moment to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Test 1: Initialize the connection
    console.log("1️⃣  Testing initialization...");
    const initRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {
          sampling: {}
        },
        clientInfo: {
          name: "test-client",
          version: "1.0.0"
        }
      }
    };

    const initResponse = await sendMCPRequest(serverProcess, initRequest);
    console.log("✅ Server initialized successfully");
    console.log(`   Server: ${initResponse.result?.serverInfo?.name || 'Unknown'}`);
    console.log();

    // Test 2: List available tools
    console.log("2️⃣  Testing tools/list...");
    const listToolsRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {}
    };

    const toolsResponse = await sendMCPRequest(serverProcess, listToolsRequest);
    console.log("✅ Available tools:");
    if (toolsResponse.result?.tools) {
      toolsResponse.result.tools.forEach((tool: any, index: number) => {
        console.log(`   ${index + 1}. ${tool.name} - ${tool.description}`);
      });
    }
    console.log();

    // Test 3: Test list_metrics tool
    console.log("3️⃣  Testing list_metrics tool...");
    const listMetricsRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "list_metrics",
        arguments: {}
      }
    };

    const metricsResponse = await sendMCPRequest(serverProcess, listMetricsRequest);
    console.log("✅ Metrics listed:");
    if (metricsResponse.result?.content?.[0]?.text) {
      const text = metricsResponse.result.content[0].text;
      const lines = text.split('\n');
      console.log(`   ${lines[0]}`); // First line shows count
      if (lines.length > 2) {
        console.log(`   Sample metrics: ${lines.slice(2, 7).join(', ')}...`);
      }
    }
    console.log();

    // Test 4: Test analyze_metrics tool
    console.log("4️⃣  Testing analyze_metrics tool (Consensus category)...");
    const analyzeRequest = {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "analyze_metrics",
        arguments: {
          category: "Consensus"
        }
      }
    };

    const analyzeResponse = await sendMCPRequest(serverProcess, analyzeRequest);
    console.log("✅ Metrics analyzed:");
    if (analyzeResponse.result?.content?.[0]?.text) {
      const text = analyzeResponse.result.content[0].text;
      const lines = text.split('\n');
      console.log(`   ${lines.slice(0, 5).join('\n   ')}`);
      console.log("   ... (truncated)");
    }
    console.log();

    // Test 5: Test search_rust_code tool
    console.log("5️⃣  Testing search_rust_code tool...");
    const searchRequest = {
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "search_rust_code",
        arguments: {
          metric_name: "cluster_nodes_broadcast"
        }
      }
    };

    const searchResponse = await sendMCPRequest(serverProcess, searchRequest);
    console.log("✅ Code search completed:");
    if (searchResponse.result?.content?.[0]?.text) {
      const text = searchResponse.result.content[0].text;
      const lines = text.split('\n');
      console.log(`   ${lines.slice(0, 8).join('\n   ')}`);
      console.log("   ... (truncated)");
    }
    console.log();

    console.log("🎉 All tests completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Set environment variables for your InfluxDB connection");
    console.log("2. Use the tools to analyze your metrics");
    console.log("3. Generate Grafana dashboards for specific categories");
    console.log("\n💡 You can now use this server with any MCP client!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    serverProcess.kill();
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testMCPServer().catch(console.error);
}
