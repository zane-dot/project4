import { useRef, useState, useCallback } from 'react';
import { useChat } from '../store/ChatContext';
import { fmtSize } from '../utils';

const ACCEPT = '.txt,.md,.json,.csv,.log,.xml,.yml,.yaml,.html,.css,.js,.ts,.jsx,.tsx,.vue,.py,.java,.c,.cpp,.h,.go,.rs,.rb,.php,.sql,.sh,.bat,.ini,.env,.toml';

export default function Composer() {
  const { sendMessage, stopGeneration, isLoading, attachments, addAttachments, removeAttachment, newConversation } = useChat();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(async () => {
    if (!text.trim() && attachments.length === 0) return;
    const toSend = text;
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(toSend);
  }, [text, attachments.length, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const toggleCodeBlock = () => {
    const el = textareaRef.current;
    if (!el) return;
    const v = el.value;
    if (!v.trim()) {
      setText('```\n\n```');
    } else if (v.startsWith('```')) {
      setText(v.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, ''));
    } else {
      setText('```\n' + v + '\n```');
    }
    requestAnimationFrame(() => {
      handleInput();
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  };

  return (
    <div className="composer">
      <div className="composer-inner glass">
        <div id="attachList" className="attach-list">
          {attachments.map((a) => (
            <span key={a.id} className="attach-chip">
              <span>📄</span>
              <span className="fname" title={a.name}>{a.name}</span>
              <span className="fsize">{fmtSize(a.size)}</span>
              <button
                className="rm"
                title="移除"
                onClick={() => removeAttachment(a.id)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleInput();
          }}
          onKeyDown={handleKeyDown}
          placeholder="给 AI 发送一条消息...  (⌘/Ctrl + Enter 发送)"
          rows={1}
          disabled={isLoading}
        />
        <div className="composer-actions">
          <div className="tools">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              accept={ACCEPT}
              onChange={(e) => {
                addAttachments(e.target.files);
                e.currentTarget.value = '';
              }}
            />
            <button
              className="tool"
              title="上传文本/代码文件"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              type="button"
            >
              📎
            </button>
            <button
              className="tool"
              title="包裹为代码块"
              onClick={toggleCodeBlock}
              disabled={isLoading}
              type="button"
            >
              {'{ }'}
            </button>
            <button
              className="tool"
              title="新对话"
              onClick={newConversation}
              disabled={isLoading}
              type="button"
            >
              ⟳
            </button>
          </div>
          {isLoading ? (
            <button className="stop-btn" onClick={stopGeneration} type="button">
              <span>■</span>
              <span>停止</span>
            </button>
          ) : (
            <button className="send" onClick={handleSend} type="button">
              <span>发送</span>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  d="M3 12L21 4L14 21L11 13L3 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
