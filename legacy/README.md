# Synapse · AI Prompt Studio

> 一个多模型 AI 对话与 Prompt 工程实验台 — 为面试演示而生。

![tech](https://img.shields.io/badge/HTML5-orange) ![tech](https://img.shields.io/badge/CSS3-blue) ![tech](https://img.shields.io/badge/JavaScript-yellow) ![tech](https://img.shields.io/badge/AI-Prompt%20Engineering-purple)

## ✨ 特性

- 🧠 **多模型切换**：Claude / GPT-4o / Llama (Ollama) / Qwen (vLLM)
- 🎛 **参数实时调节**：Temperature / Top-P / Max Tokens
- 📚 **内置 Prompt 库**：8+ 高质量提示词模板（Code Review / Prompt Optimizer / System Design ...）
- 🎨 **酷炫 UI**：玻璃拟态 + 霓虹渐变 + Canvas 粒子背景 + 动态网格
- ⚡ **流式输出动画**：模拟真实 LLM 打字效果
- 📱 **响应式设计**：桌面 / 平板 / 手机自适应
- 🚀 **零依赖零构建**：纯 HTML/CSS/JS，双击 `index.html` 即可运行

## 🚀 快速开始

```bash
# 方式 1：直接双击 index.html
# 方式 2：起本地服务器（推荐）
python -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 前端 | HTML5 / CSS3 (Grid, Flexbox, Backdrop-filter) / Vanilla JS (ES6+) |
| 动效 | Canvas 2D API、CSS Animation、Backdrop Filter |
| 设计 | Glassmorphism、Neon Gradient、Cyberpunk Theme |
| 工程 | Mobile-First、Component-Based CSS、零依赖 |

## 📁 项目结构

```
project4/
├── index.html      # 入口与结构
├── styles.css      # 主题样式（玻璃拟态/霓虹/响应式）
├── app.js          # 交互逻辑（粒子/聊天/Prompt 库）
└── README.md
```

## 🎯 面试演示要点

1. **打开首页** → 展示动态粒子背景、玻璃拟态卡片、霓虹光晕
2. **切换模型** → 左侧选不同模型，参数滑块联动
3. **快捷 Prompt** → 点击 "解释 Transformer" → 看流式输出 + Markdown / 代码块渲染
4. **Prompt 库** → 切换到 `✦ Prompts` 标签 → 点击任意卡片自动填入输入框
5. **响应式** → F12 切换移动视图，布局自适应

## 🔌 扩展接入真实 AI

`app.js` 中的 `streamResponse()` 替换为真实 API：

```js
const res = await fetch('https://api.anthropic.com/v1/messages', {
  method:'POST',
  headers:{ 'x-api-key': KEY, 'anthropic-version':'2023-06-01' },
  body: JSON.stringify({ model:'claude-sonnet-4-5', messages, max_tokens:2048 })
});
```

或本地 Ollama：

```js
fetch('http://localhost:11434/api/chat', {
  method:'POST',
  body: JSON.stringify({ model:'llama3.1', messages, stream:true })
})
```

---

Made with 💜 for AI-native development.
