# 实时聊天系统

一个基于Web技术和原生应用集成的实时聊天系统，包含前端Web界面、后端WebSocket服务和Android原生应用。

## 系统架构

本聊天系统由三个主要部分组成：

1. **前端Web应用**：基于React + Vite构建的聊天界面
2. **后端WebSocket服务**：基于Node.js的消息接收与推送服务
3. **Android原生应用**：集成WebView并提供原生功能调用

## 技术栈

### 前端
- React 18
- Vite 7
- WebSocket API
- CSS3

### 后端
- Node.js
- WebSocket (ws库)
- UUID
- 文件系统(FS)

### 安卓原生应用
- Android Studio
- WebView
- 原生方法集成

## 功能特性

### 前端功能
- 用户ID登录
- 实时消息发送与接收
- 聊天记录显示
- 消息删除功能
- 退出登录功能
- 响应式设计

### 后端功能
- WebSocket连接管理
- 消息存储
- 消息广播
- 消息删除处理
- 多客户端同步

### 原生应用功能
- WebView集成前端界面
- 设备信息获取
- 麦克风/摄像头权限管理
- 应用消息推送

## 快速开始

### 环境要求

- Node.js 16+
- npm/pnpm
- Android Studio (可选，用于原生应用开发)

### 安装依赖

```bash
# 安装前端依赖
cd frontend
pnpm install

# 安装后端依赖
cd ../backend
pnpm install
```

### 启动服务

```bash
# 启动后端WebSocket服务
cd backend
node server.js

# 在新终端启动前端开发服务器
cd frontend
pnpm dev
```

### 访问应用

- Web应用: http://localhost:5173
- Android应用: 运行Android Studio项目并安装到设备

## 项目结构

```
chat-app/
├── backend/              # 后端WebSocket服务
│   ├── server.js         # 主服务文件
│   ├── messages.json     # 消息存储文件
│   └── package.json      # 后端依赖
├── frontend/             # 前端Web应用
│   ├── src/
│   │   ├── App.jsx       # 主应用组件
│   │   ├── App.css       # 应用样式
│   │   └── main.jsx      # 应用入口
│   └── package.json      # 前端依赖
├── native/               # 原生应用
│   └── android/          # Android项目
├── .gitignore            # Git忽略文件
└── README.md             # 项目说明
```

## 使用说明

1. **登录**：在登录界面输入用户ID，点击"Enter Chat"按钮进入聊天室
2. **发送消息**：在输入框中输入消息，点击发送按钮
3. **删除消息**：右键点击消息，选择删除选项
4. **退出登录**：点击右上角的退出按钮

## WebSocket API

### 连接
```
ws://localhost:3000
```

### 消息格式

#### 发送消息
```json
{
  "type": "chat message",
  "userId": "user123",
  "message": "Hello, World!",
  "id": "uuid123"
}
```

#### 接收消息
```json
{
  "type": "chat message",
  "userId": "user123",
  "message": "Hello, World!",
  "id": "uuid123",
  "timestamp": 1620000000000
}
```

#### 删除消息
```json
{
  "type": "delete message",
  "id": "uuid123"
}
```

## 原生应用方法

Android原生应用通过WebView提供以下方法：

### 获取设备信息
```javascript
// JavaScript调用
window.AndroidInterface.getDeviceInfo();

// 返回格式
{
  "deviceName": "Device Name",
  "deviceModel": "Device Model",
  "osVersion": "Android 13"
}
```

### 请求权限
```javascript
// 请求麦克风权限
window.AndroidInterface.requestMicrophonePermission();

// 请求摄像头权限
window.AndroidInterface.requestCameraPermission();
```

### 发送应用消息
```javascript
window.AndroidInterface.sendNotification("Message Title", "Message Content");
```

## 开发指南

### 前端开发

前端代码位于`frontend/`目录，主要组件包括：

- `App.jsx`: 主应用组件，包含WebSocket连接、消息处理和界面渲染
- `App.css`: 应用样式定义

### 后端开发

后端代码位于`backend/`目录：

- `server.js`: WebSocket服务实现，包含连接管理、消息处理和存储
- `messages.json`: 消息持久化存储

### 原生应用开发

原生应用代码位于`native/android/`目录：

- `MainActivity.java`: WebView配置和原生方法实现
- `AndroidManifest.xml`: 应用权限和配置

## 许可证

MIT

## 贡献

欢迎提交Issue和Pull Request。

## 联系方式

如有问题，请通过以下方式联系：
- 项目仓库: [chat-app](https://github.com/Lavender695/chat-app)
- 开发者: Lavender695
