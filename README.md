# react-native-dev-tunnel

🚀 **React Native Dev Tunnel** – A simple CLI tool to create an HTTP tunnel for debugging React Native apps in a bare workflow, similar to `expo start --tunnel`.

## 📌 Features

- ✅ Starts the **Metro Bundler** automatically
- ✅ Creates a **secure ngrok tunnel**
- ✅ Provides a **public URL** for debugging
- ✅ Works with **bare React Native projects**
- ✅ No need to connect a USB cable to run the app

---

## 📦 Installation

### **Global Installation**

```sh
npm install -g react-native-dev-tunnel
```

### **Project-Specific Installation**

```sh
npm install --save-dev react-native-dev-tunnel
```

---

## 🚀 Usage

### **Start Tunnel**

Run the following command inside your React Native project:

```sh
npx rn-tunnel
```

### **What This Command Does**

1. ✅ Starts **Metro Bundler**
2. ✅ Sets up an **ngrok tunnel**
3. ✅ Outputs a **public URL** you can use for debugging
4. ✅ Allows running the app without a physical USB connection

---

## ⚡ Example Output

```sh
🚀 Starting Metro Bundler...
🌍 Creating ngrok tunnel...
🔗 Tunnel URL: https://abcd-1234.ngrok.io
📡 Use this URL in your React Native app for debugging.
```

---

## 📖 Configuration (Optional)

You can customize the tunnel settings by passing flags:

```sh
npx rn-tunnel --port 8081 --region us
```

| Flag       | Description                               |
| ---------- | ----------------------------------------- |
| `--port`   | Specify a custom port (default: `8081`)   |
| `--region` | Set ngrok region (`us`, `eu`, `ap`, etc.) |

---

## 🛠️ Troubleshooting

### **Issue: **``**?**

If you get an error like `command not found: ngrok`, install ngrok globally:

```sh
npm install -g ngrok
```

---

## 🤝 Contributing

Pull requests are welcome! If you’d like to contribute:

1. **Fork the repo**
2. **Create a feature branch** (`git checkout -b my-feature`)
3. **Commit your changes** (`git commit -m 'Add feature'`)
4. **Push to the branch** (`git push origin my-feature`)
5. **Open a Pull Request**

---

## 📝 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

🚀 **Happy coding!** 🎉

