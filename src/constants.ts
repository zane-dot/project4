import type { ModelConfig, PromptTemplate } from './types';

export const MODELS: ModelConfig[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek Chat',
    provider: 'DeepSeek · Real API',
    live: true,
    apiModel: 'deepseek-chat',
    keyLabel: 'DeepSeek API Key',
    keyPlaceholder: 'sk-...',
    keyHelpUrl: 'https://platform.deepseek.com/api_keys',
  },
  {
    id: 'claude',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic · Real API',
    live: true,
    apiModel: 'claude-sonnet-4-5',
    keyLabel: 'Anthropic API Key',
    keyPlaceholder: 'sk-ant-...',
    keyHelpUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'gpt',
    name: 'GPT-4o',
    provider: 'OpenAI · Real API',
    live: true,
    apiModel: 'gpt-4o',
    keyLabel: 'OpenAI API Key',
    keyPlaceholder: 'sk-...',
    keyHelpUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    provider: 'Ollama · Local API',
    live: true,
  },
];

export const OLLAMA_DEFAULT_URL = 'http://localhost:11434';

export const DEFAULT_MODEL = 'deepseek';

export const EXT_LANG: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  jsx: 'jsx',
  tsx: 'tsx',
  vue: 'vue',
  py: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  h: 'c',
  go: 'go',
  rs: 'rust',
  rb: 'ruby',
  php: 'php',
  sql: 'sql',
  sh: 'bash',
  bat: 'bat',
  html: 'html',
  css: 'css',
  json: 'json',
  xml: 'xml',
  yml: 'yaml',
  yaml: 'yaml',
  md: 'markdown',
  csv: 'csv',
  toml: 'toml',
  ini: 'ini',
  env: 'bash',
  log: 'text',
  txt: 'text',
};

export const MAX_FILE_SIZE = 256 * 1024;

export const PROMPTS: PromptTemplate[] = [
  {
    icon: '🎯',
    title: 'Code Reviewer',
    tag: 'CODE',
    desc: '扮演资深工程师，从可读性/性能/安全三维度审查代码并给出 diff 建议。',
    body: 'You are a senior software engineer. Review the following code along three dimensions: readability, performance, and security. Output as a markdown diff with explanations.\n\n<code>\n[paste here]\n</code>',
  },
  {
    icon: '📝',
    title: 'Prompt Optimizer',
    tag: 'META',
    desc: '分析现有 Prompt 并重写为更结构化、更高效的版本。',
    body: 'Analyze the prompt below and rewrite it using best practices: role assignment, structured tags, few-shot examples, and explicit output format.\n\nOriginal: [your prompt]',
  },
  {
    icon: '🐛',
    title: 'Bug Detective',
    tag: 'DEBUG',
    desc: '根据错误信息和上下文，推理根因并给出修复方案。',
    body: 'Act as a debugging detective. Given the error and code, list 3 hypotheses ordered by likelihood, then propose a fix.\n\nError:\nCode:',
  },
  {
    icon: '🏗',
    title: 'System Designer',
    tag: 'ARCH',
    desc: '设计可扩展的系统架构，包含组件图、数据流和取舍分析。',
    body: 'Design a scalable system for: [feature]. Include: 1) component diagram (mermaid), 2) data flow, 3) trade-offs, 4) failure modes.',
  },
  {
    icon: '📊',
    title: 'Data Analyst',
    tag: 'DATA',
    desc: '分析数据集并产出关键洞察与可视化建议。',
    body: 'You are a senior data analyst. Given this dataset description: [...], identify 5 key insights and recommend visualization types for each.',
  },
  {
    icon: '🎨',
    title: 'UI Critic',
    tag: 'DESIGN',
    desc: '从可用性、对比度、布局节奏点评界面截图。',
    body: "Critique this UI design from three perspectives: usability heuristics, color contrast, and layout rhythm. Suggest 3 actionable improvements.",
  },
  {
    icon: '📚',
    title: 'Tech Explainer',
    tag: 'EDU',
    desc: '用三层递进 (ELI5 → Engineer → Expert) 讲解技术概念。',
    body: "Explain [concept] in three progressive layers: 1) Explain Like I'm 5, 2) Engineer-level, 3) Expert deep-dive with formulas.",
  },
  {
    icon: '⚡',
    title: 'API Architect',
    tag: 'API',
    desc: '生成 RESTful / GraphQL API 设计，含字段、状态码、示例。',
    body: 'Design a REST API for [domain]. Include: endpoints, HTTP methods, request/response schemas, status codes, and 2 example calls.',
  },
];

export const MOCK_RESPONSES: Record<string, string> = {
  default:
    `好问题！让我为你详细解答 ✨\n\n这是一个用 **Synapse AI Studio** 模拟的回复。在真实场景中，这里会通过 \`fetch\` 调用：\n\n\`\`\`javascript\nawait fetch('/api/chat', {\n  method:'POST',\n  body: JSON.stringify({ model, messages, temperature })\n})\n\`\`\`\n\n支持的后端：**Anthropic Claude API**、**OpenAI**、**Ollama 本地**、**vLLM 自托管**。`,
  code: `这是一个 React Todo 示例：\n\n\`\`\`jsx\nfunction Todo(){\n  const [list,setList] = useState([]);\n  const [text,setText] = useState('');\n  return (\n    <div>\n      <input value={text} onChange={e=>setText(e.target.value)} />\n      <button onClick={()=>setList([...list,text])}>Add</button>\n      <ul>{list.map((t,i)=><li key={i}>{t}</li>)}</ul>\n    </div>\n  );\n}\n\`\`\`\n\n用 \`useState\` 管理状态，几行代码完成 ✅`,
  prompt: `**Prompt 优化建议** 🎯\n\n1. **角色化**：开头声明 \`You are an expert ...\`\n2. **结构化**：用 XML/Markdown 切分 \`<context>\` \`<task>\` \`<format>\`\n3. **少样本**：给 2-3 个 input/output 示例\n4. **思维链**：加入 \`Let's think step by step\`\n5. **约束输出**：指定 JSON Schema 或字数`,
  transformer: `**Transformer 注意力机制** 🧠\n\n核心公式：\n\n\`\`\`\nAttention(Q,K,V) = softmax(QK^T / √d_k) V\n\`\`\`\n\n- **Q (Query)**：当前 token 想"问"什么\n- **K (Key)**：每个 token 提供的"索引"\n- **V (Value)**：实际"内容"\n\n通过 Q·K 算相似度，softmax 归一化得权重，再加权 V。**多头**让模型并行关注不同子空间。`,
};

export function pickMock(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('react') || t.includes('todo') || t.includes('代码')) return MOCK_RESPONSES.code;
  if (t.includes('prompt') || t.includes('提示词')) return MOCK_RESPONSES.prompt;
  if (t.includes('transformer') || t.includes('注意力')) return MOCK_RESPONSES.transformer;
  return MOCK_RESPONSES.default;
}
