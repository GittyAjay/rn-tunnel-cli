#!/usr/bin/env node

const { spawn, execSync } = require("cross-spawn");
const net = require('net');
const fs = require('fs');
const path = require('path');

async function ensureNgrokInstalled() {
  try {
    console.log("🔍 Checking ngrok installation...");
    require.resolve('ngrok');
    console.log("✅ ngrok is already installed");
  } catch (e) {
    console.log("📦 Installing ngrok...");
    try {
      execSync('npm install ngrok --save', { stdio: 'inherit' });
      console.log("✅ ngrok installed successfully");
    } catch (error) {
      console.error("❌ Failed to install ngrok:", error.message);
      process.exit(1);
    }
  }
}

// Function to find available port
async function findAvailablePort(startPort) {
  const isPortAvailable = (port) => {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(port, () => {
        server.close();
        resolve(true);
      });
      server.on('error', () => {
        resolve(false);
      });
    });
  };

  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
  }
  return port;
}

(async function startTunnel() {
  try {
    // Ensure ngrok is installed before requiring it
    await ensureNgrokInstalled();
    const ngrok = require("ngrok");
    const qrcode = require('qrcode-terminal');

    // Find available port
    const port = await findAvailablePort(8081);
    console.log(`🔍 Using port: ${port}`);

    // Initialize ngrok first
    console.log("🔧 Initializing ngrok...");
    await ngrok.kill(); // Kill any existing ngrok processes
    
    // Start Metro Bundler
    console.log("🚀 Starting Metro Bundler...");
    const metroProcess = spawn("npx", ["react-native", "start", "--port", port.toString()], { 
      stdio: "inherit" 
    });

    // Wait a bit longer for Metro to start and ngrok to initialize
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Start ngrok tunnel with retries
    console.log("🌍 Creating ngrok tunnel...");
    let retries = 3;
    let url;
    
    while (retries > 0) {
      try {
        url = await ngrok.connect({
          proto: "http",
          addr: port,
          authtoken: process.env.NGROK_AUTH_TOKEN,
          configPath: null
        });
        break;
      } catch (err) {
        if (err.message.includes('authtoken')) {
          console.log("⚠️  No ngrok authtoken found. Please run:");
          console.log("npx ngrok authtoken <your-token>");
          process.exit(1);
        }
        console.log(`Retry attempt ${4 - retries}: Waiting for ngrok to initialize...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        retries--;
        if (retries === 0) throw err;
      }
    }

    console.log(`🔗 Tunnel URL: ${url}`);
    console.log("📱 Scan this QR code to open the app:");
    qrcode.generate(url, { small: true });
    console.log("📡 Use this URL in your React Native app for debugging.");

    // Handle process exit
    process.on("exit", async () => {
      console.log("🛑 Stopping ngrok...");
      await ngrok.disconnect();
      await ngrok.kill();
    });

    process.on("SIGINT", async () => {
      process.exit();
    });
  } catch (error) {
    console.error("❌ Error starting tunnel:", error.message);
    process.exit(1);
  }
})();
