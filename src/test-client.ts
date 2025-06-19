#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MCPTestClient {
  private client: Client;
  private transport: StdioClientTransport;

  constructor() {
    // Start the MCP server as a subprocess
    const serverPath = join(__dirname, '../../build/index.js');
    const serverProcess = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'inherit']
    });

    this.transport = new StdioClientTransport({
      stdin: serverProcess.stdin!,
      stdout: serverProcess.stdout!
    });

    this.client = new Client(
      { name: "test-client", version: "1.0.0" },
      { capabilities: {} }
    );
  }

  async connect() {
    await this.client.connect(this.transport);
    console.log("✅ Connected to MCP server");
  }

  async listTools() {
    console.log("\n🔧 Available tools:");
    const tools = await this.client.listTools();
    tools.tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}`);
      console.log(`   ${tool.description}`);
      console.log();
    });
    return tools.tools;
  }

  async testListMetrics() {
    console.log("\n📊 Testing list_metrics tool...");
    try {
      const result = await this.client.callTool({
        name: "list_metrics",
        arguments: {}
      });
      
      console.log("✅ Result:");
      if (result.content && result.content[0] && 'text' in result.content[0]) {
        console.log(result.content[0].text);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  }

  async testAnalyzeMetrics(category = "All") {
    console.log(`\n🔍 Testing analyze_metrics tool (category: ${category})...`);
    try {
      const result = await this.client.callTool({
        name: "analyze_metrics",
        arguments: { category }
      });
      
      console.log("✅ Result:");
      if (result.content && result.content[0] && 'text' in result.content[0]) {
        console.log(result.content[0].text);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  }

  async testGenerateDashboard(category: string, dashboardName: string) {
    console.log(`\n📈 Testing generate_dashboard tool...`);
    try {
      const result = await this.client.callTool({
        name: "generate_dashboard",
        arguments: { 
          category, 
          dashboard_name: dashboardName 
        }
      });
      
      console.log("✅ Result:");
      if (result.content && result.content[0] && 'text' in result.content[0]) {
        console.log(result.content[0].text);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  }

  async testSearchRustCode(metricName: string) {
    console.log(`\n🔎 Testing search_rust_code tool for "${metricName}"...`);
    try {
      const result = await this.client.callTool({
        name: "search_rust_code",
        arguments: { metric_name: metricName }
      });
      
      console.log("✅ Result:");
      if (result.content && result.content[0] && 'text' in result.content[0]) {
        console.log(result.content[0].text);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  }

  async runTests() {
    try {
      await this.connect();
      
      // List available tools
      const tools = await this.listTools();
      
      // Test each tool
      await this.testListMetrics();
      
      await this.testAnalyzeMetrics("Consensus");
      
      await this.testGenerateDashboard("Consensus", "Solana Consensus Metrics");
      
      await this.testSearchRustCode("cluster_nodes_broadcast");
      
      console.log("\n🎉 All tests completed!");
      
    } catch (error) {
      console.error("❌ Test failed:", error);
    } finally {
      await this.client.close();
    }
  }
}

// Interactive CLI
async function runInteractive() {
  const client = new MCPTestClient();
  
  try {
    await client.connect();
    console.log("🎯 Solana Metrics MCP Server Test Client");
    console.log("==========================================");
    
    const tools = await client.listTools();
    
    // Simple interactive menu
    console.log("\nChoose a test to run:");
    console.log("1. List all metrics");
    console.log("2. Analyze Consensus metrics");
    console.log("3. Analyze Network metrics");
    console.log("4. Generate Consensus dashboard");
    console.log("5. Search Rust code for specific metric");
    console.log("6. Run all tests");
    
    // For now, let's run all tests
    console.log("\nRunning all tests...\n");
    
    await client.testListMetrics();
    await client.testAnalyzeMetrics("Consensus");
    await client.testAnalyzeMetrics("Network");
    await client.testGenerateDashboard("Consensus", "Solana Consensus Dashboard");
    await client.testSearchRustCode("cluster_nodes_broadcast");
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.client.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runInteractive().catch(console.error);
}
