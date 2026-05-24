/* ============ Synapse · App Logic ============ */

/* ---------- 粒子背景 ---------- */
(function particles(){
  const cvs = document.getElementById('particles');
  const ctx = cvs.getContext('2d');
  let w, h, parts = [];
  function resize(){ w = cvs.width = innerWidth; h = cvs.height = innerHeight; }
  resize(); addEventListener('resize', resize);

  for (let i = 0; i < 60; i++) {
    parts.push({
      x: Math.random()*w, y: Math.random()*h,
      vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3,
      r: Math.random()*1.5+.5,
      c: Math.random() > .5 ? '168,85,247' : '34,211,238'
    });
  }
  function tick(){
    ctx.clearRect(0,0,w,h);
    parts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>w) p.vx*=-1;
      if(p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${p.c},.6)`;
      ctx.shadowBlur=8; ctx.shadowColor=`rgba(${p.c},.8)`;
      ctx.fill();
    });
    // 连线
    for(let i=0;i<parts.length;i++){
      for(let j=i+1;j<parts.length;j++){
        const dx=parts[i].x-parts[j].x, dy=parts[i].y-parts[j].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<120){
          ctx.beginPath();
          ctx.moveTo(parts[i].x,parts[i].y);
          ctx.lineTo(parts[j].x,parts[j].y);
          ctx.strokeStyle=`rgba(168,85,247,${.15*(1-d/120)})`;
          ctx.lineWidth=.5; ctx.shadowBlur=0;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ---------- 视图切换 ---------- */
document.querySelectorAll('.pill').forEach(p=>{
  p.addEventListener('click', ()=>{
    document.querySelectorAll('.pill').forEach(x=>x.classList.remove('active'));
    p.classList.add('active');
    const v = p.dataset.view;
    document.querySelectorAll('.panel').forEach(panel=>panel.classList.add('hidden'));
    document.getElementById('view-'+v).classList.remove('hidden');
  });
});

/* ---------- 模型选择 ---------- */
const MODEL_LABELS = {
  deepseek:'DeepSeek Chat · LIVE',
  claude:'Claude Sonnet · Mock',
  gpt:'GPT-4o · Mock',
  llama:'Llama 3.1 · Mock'
};
let currentModel = 'deepseek';
const apiKeyBox = document.getElementById('apiKeyBox');
const apiKeyInput = document.getElementById('apiKey');
// 加载已保存 key
apiKeyInput.value = localStorage.getItem('deepseek_key') || '';
apiKeyInput.addEventListener('input',()=>{
  localStorage.setItem('deepseek_key', apiKeyInput.value.trim());
});
function updateApiKeyVisibility(){
  apiKeyBox.style.display = currentModel === 'deepseek' ? 'block' : 'none';
}
updateApiKeyVisibility();

document.querySelectorAll('.model-card').forEach(c=>{
  c.addEventListener('click',()=>{
    document.querySelectorAll('.model-card').forEach(x=>x.classList.remove('active'));
    c.classList.add('active');
    currentModel = c.dataset.model;
    document.getElementById('modelLabel').textContent = MODEL_LABELS[currentModel];
    updateApiKeyVisibility();
  });
});

/* ---------- 滑块 ---------- */
const bind=(id,target)=>{
  const el=document.getElementById(id), t=document.getElementById(target);
  el.addEventListener('input',()=>t.textContent=el.value);
};
bind('temp','tempVal'); bind('topp','topVal'); bind('tok','tokVal');

/* ---------- 聊天 ---------- */
const chatArea = document.getElementById('chatArea');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
let msgCount = 0, tokCount = 0;
let conversationStarted = false;

function escapeHtml(s){return s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
function renderMarkdown(t){
  // 极简 markdown: code block / inline code / bold
  t = escapeHtml(t);
  t = t.replace(/```(\w+)?\n([\s\S]*?)```/g,(_,l,c)=>`<pre><code>${c}</code></pre>`);
  t = t.replace(/`([^`]+)`/g,'<code>$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');
  t = t.replace(/\n/g,'<br>');
  return t;
}
function addMsg(role, text, isTyping=false){
  if(!conversationStarted){
    chatArea.innerHTML = '';
    conversationStarted = true;
  }
  const wrap = document.createElement('div');
  wrap.className = 'msg ' + role;
  wrap.innerHTML = `
    <div class="avatar">${role==='user'?'U':'AI'}</div>
    <div class="bubble">${isTyping
      ? '<div class="typing"><span></span><span></span><span></span></div>'
      : renderMarkdown(text)}</div>`;
  chatArea.appendChild(wrap);
  chatArea.scrollTop = chatArea.scrollHeight;
  return wrap;
}

const MOCK_RESPONSES = {
  default: `好问题！让我为你详细解答 ✨\n\n这是一个用 **Synapse AI Studio** 模拟的回复。在真实场景中，这里会通过 \`fetch\` 调用：\n\n\`\`\`javascript\nawait fetch('/api/chat', {\n  method:'POST',\n  body: JSON.stringify({ model, messages, temperature })\n})\n\`\`\`\n\n支持的后端：**Anthropic Claude API**、**OpenAI**、**Ollama 本地**、**vLLM 自托管**。`,
  code: `这是一个 React Todo 示例：\n\n\`\`\`jsx\nfunction Todo(){\n  const [list,setList] = useState([]);\n  const [text,setText] = useState('');\n  return (\n    <div>\n      <input value={text} onChange={e=>setText(e.target.value)} />\n      <button onClick={()=>setList([...list,text])}>Add</button>\n      <ul>{list.map((t,i)=><li key={i}>{t}</li>)}</ul>\n    </div>\n  );\n}\n\`\`\`\n\n用 \`useState\` 管理状态，几行代码完成 ✅`,
  prompt: `**Prompt 优化建议** 🎯\n\n1. **角色化**：开头声明 \`You are an expert ...\`\n2. **结构化**：用 XML/Markdown 切分 \`<context>\` \`<task>\` \`<format>\`\n3. **少样本**：给 2-3 个 input/output 示例\n4. **思维链**：加入 \`Let's think step by step\`\n5. **约束输出**：指定 JSON Schema 或字数`,
  transformer: `**Transformer 注意力机制** 🧠\n\n核心公式：\n\n\`\`\`\nAttention(Q,K,V) = softmax(QK^T / √d_k) V\n\`\`\`\n\n- **Q (Query)**：当前 token 想"问"什么\n- **K (Key)**：每个 token 提供的"索引"\n- **V (Value)**：实际"内容"\n\n通过 Q·K 算相似度，softmax 归一化得权重，再加权 V。**多头**让模型并行关注不同子空间。`
};
function pickMock(text){
  const t = text.toLowerCase();
  if(t.includes('react')||t.includes('todo')||t.includes('代码')) return MOCK_RESPONSES.code;
  if(t.includes('prompt')||t.includes('提示词')) return MOCK_RESPONSES.prompt;
  if(t.includes('transformer')||t.includes('注意力')) return MOCK_RESPONSES.transformer;
  return MOCK_RESPONSES.default;
}

/* ---------- 对话历史 (供真实 API 使用) ---------- */
const history = [];

/* ---------- DeepSeek 真实流式调用 ---------- */
async function callDeepSeek(text, bubble){
  const key = (localStorage.getItem('deepseek_key') || '').trim();
  if(!key){
    bubble.innerHTML = '<b style="color:#f87171">⚠ 请在左侧填入 DeepSeek API Key</b><br>获取地址：<code>https://platform.deepseek.com/api_keys</code>';
    return;
  }
  history.push({ role:'user', content:text });
  const temperature = parseFloat(document.getElementById('temp').value);
  const max_tokens  = parseInt(document.getElementById('tok').value);

  // 注入 system prompt：告知模型真实当前时间 & 角色定位
  const now = new Date();
  const dateStr = now.toLocaleString('zh-CN', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year:'numeric', month:'2-digit', day:'2-digit',
    weekday:'long', hour:'2-digit', minute:'2-digit'
  });
  const systemPrompt = {
    role:'system',
    content:`You are DeepSeek Chat, integrated into "Synapse AI Studio".
The current date and time is: ${dateStr} (user's local timezone).
When the user asks about the current date, time, year, or "today", you MUST answer based on this information, NOT your training cutoff.
Respond in the same language the user uses (Chinese or English). Use Markdown formatting and code blocks when helpful.`
  };
  const messagesForApi = [systemPrompt, ...history];

  let res;
  try{
    res = await fetch('https://api.deepseek.com/chat/completions', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':'Bearer ' + key
      },
      body: JSON.stringify({
        model:'deepseek-chat',
        messages: messagesForApi,
        temperature,
        max_tokens,
        stream:true
      })
    });
  } catch(e){
    bubble.innerHTML = `<b style="color:#f87171">⚠ 网络错误：</b>${escapeHtml(e.message)}<br><span style="color:var(--txt-dim);font-size:12px">如果是 CORS，请用本地服务器运行：<code>python -m http.server 8080</code></span>`;
    return;
  }
  if(!res.ok){
    const errText = await res.text();
    bubble.innerHTML = `<b style="color:#f87171">⚠ API 错误 ${res.status}：</b>${escapeHtml(errText.slice(0,300))}`;
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '', full = '';
  bubble.innerHTML = '';

  while(true){
    const { value, done } = await reader.read();
    if(done) break;
    buffer += decoder.decode(value, { stream:true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for(const line of lines){
      const s = line.trim();
      if(!s || !s.startsWith('data:')) continue;
      const data = s.slice(5).trim();
      if(data === '[DONE]') continue;
      try{
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content || '';
        if(delta){
          full += delta;
          bubble.innerHTML = renderMarkdown(full);
          chatArea.scrollTop = chatArea.scrollHeight;
        }
      } catch(_){/* 忽略不完整 JSON */}
    }
  }
  history.push({ role:'assistant', content:full });
  tokCount += Math.ceil(full.length/3);
  document.getElementById('statTok').textContent = tokCount;
}

/* ---------- Mock 流式（其他模型） ---------- */
async function mockStream(text, bubble){
  const full = pickMock(text);
  let i = 0;
  return new Promise(resolve=>{
    const iv = setInterval(()=>{
      i += Math.max(1, Math.floor(Math.random()*4));
      bubble.innerHTML = renderMarkdown(full.slice(0,i));
      chatArea.scrollTop = chatArea.scrollHeight;
      if(i >= full.length){
        clearInterval(iv);
        tokCount += Math.ceil(full.length/3);
        document.getElementById('statTok').textContent = tokCount;
        resolve();
      }
    },18);
  });
}

async function streamResponse(text){
  const node = addMsg('ai','',true);
  const bubble = node.querySelector('.bubble');
  await new Promise(r=>setTimeout(r,300));
  bubble.innerHTML = '';
  if(currentModel === 'deepseek'){
    await callDeepSeek(text, bubble);
  } else {
    await mockStream(text, bubble);
  }
}

async function send(text){
  text = (text ?? input.value).trim();
  if(!text && attachments.length === 0) return;

  // 拼接附件内容到消息末尾（发给模型的完整 prompt）
  let fullText = text;
  if(attachments.length){
    const parts = attachments.map(a =>
      `\n\n--- 📄 File: ${a.name} (${fmtSize(a.size)}) ---\n\`\`\`${a.lang}\n${a.content}\n\`\`\``
    );
    fullText = (text || '请帮我分析以下文件：') + parts.join('');
  }

  // 在气泡里显示用户可读版本（避免巨长文件刷屏）
  const displayText = attachments.length
    ? (text || '(已附加文件)') + '\n\n' +
      attachments.map(a=>`📎 \`${a.name}\` · ${fmtSize(a.size)}`).join('\n')
    : text;

  input.value=''; input.style.height='auto';
  addMsg('user', displayText);
  attachments = []; renderAttachments();
  msgCount++;
  document.getElementById('statMsg').textContent = msgCount;
  await streamResponse(fullText);
}

sendBtn.addEventListener('click',()=>send());
input.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey) && e.key==='Enter'){ e.preventDefault(); send(); }
});
input.addEventListener('input',()=>{
  input.style.height='auto';
  input.style.height = Math.min(input.scrollHeight,160)+'px';
});
clearBtn.addEventListener('click',()=>{
  location.reload();
});

/* ---------- 附件上传 ---------- */
const fileInput = document.getElementById('fileInput');
const attachBtn = document.getElementById('attachBtn');
const attachList = document.getElementById('attachList');
const codeBtn   = document.getElementById('codeBtn');
let attachments = []; // { name, size, content, lang }

const EXT_LANG = {
  js:'javascript', ts:'typescript', jsx:'jsx', tsx:'tsx', vue:'vue',
  py:'python', java:'java', c:'c', cpp:'cpp', h:'c', go:'go', rs:'rust',
  rb:'ruby', php:'php', sql:'sql', sh:'bash', bat:'bat',
  html:'html', css:'css', json:'json', xml:'xml', yml:'yaml', yaml:'yaml',
  md:'markdown', csv:'csv', toml:'toml', ini:'ini', env:'bash', log:'text', txt:'text'
};
const MAX_FILE_SIZE = 256 * 1024; // 256KB

function fmtSize(b){
  if(b < 1024) return b + ' B';
  if(b < 1024*1024) return (b/1024).toFixed(1) + ' KB';
  return (b/1024/1024).toFixed(2) + ' MB';
}
function renderAttachments(){
  attachList.innerHTML = '';
  attachments.forEach((a, idx)=>{
    const chip = document.createElement('span');
    chip.className = 'attach-chip';
    chip.innerHTML = `
      <span>📄</span>
      <span class="fname" title="${escapeHtml(a.name)}">${escapeHtml(a.name)}</span>
      <span class="fsize">${fmtSize(a.size)}</span>
      <button class="rm" title="移除">×</button>`;
    chip.querySelector('.rm').addEventListener('click',()=>{
      attachments.splice(idx,1); renderAttachments();
    });
    attachList.appendChild(chip);
  });
}

attachBtn.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change', async (e)=>{
  const files = Array.from(e.target.files || []);
  for(const f of files){
    if(f.size > MAX_FILE_SIZE){
      alert(`「${f.name}」超过 256KB，已跳过。请上传更小的文本/代码文件。`);
      continue;
    }
    try{
      const content = await f.text();
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      attachments.push({
        name:f.name, size:f.size, content,
        lang: EXT_LANG[ext] || 'text'
      });
    } catch(err){
      alert(`读取「${f.name}」失败：${err.message}`);
    }
  }
  fileInput.value = '';   // 允许重复选同一个文件
  renderAttachments();
});

/* ---------- 代码块按钮：把当前输入包裹成 ``` 代码块 ---------- */
codeBtn.addEventListener('click',()=>{
  const v = input.value;
  if(!v.trim()){
    input.value = '```\n\n```';
    input.focus();
    input.setSelectionRange(4, 4);
  } else if(v.startsWith('```')){
    // 已经是代码块，剥离
    input.value = v.replace(/^```[a-z]*\n?/,'').replace(/\n?```$/,'');
  } else {
    input.value = '```\n' + v + '\n```';
  }
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 160) + 'px';
  input.focus();
});

document.querySelectorAll('.qp').forEach(b=>{
  b.addEventListener('click',()=>send(b.textContent.replace(/^[^\s]+\s/,'')));
});

/* ---------- Prompt 库 ---------- */
const PROMPTS = [
  {icon:'🎯',title:'Code Reviewer',tag:'CODE',desc:'扮演资深工程师，从可读性/性能/安全三维度审查代码并给出 diff 建议。',
   body:'You are a senior software engineer. Review the following code along three dimensions: readability, performance, and security. Output as a markdown diff with explanations.\n\n<code>\n[paste here]\n</code>'},
  {icon:'📝',title:'Prompt Optimizer',tag:'META',desc:'分析现有 Prompt 并重写为更结构化、更高效的版本。',
   body:'Analyze the prompt below and rewrite it using best practices: role assignment, structured tags, few-shot examples, and explicit output format.\n\nOriginal: [your prompt]'},
  {icon:'🐛',title:'Bug Detective',tag:'DEBUG',desc:'根据错误信息和上下文，推理根因并给出修复方案。',
   body:'Act as a debugging detective. Given the error and code, list 3 hypotheses ordered by likelihood, then propose a fix.\n\nError:\nCode:'},
  {icon:'🏗',title:'System Designer',tag:'ARCH',desc:'设计可扩展的系统架构，包含组件图、数据流和取舍分析。',
   body:'Design a scalable system for: [feature]. Include: 1) component diagram (mermaid), 2) data flow, 3) trade-offs, 4) failure modes.'},
  {icon:'📊',title:'Data Analyst',tag:'DATA',desc:'分析数据集并产出关键洞察与可视化建议。',
   body:'You are a senior data analyst. Given this dataset description: [...], identify 5 key insights and recommend visualization types for each.'},
  {icon:'🎨',title:'UI Critic',tag:'DESIGN',desc:'从可用性、对比度、布局节奏点评界面截图。',
   body:'Critique this UI design from three perspectives: usability heuristics, color contrast, and layout rhythm. Suggest 3 actionable improvements.'},
  {icon:'📚',title:'Tech Explainer',tag:'EDU',desc:'用三层递进 (ELI5 → Engineer → Expert) 讲解技术概念。',
   body:'Explain [concept] in three progressive layers: 1) Explain Like I\'m 5, 2) Engineer-level, 3) Expert deep-dive with formulas.'},
  {icon:'⚡',title:'API Architect',tag:'API',desc:'生成 RESTful / GraphQL API 设计，含字段、状态码、示例。',
   body:'Design a REST API for [domain]. Include: endpoints, HTTP methods, request/response schemas, status codes, and 2 example calls.'},
];
const grid = document.getElementById('promptGrid');
PROMPTS.forEach(p=>{
  const el = document.createElement('div');
  el.className='prompt-card';
  el.innerHTML = `
    <div class="pc-icon">${p.icon}</div>
    <div class="pc-title">${p.title}</div>
    <div class="pc-desc">${p.desc}</div>
    <span class="pc-tag">${p.tag}</span>`;
  el.addEventListener('click',()=>{
    // 先切换到 chat 面板，再设值 & 重算高度
    // （隐藏元素的 scrollHeight 为 0，会把 textarea 撑成 0px）
    document.querySelector('.pill[data-view="chat"]').click();
    requestAnimationFrame(()=>{
      input.value = p.body;
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 160) + 'px';
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });
  });
  grid.appendChild(el);
});
