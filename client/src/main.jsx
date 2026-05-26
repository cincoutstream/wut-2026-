import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      autoInsertSpaceInButton={false}
      theme={{
        token: {
          colorPrimary: "#2563eb",
          colorInfo: "#2563eb",
          colorSuccess: "#0f766e",
          colorWarning: "#b7791f",
          colorBgLayout: "#f5f7fb",
          colorText: "#172033",
          colorTextSecondary: "#667085",
          colorBorder: "rgba(16, 24, 40, 0.12)",
          colorFillAlter: "#f8fafc",
          borderRadius: 8,
          fontFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
          controlHeight: 38,
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
