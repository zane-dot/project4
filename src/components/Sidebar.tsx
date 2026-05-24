import { useEffect, useState, useCallback } from 'react';
import { useChat } from '../store/ChatContext';
import { MODELS } from '../constants';
import { listOllamaModels, type OllamaModelInfo } from '../services/chatApi';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const {
    currentModel,
    temperature,
    topP,
    maxTokens,
    apiKeys,
    ollamaBaseUrl,
    ollamaModel,
    sessionStats,
    dispatch,
  } = useChat();

  const currentModelCfg = MODELS.find((m) => m.id === currentModel);

  const [ollamaList, setOllamaList] = useState<OllamaModelInfo[]>([]);
  const [ollamaLoading, setOllamaLoading] = useState(false);
  const [ollamaError, setOllamaError] = useState<string | null>(null);

  const refreshOllama = useCallback(async () => {
    setOllamaLoading(true);
    setOllamaError(null);
    try {
      const models = await listOllamaModels(ollamaBaseUrl);
      setOllamaList(models);
      // 默认选中第一个
      if (!ollamaModel && models.length > 0) {
        dispatch({ type: 'SET_OLLAMA_MODEL', payload: models[0].name });
      }
    } catch (e) {
      setOllamaError((e as Error).message);
      setOllamaList([]);
    } finally {
      setOllamaLoading(false);
    }
  }, [ollamaBaseUrl, ollamaModel, dispatch]);

  useEffect(() => {
    if (currentModel === 'ollama') {
      refreshOllama();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentModel, ollamaBaseUrl]);

  return (
    <aside className={`sidebar glass ${className}`}>
      <h3 className="side-title">⚙ Model</h3>
      <div className="model-list">
        {MODELS.map((m) => (
          <div
            key={m.id}
            className={`model-card ${currentModel === m.id ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_MODEL', payload: m.id })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') dispatch({ type: 'SET_MODEL', payload: m.id });
            }}
          >
            <div className="m-name">
              {m.name}
              {m.live && <span className="badge-live">LIVE</span>}
            </div>
            <div className="m-meta">{m.provider}</div>
          </div>
        ))}
      </div>

      {currentModel === 'ollama' && (
        <div className="api-key-box">
          <label>🖥 Ollama 服务地址</label>
          <input
            type="text"
            value={ollamaBaseUrl}
            onChange={(e) => dispatch({ type: 'SET_OLLAMA_URL', payload: e.target.value })}
            placeholder="http://localhost:11434"
            autoComplete="off"
          />
          <label style={{ marginTop: 8 }}>
            🧩 本地模型
            <button
              type="button"
              onClick={refreshOllama}
              disabled={ollamaLoading}
              style={{
                marginLeft: 8,
                padding: '2px 8px',
                fontSize: 12,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 4,
                color: 'inherit',
                cursor: 'pointer',
              }}
            >
              {ollamaLoading ? '…' : '↻ 刷新'}
            </button>
          </label>
          <select
            value={ollamaModel}
            onChange={(e) => dispatch({ type: 'SET_OLLAMA_MODEL', payload: e.target.value })}
            style={{
              width: '100%',
              padding: '6px 8px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 6,
              color: 'inherit',
            }}
          >
            {ollamaList.length === 0 && <option value="">(无可用模型)</option>}
            {ollamaList.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
          {ollamaError ? (
            <div className="api-hint" style={{ color: '#f88' }}>
              连接失败：{ollamaError}。请确认 Ollama 已启动且设了 OLLAMA_ORIGINS=*
            </div>
          ) : (
            <div className="api-hint">
              调用本地 Ollama 服务。下拉为空时，在终端运行：<code>ollama pull llama3.2</code>
            </div>
          )}
        </div>
      )}

      {currentModelCfg?.live && currentModel !== 'ollama' && currentModelCfg.keyLabel && (
        <div className="api-key-box">
          <label>🔑 {currentModelCfg.keyLabel}</label>
          <input
            type="password"
            value={apiKeys[currentModel] || ''}
            onChange={(e) =>
              dispatch({ type: 'SET_API_KEY', payload: { modelId: currentModel, key: e.target.value } })
            }
            placeholder={currentModelCfg.keyPlaceholder || 'sk-...'}
            autoComplete="off"
            spellCheck={false}
          />
          <div className="api-hint">
            {apiKeys[currentModel] ? (
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: 'SET_API_KEY', payload: { modelId: currentModel, key: '' } })
                }
                style={{
                  padding: '2px 8px',
                  fontSize: 12,
                  background: 'rgba(255,80,80,0.12)',
                  border: '1px solid rgba(255,80,80,0.3)',
                  borderRadius: 4,
                  color: '#f88',
                  cursor: 'pointer',
                }}
              >
                清除 Key
              </button>
            ) : null}
            {currentModelCfg.keyHelpUrl && (
              <>
                {' '}
                <a href={currentModelCfg.keyHelpUrl} target="_blank" rel="noreferrer">
                  获取 Key →
                </a>
              </>
            )}
            <div style={{ marginTop: 4, opacity: 0.7 }}>
              ⚠ Key 仅保存在本机 localStorage，请勿在公共/共享设备使用。
            </div>
          </div>
        </div>
      )}

      <h3 className="side-title">🎛 Parameters</h3>
      <div className="slider-row">
        <label>
          Temperature <span>{temperature}</span>
        </label>
        <input
          type="range"
          min={0}
          max={2}
          step={0.1}
          value={temperature}
          onChange={(e) =>
            dispatch({ type: 'SET_PARAM', payload: { key: 'temperature', value: parseFloat(e.target.value) } })
          }
        />
      </div>
      <div className="slider-row">
        <label>
          Top-P <span>{topP}</span>
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={topP}
          onChange={(e) =>
            dispatch({ type: 'SET_PARAM', payload: { key: 'topP', value: parseFloat(e.target.value) } })
          }
        />
      </div>
      <div className="slider-row">
        <label>
          Max Tokens <span>{maxTokens}</span>
        </label>
        <input
          type="range"
          min={256}
          max={8192}
          step={256}
          value={maxTokens}
          onChange={(e) =>
            dispatch({ type: 'SET_PARAM', payload: { key: 'maxTokens', value: parseInt(e.target.value) } })
          }
        />
      </div>

      <h3 className="side-title">📊 Session</h3>
      <div className="stats">
        <div className="stat">
          <div className="v">{sessionStats.msgCount}</div>
          <div className="l">Messages</div>
        </div>
        <div className="stat">
          <div className="v">{sessionStats.tokCount}</div>
          <div className="l">Tokens</div>
        </div>
      </div>
    </aside>
  );
}
