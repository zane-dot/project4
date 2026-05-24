import { getSystemPrompt } from '../utils';
import { pickMock, MODELS } from '../constants';
import type { Message } from '../types';

interface StreamOptions {
  text: string;
  apiKey: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  history: Message[];
  signal: AbortSignal;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  modelDisplayName?: string;
}

type StreamChunk = { type: 'delta'; content: string } | { type: 'error'; content: string };

function systemContent(name?: string): string {
  return getSystemPrompt(name).content;
}

async function* readSSE(res: Response): AsyncGenerator<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop()!;
    for (const line of lines) {
      const s = line.trim();
      if (!s || !s.startsWith('data:')) continue;
      const data = s.slice(5).trim();
      if (data === '[DONE]') continue;
      yield data;
    }
  }
}

export async function* streamDeepSeek(options: StreamOptions): AsyncGenerator<StreamChunk> {
  const { text, apiKey, temperature, topP, maxTokens, history, signal, modelDisplayName } = options;
  if (!apiKey.trim()) {
    yield { type: 'error', content: '⚠ 请在左侧填入 DeepSeek API Key\n获取地址：https://platform.deepseek.com/api_keys' };
    return;
  }

  const messagesForApi = [
    { role: 'system', content: systemContent(modelDisplayName || 'DeepSeek Chat') },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: text },
  ];

  let res: Response;
  try {
    res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey.trim(),
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messagesForApi,
        temperature,
        top_p: topP,
        max_tokens: maxTokens,
        stream: true,
      }),
      signal,
    });
  } catch (e) {
    yield {
      type: 'error',
      content: `⚠ 网络错误：${(e as Error).message}\n如果是 CORS，请用本地服务器运行或配置代理后端。`,
    };
    return;
  }

  if (!res.ok) {
    const errText = await res.text();
    yield { type: 'error', content: `⚠ DeepSeek API 错误 ${res.status}：${errText.slice(0, 300)}` };
    return;
  }

  for await (const data of readSSE(res)) {
    try {
      const json = JSON.parse(data);
      const delta = json.choices?.[0]?.delta?.content || '';
      if (delta) yield { type: 'delta', content: delta };
    } catch {
      /* ignore */
    }
  }
}

export async function* streamOpenAI(options: StreamOptions): AsyncGenerator<StreamChunk> {
  const { text, apiKey, temperature, topP, maxTokens, history, signal, modelDisplayName } = options;
  if (!apiKey.trim()) {
    yield { type: 'error', content: '⚠ 请在左侧填入 OpenAI API Key\n获取地址：https://platform.openai.com/api-keys' };
    return;
  }

  const model = MODELS.find((m) => m.id === 'gpt')?.apiModel || 'gpt-4o';

  const messagesForApi = [
    { role: 'system', content: systemContent(modelDisplayName || 'GPT-4o') },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: text },
  ];

  let res: Response;
  try {
    res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey.trim(),
      },
      body: JSON.stringify({
        model,
        messages: messagesForApi,
        temperature,
        top_p: topP,
        max_tokens: maxTokens,
        stream: true,
      }),
      signal,
    });
  } catch (e) {
    yield {
      type: 'error',
      content: `⚠ 网络错误：${(e as Error).message}\n如果是 CORS，请用本地服务器运行或配置代理后端。`,
    };
    return;
  }

  if (!res.ok) {
    const errText = await res.text();
    yield { type: 'error', content: `⚠ OpenAI API 错误 ${res.status}：${errText.slice(0, 300)}` };
    return;
  }

  for await (const data of readSSE(res)) {
    try {
      const json = JSON.parse(data);
      const delta = json.choices?.[0]?.delta?.content || '';
      if (delta) yield { type: 'delta', content: delta };
    } catch {
      /* ignore */
    }
  }
}

export async function* streamClaude(options: StreamOptions): AsyncGenerator<StreamChunk> {
  const { text, apiKey, temperature, topP, maxTokens, history, signal, modelDisplayName } = options;
  if (!apiKey.trim()) {
    yield { type: 'error', content: '⚠ 请在左侧填入 Anthropic API Key\n获取地址：https://console.anthropic.com/settings/keys' };
    return;
  }

  const model = MODELS.find((m) => m.id === 'claude')?.apiModel || 'claude-sonnet-4-5';

  // Claude messages 数组只允许 user/assistant; system 用顶层字段
  const messagesForApi = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: text },
  ];

  let res: Response;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(),
        'anthropic-version': '2023-06-01',
        // Anthropic 官方允许浏览器直接调用 (会有安全提示)
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        system: systemContent(modelDisplayName || 'Claude'),
        messages: messagesForApi,
        max_tokens: maxTokens,
        temperature,
        top_p: topP,
        stream: true,
      }),
      signal,
    });
  } catch (e) {
    yield {
      type: 'error',
      content: `⚠ 网络错误：${(e as Error).message}\n如果是 CORS，请用本地服务器运行或配置代理后端。`,
    };
    return;
  }

  if (!res.ok) {
    const errText = await res.text();
    yield { type: 'error', content: `⚠ Anthropic API 错误 ${res.status}：${errText.slice(0, 300)}` };
    return;
  }

  for await (const data of readSSE(res)) {
    try {
      const json = JSON.parse(data);
      if (json.type === 'content_block_delta') {
        const delta = json.delta?.text || '';
        if (delta) yield { type: 'delta', content: delta };
      } else if (json.type === 'message_stop') {
        return;
      } else if (json.type === 'error') {
        yield { type: 'error', content: `⚠ Anthropic 流错误：${json.error?.message || 'unknown'}` };
        return;
      }
    } catch {
      /* ignore */
    }
  }
}

export async function* streamMock(text: string, signal: AbortSignal): AsyncGenerator<StreamChunk> {
  const full = pickMock(text);
  let i = 0;
  while (i < full.length) {
    if (signal.aborted) break;
    const next = Math.min(full.length, i + Math.max(1, Math.floor(Math.random() * 4)));
    yield { type: 'delta', content: full.slice(i, next) };
    i = next;
    await new Promise((r) => setTimeout(r, 18));
  }
}

export function streamChat(modelId: string, options: StreamOptions): AsyncGenerator<StreamChunk> {
  switch (modelId) {
    case 'deepseek':
      return streamDeepSeek(options);
    case 'claude':
      return streamClaude(options);
    case 'gpt':
      return streamOpenAI(options);
    case 'ollama':
      return streamOllama(options);
    default:
      return streamMock(options.text, options.signal);
  }
}

export async function* streamOllama(options: StreamOptions): AsyncGenerator<StreamChunk> {
  const { text, temperature, topP, maxTokens, history, signal, ollamaBaseUrl, ollamaModel } = options;
  const baseUrl = (ollamaBaseUrl || 'http://localhost:11434').replace(/\/+$/, '');
  if (!ollamaModel || !ollamaModel.trim()) {
    yield {
      type: 'error',
      content: '⚠ 请在左侧选择一个 Ollama 本地模型。\n\n如果下拉为空，请先在终端运行：`ollama pull llama3.2` 然后点刷新。',
    };
    return;
  }

  const messagesForApi = [
    { role: 'system', content: systemContent(ollamaModel.trim()) },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: text },
  ];

  let res: Response;
  try {
    res = await fetch(baseUrl + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel.trim(),
        messages: messagesForApi,
        stream: true,
        options: {
          temperature,
          top_p: topP,
          num_predict: maxTokens,
        },
      }),
      signal,
    });
  } catch (e) {
    yield {
      type: 'error',
      content:
        `⚠ 无法连接 Ollama (${baseUrl})：${(e as Error).message}\n\n请确认：\n1. Ollama 已启动 (终端运行 \`ollama serve\`)\n2. 浏览器可访问该地址\n3. 如从其他域名访问，需设置环境变量 \`OLLAMA_ORIGINS=*\` 后重启 Ollama`,
    };
    return;
  }

  if (!res.ok) {
    const errText = await res.text();
    yield { type: 'error', content: `⚠ Ollama 错误 ${res.status}：${errText.slice(0, 300)}` };
    return;
  }

  // Ollama 返回 NDJSON（每行一个 JSON），不是 SSE
  const reader = res.body!.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop()!;
    for (const line of lines) {
      const s = line.trim();
      if (!s) continue;
      try {
        const json = JSON.parse(s);
        const delta = json.message?.content || '';
        if (delta) yield { type: 'delta', content: delta };
        if (json.done) return;
      } catch {
        /* ignore partial */
      }
    }
  }
}

export interface OllamaModelInfo {
  name: string;
  size?: number;
  modified_at?: string;
}

export async function listOllamaModels(baseUrl: string): Promise<OllamaModelInfo[]> {
  const url = (baseUrl || 'http://localhost:11434').replace(/\/+$/, '') + '/api/tags';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return Array.isArray(json.models) ? json.models : [];
}
