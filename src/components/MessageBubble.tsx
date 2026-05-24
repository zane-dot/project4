import { useState } from 'react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../types';

interface MessageBubbleProps {
  msg: Message;
}

function nodeToString(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeToString).join('');
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return nodeToString(props.children);
  }
  return '';
}

function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const textContent = nodeToString(children).replace(/\n$/, '');
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <pre className={className}>
      <button className="code-copy" onClick={handleCopy} type="button">
        {copied ? '✓ Copied' : 'Copy'}
      </button>
      <code className={className}>{textContent}</code>
    </pre>
  );
}

export default function MessageBubble({ msg }: MessageBubbleProps) {
  return (
    <div className={`msg ${msg.role}`}>
      <div className="avatar">{msg.role === 'user' ? 'U' : 'AI'}</div>
      <div className="bubble">
        {msg.content === '' ? (
          <div className="typing">
            <span />
            <span />
            <span />
          </div>
        ) : msg.role === 'assistant' ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              pre({ children }) {
                const child = React.Children.toArray(children).find(React.isValidElement) as
                  | React.ReactElement<{ className?: string; children?: React.ReactNode }>
                  | undefined;
                if (child) {
                  return (
                    <CodeBlock className={child.props.className}>{child.props.children}</CodeBlock>
                  );
                }
                return <pre>{children}</pre>;
              },
              code({ children, className }) {
                const isInline = !className;
                return isInline ? (
                  <code>{children}</code>
                ) : (
                  <code className={className}>{children}</code>
                );
              },
            }}
          >
            {msg.content}
          </ReactMarkdown>
        ) : (
          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
        )}
      </div>
    </div>
  );
}
