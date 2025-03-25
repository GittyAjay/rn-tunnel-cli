#!/usr/bin/env node

const { spawn } = require("cross-spawn");
const os = require('os');
const qrcode = require('qrcode-terminal');

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
    const port = 8081;
    const localIp = getLocalIpAddress();
    const url = `http://${localIp}:${port}`;
    
    console.log(`🔍 Using port: ${port}`);
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
