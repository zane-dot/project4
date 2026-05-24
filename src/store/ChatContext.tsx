import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import type { Message, Attachment, View, ApiKeyMap } from '../types';
import { MODELS, DEFAULT_MODEL, MAX_FILE_SIZE, EXT_LANG, OLLAMA_DEFAULT_URL } from '../constants';
import { generateId, fmtSize } from '../utils';
import { streamChat, streamMock } from '../services/chatApi';

interface ChatState {
  messages: Message[];
  currentModel: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  apiKeys: ApiKeyMap;
  ollamaBaseUrl: string;
  ollamaModel: string;
  isLoading: boolean;
  activeView: View;
  attachments: Attachment[];
  sessionStats: { msgCount: number; tokCount: number };
}

type ChatAction =
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'SET_PARAM'; payload: { key: 'temperature' | 'topP' | 'maxTokens'; value: number } }
  | { type: 'SET_API_KEY'; payload: { modelId: string; key: string } }
  | { type: 'SET_OLLAMA_URL'; payload: string }
  | { type: 'SET_OLLAMA_MODEL'; payload: string }
  | { type: 'SET_VIEW'; payload: View }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; content: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_ATTACHMENT'; payload: Attachment }
  | { type: 'REMOVE_ATTACHMENT'; payload: string }
  | { type: 'CLEAR_ATTACHMENTS' }
  | { type: 'NEW_CONVERSATION' }
  | { type: 'LOAD_STATE'; payload: Partial<ChatState> }
  | { type: 'ADD_TOKENS'; payload: number };

function loadInitialState(): ChatState {
  const base: ChatState = {
    messages: [],
    currentModel: DEFAULT_MODEL,
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    apiKeys: {},
    ollamaBaseUrl: OLLAMA_DEFAULT_URL,
    ollamaModel: '',
    isLoading: false,
    activeView: 'chat',
    attachments: [],
    sessionStats: { msgCount: 0, tokCount: 0 },
  };
  try {
    const raw = localStorage.getItem('synapse_session_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      // 兼容旧版本：apiKey -> apiKeys.deepseek
      if (typeof parsed.apiKey === 'string' && !parsed.apiKeys) {
        parsed.apiKeys = { deepseek: parsed.apiKey };
        delete parsed.apiKey;
      }
      // 迁移旧 'llama' 模型 id
      if (parsed.currentModel === 'llama') {
        parsed.currentModel = 'ollama';
      }
      return { ...base, ...parsed };
    }
  } catch {
    /* ignore */
  }
  return base;
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_MODEL':
      return { ...state, currentModel: action.payload };
    case 'SET_PARAM':
      return { ...state, [action.payload.key]: action.payload.value };
    case 'SET_API_KEY':
      return {
        ...state,
        apiKeys: { ...state.apiKeys, [action.payload.modelId]: action.payload.key },
      };
    case 'SET_OLLAMA_URL':
      return { ...state, ollamaBaseUrl: action.payload };
    case 'SET_OLLAMA_MODEL':
      return { ...state, ollamaModel: action.payload };
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };
    case 'ADD_MESSAGE': {
      return {
        ...state,
        messages: [...state.messages, action.payload],
        sessionStats: {
          ...state.sessionStats,
          msgCount: state.sessionStats.msgCount + 1,
        },
      };
    }
    case 'UPDATE_MESSAGE': {
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id ? { ...m, content: action.payload.content } : m
        ),
      };
    }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'ADD_ATTACHMENT':
      return { ...state, attachments: [...state.attachments, action.payload] };
    case 'REMOVE_ATTACHMENT':
      return { ...state, attachments: state.attachments.filter((a) => a.id !== action.payload) };
    case 'CLEAR_ATTACHMENTS':
      return { ...state, attachments: [] };
    case 'NEW_CONVERSATION':
      return { ...state, messages: [], sessionStats: { msgCount: 0, tokCount: 0 } };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    case 'ADD_TOKENS':
      return {
        ...state,
        sessionStats: { ...state.sessionStats, tokCount: state.sessionStats.tokCount + action.payload },
      };
    default:
      return state;
  }
}

interface ChatContextValue extends ChatState {
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (text: string) => Promise<void>;
  stopGeneration: () => void;
  newConversation: () => void;
  addAttachments: (files: FileList | null) => void;
  removeAttachment: (id: string) => void;
  currentModelConfig: (typeof MODELS)[number];
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, undefined, loadInitialState);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>(state.messages);

  useEffect(() => {
    messagesRef.current = state.messages;
  }, [state.messages]);

  useEffect(() => {
    const toSave = {
      messages: state.messages,
      currentModel: state.currentModel,
      temperature: state.temperature,
      topP: state.topP,
      maxTokens: state.maxTokens,
      apiKeys: state.apiKeys,
      ollamaBaseUrl: state.ollamaBaseUrl,
      ollamaModel: state.ollamaModel,
      sessionStats: state.sessionStats,
    };
    localStorage.setItem('synapse_session_v2', JSON.stringify(toSave));
  }, [state.messages, state.currentModel, state.temperature, state.topP, state.maxTokens, state.apiKeys, state.ollamaBaseUrl, state.ollamaModel, state.sessionStats]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const newConversation = useCallback(() => {
    stopGeneration();
    dispatch({ type: 'NEW_CONVERSATION' });
  }, [stopGeneration]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed && state.attachments.length === 0) return;

      let displayText = trimmed;
      let sendText = trimmed;

      if (state.attachments.length) {
        const parts = state.attachments.map(
          (a) =>
            `\n\n--- 📄 File: ${a.name} (${fmtSize(a.size)}) ---\n\`\`\`${a.lang}\n${a.content}\n\`\`\``
        );
        sendText = (trimmed || '请帮我分析以下文件：') + parts.join('');
        displayText =
          (trimmed || '(已附加文件)') +
          '\n\n' +
          state.attachments.map((a) => `📎 \`${a.name}\` · ${fmtSize(a.size)}`).join('\n');
      }

      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content: displayText,
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: userMsg });
      dispatch({ type: 'CLEAR_ATTACHMENTS' });
      dispatch({ type: 'SET_LOADING', payload: true });

      const assistantMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMsg });

      const model = MODELS.find((m) => m.id === state.currentModel);
      abortRef.current = new AbortController();

      try {
        const stream = model?.live
          ? streamChat(state.currentModel, {
              text: sendText,
              apiKey: state.apiKeys[state.currentModel] || '',
              temperature: state.temperature,
              topP: state.topP,
              maxTokens: state.maxTokens,
              history: messagesRef.current.filter((m) => m.id !== assistantMsg.id && m.id !== userMsg.id).concat(userMsg),
              signal: abortRef.current.signal,
              ollamaBaseUrl: state.ollamaBaseUrl,
              ollamaModel: state.ollamaModel,
              modelDisplayName: model.name,
            })
          : streamMock(sendText, abortRef.current.signal);

        let full = '';
        for await (const chunk of stream) {
          if (chunk.type === 'error') {
            dispatch({ type: 'UPDATE_MESSAGE', payload: { id: assistantMsg.id, content: chunk.content } });
            break;
          }
          full += chunk.content;
          dispatch({ type: 'UPDATE_MESSAGE', payload: { id: assistantMsg.id, content: full } });
        }
        dispatch({ type: 'ADD_TOKENS', payload: Math.ceil(full.length / 3) });
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: { id: assistantMsg.id, content: `⚠ 错误：${(e as Error).message}` },
          });
        }
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
        abortRef.current = null;
      }
    },
    [state.attachments, state.currentModel, state.temperature, state.topP, state.maxTokens, state.apiKeys, state.ollamaBaseUrl, state.ollamaModel]
  );

  const addAttachments = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    const results = await Promise.all(
      arr.map(async (f) => {
        if (f.size > MAX_FILE_SIZE) {
          alert(`「${f.name}」超过 256KB，已跳过。请上传更小的文本/代码文件。`);
          return null;
        }
        try {
          const content = await f.text();
          const ext = (f.name.split('.').pop() || '').toLowerCase();
          const attachment: Attachment = {
            id: generateId(),
            name: f.name,
            size: f.size,
            content,
            lang: EXT_LANG[ext] || 'text',
          };
          return attachment;
        } catch (err) {
          alert(`读取「${f.name}」失败：${(err as Error).message}`);
          return null;
        }
      })
    );
    for (const a of results) {
      if (a) dispatch({ type: 'ADD_ATTACHMENT', payload: a });
    }
  }, []);

  const removeAttachment = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ATTACHMENT', payload: id });
  }, []);

  const currentModelConfig = MODELS.find((m) => m.id === state.currentModel) || MODELS[0];

  return (
    <ChatContext.Provider
      value={{
        ...state,
        dispatch,
        sendMessage,
        stopGeneration,
        newConversation,
        addAttachments,
        removeAttachment,
        currentModelConfig,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
