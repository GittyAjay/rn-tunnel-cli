#!/usr/bin/env node

const { spawn, execSync } = require("cross-spawn");
const net = require('net');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function cleanupNgrok() {
  console.log("🧹 Cleaning up ngrok processes and cache...");
  try {
    // Kill all ngrok processes
    if (process.platform === 'win32') {
      execSync('taskkill /F /IM ngrok.exe', { stdio: 'ignore' });
    } else {
      execSync('pkill ngrok', { stdio: 'ignore' });
    }
  } catch (error) {
    // Ignore errors if no processes found
  }

  // Clear ngrok cache
  const ngrokDir = path.join(os.homedir(), '.ngrok2');
  try {
    if (fs.existsSync(ngrokDir)) {
      fs.rmSync(ngrokDir, { recursive: true, force: true });
      console.log("✨ Cleared ngrok cache");
    }
  } catch (error) {
    console.log("Note: Could not clear ngrok cache:", error.message);
  }
}

async function setupNgrok() {
  const authToken = process.env.NGROK_AUTH_TOKEN;
  
  if (!authToken) {
    console.log("⚠️  No NGROK_AUTH_TOKEN environment variable found.");
    console.log("Please get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken");
    console.log("Then either:");
    console.log("1. Set it as an environment variable: export NGROK_AUTH_TOKEN='your_token'");
    console.log("2. Or run this script with: NGROK_AUTH_TOKEN='your_token' npx rn-tunnel");
    process.exit(1);
  }

  try {
    console.log("🔑 Authenticating ngrok...");
    execSync(`npx ngrok authtoken ${authToken}`, { stdio: 'inherit' });
    console.log("✅ Ngrok authenticated successfully");
  } catch (error) {
    console.error("❌ Failed to authenticate ngrok:", error.message);
    process.exit(1);
  }
}

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
    // Clean up existing ngrok processes and cache
    await cleanupNgrok();
    
    // Ensure ngrok is installed
    await ensureNgrokInstalled();
    
    // Setup and authenticate ngrok
    await setupNgrok();
    
    const ngrok = require("ngrok");
    const qrcode = require('qrcode-terminal');

    // Find available port
    const port = await findAvailablePort(8081);
    console.log(`🔍 Using port: ${port}`);

    // Start Metro Bundler
    console.log("🚀 Starting Metro Bundler...");
    const metroProcess = spawn("npx", ["react-native", "start", "--port", port.toString()], { 
      stdio: "inherit" 
    });

    // Wait for Metro to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Start ngrok tunnel with retries
    console.log("🌍 Creating ngrok tunnel...");
    let retries = 5;
    let url;
    
    while (retries > 0) {
      try {
        url = await ngrok.connect({
          proto: "http",
          addr: port,
          authtoken: process.env.NGROK_AUTH_TOKEN
        });
        console.log("✅ Ngrok tunnel created successfully");
        break;
      } catch (err) {
        console.log(`Retry attempt ${6 - retries}: ${err.message}`);
        await new Promise(resolve => setTimeout(resolve, 3000));
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
