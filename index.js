#!/usr/bin/env node

const { spawn } = require("cross-spawn");
const ngrok = require("ngrok");

(async function startTunnel() {
  console.log("🚀 Starting Metro Bundler...");
  const metroProcess = spawn("npx", ["react-native", "start"], { stdio: "inherit" });

  // Wait a bit for Metro to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Start ngrok tunnel
  console.log("🌍 Creating ngrok tunnel...");
  const url = await ngrok.connect({ proto: "http", addr: 8081 });

  console.log(`🔗 Tunnel URL: ${url}`);
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
})();
