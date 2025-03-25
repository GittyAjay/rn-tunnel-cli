#!/usr/bin/env node

const { spawn } = require("cross-spawn");
const ngrok = require("ngrok");
const qrcode = require('qrcode-terminal');
const net = require('net');

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
    // Find available port
    const port = await findAvailablePort(8081);
    console.log(`🔍 Using port: ${port}`);

    console.log("🚀 Starting Metro Bundler...");
    const metroProcess = spawn("npx", ["react-native", "start", "--port", port.toString()], { 
      stdio: "inherit" 
    });

    // Wait a bit for Metro to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Start ngrok tunnel with explicit configuration
    console.log("🌍 Creating ngrok tunnel...");
    const url = await ngrok.connect({
      proto: "http",
      addr: port,
      authtoken: process.env.NGROK_AUTH_TOKEN, // Add your ngrok auth token
      configPath: null // Prevent looking for config file
    });

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
