#!/usr/bin/env node

const { spawn } = require("cross-spawn");
const os = require('os');
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

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (!iface.internal && iface.family === 'IPv4') {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

(async function startLocal() {
  try {
    const port = await findAvailablePort(8081);
    const localIp = getLocalIpAddress();
    const url = `http://${localIp}:${port}`;
    
    console.log(`🔍 Using available port: ${port}`);
    console.log(`📱 Your local IP is: ${localIp}`);
    console.log(`🔗 Use this URL in your React Native app: ${url}`);
    
    // Generate QR code
    console.log("📱 Scan this QR code to open the app:");
    qrcode.generate(url, { small: true });

    // Start Metro Bundler
    console.log("🚀 Starting Metro Bundler...");
    spawn("npx", ["react-native", "start", "--port", port.toString()], { 
      stdio: "inherit" 
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
})();
