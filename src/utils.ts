export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function fmtSize(b: number): string {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1024 / 1024).toFixed(2) + ' MB';
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getSystemPrompt(modelDisplayName?: string): { role: 'system'; content: string } {
  const now = new Date();
  const dateStr = now.toLocaleString('zh-CN', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
  const who = modelDisplayName
    ? `You are ${modelDisplayName}, integrated into "Synapse AI Studio".`
    : `You are an AI assistant integrated into "Synapse AI Studio".`;
  return {
    role: 'system',
    content:
      `${who}\n` +
      `The current date and time is: ${dateStr} (user's local timezone).\n` +
      `When the user asks about the current date, time, year, or "today", you MUST answer based on this information, NOT your training cutoff.\n` +
      `Respond in the same language the user uses (Chinese or English). Use Markdown formatting and code blocks when helpful.`,
  };
}
