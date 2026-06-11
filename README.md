# 🍅 PomodoroCC - 番茄钟

一款简洁高效的番茄钟应用，帮助你专注工作、管理任务。支持 **Windows 桌面** 和 **Android 手机**。

使用 **Tauri 2** + 原生 Web 技术构建，体积小巧、运行轻量。

---

## ✨ 功能特性

- **🍅 番茄计时** — 25 分钟专注 + 5 分钟休息，自动循环切换
- **📋 任务清单** — 添加、勾选完成、删除任务，支持一键清除已完成项
- **📊 进度追踪** — 实时显示任务完成进度和专注轮数统计
- **🔔 桌面通知** — 专注/休息时间结束时弹出系统通知 + 提示音
- **💾 本地存储** — 任务列表和专注计数自动保存到本地，重启不丢失
- **⌨️ 键盘快捷键** — 按空格键即可开始/暂停计时
- **🎨 暗色主题** — 护眼深色界面，番茄红配色
- **📱 轻量体积** — 桌面安装包仅约 3MB，无需额外依赖

---

## 📸 界面截图

![PomodoroCC 主界面](https://via.placeholder.com/480x680/1a1a24/e8e8f0?text=PomodoroCC+Screenshot)

---

## 🚀 快速开始

### 直接下载安装包（推荐）

| 平台 | 文件 | 说明 |
|------|------|------|
| 🖥️ Windows | `PomodoroCC_0.1.0_x64_zh-CN.msi` | 标准安装程序（推荐） |
| 🖥️ Windows | `PomodoroCC_0.1.0_x64-setup.exe` | 自解压安装程序 |
| 📱 Android | `PomodoroCC-v0.1.3.apk` | 安卓 APK 安装包 |

> 🔗 **最新版本下载**: [v0.1.0 Release](https://github.com/Paoaoaoaoao/pomodoro-cc/releases/tag/v0.1.0)

双击运行或拷贝到手机安装即可。

---

## 🛠️ 本地开发

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/) >= 1.70
- Windows 10/11（需安装 WebView2，通常系统自带）
- 安卓构建需额外安装 [Android Studio](https://developer.android.com/studio) + JDK 17

### 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/Paoaoaoaoao/pomodoro-cc.git
cd pomodoro-cc

# 2. 安装依赖
npm install

# 3. 启动开发模式（桌面端，热重载）
npm run tauri dev

# 4. 构建桌面生产版本
npm run tauri build

# 5. 构建安卓 APK
npx tauri android build --debug
```

桌面构建产物位于 `src-tauri/target/release/bundle/` 目录。
安卓 APK 位于 `src-tauri/gen/android/app/build/outputs/apk/` 目录。

---

## 📖 使用说明

### 基础操作

| 操作 | 说明 |
|------|------|
| **开始** | 点击「▶ 开始」按钮或按空格键，启动计时 |
| **暂停** | 点击「⏸ 暂停」按钮或按空格键，暂停计时 |
| **重置** | 点击「↺ 重置」按钮，重新开始当前阶段 |
| **跳过** | 点击「⏭ 跳过」按钮，直接结束当前阶段并切换模式 |

### 模式切换

- 🔥 **专注模式**：25 分钟倒计时，计时结束后自动切换到休息模式
- ☕ **休息模式**：5 分钟倒计时，计时结束后自动切换到专注模式

### 任务管理

- 在输入框中输入任务内容，点击「＋ 添加」或按回车键添加
- 点击任务前的圆形复选框可标记完成/未完成
- 悬停任务项，点击右侧「×」按钮可删除单个任务
- 点击「🗑 清除已完成」可一键清除所有已完成任务

---

## 🏗️ 技术栈

| 层 | 技术 |
|----|------|
| 桌面框架 | [Tauri 2](https://v2.tauri.app/) |
| 后端 | Rust |
| 前端 | HTML + CSS + Vanilla JavaScript |
| 存储 | Web Storage (localStorage) |
| 通知 | Web Notification API (浏览器回退) |
| 桌面打包 | WiX (MSI) + NSIS |
| 安卓打包 | Gradle + NDK 交叉编译 |

---

## 📂 项目结构

```
pomodoro-cc/
├── src/                        # 前端源码
│   ├── index.html              # 主页面结构
│   ├── style.css               # 样式表（暗色主题）
│   └── main.js                 # 核心逻辑（计时/任务/存储）
├── src-tauri/                  # Tauri 后端
│   ├── src/
│   │   ├── lib.rs              # Rust 应用入口
│   │   └── main.rs             # 主函数
│   ├── icons/                  # 应用图标
│   ├── capabilities/           # 权限配置
│   ├── Cargo.toml              # Rust 依赖
│   └── tauri.conf.json         # Tauri 配置
├── package.json                # Node 配置
└── README.md                   # 本文件
```

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- [Tauri](https://tauri.app/) — 轻量级跨平台桌面框架
- [Pomodoro Technique](https://francescocirillo.com/pages/pomodoro-technique) — 番茄工作法发明者 Francesco Cirillo

---

> 🍅 Stay focused, get things done!
