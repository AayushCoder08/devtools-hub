const searchInput = document.getElementById('searchInput');
const cards = [...document.querySelectorAll('.tool-card')];
const pills = [...document.querySelectorAll('.pill')];
const emptyState = document.getElementById('emptyState');
const toolCount = document.getElementById('toolCount');
const modal = document.getElementById('toolModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalStatus = document.getElementById('modalStatus');
let activeCategory = 'All';
let currentTool = '';

document.getElementById('year').textContent = new Date().getFullYear();
toolCount.textContent = String(cards.length).padStart(2, '0');

function filterTools() {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;
  cards.forEach(card => {
    const matchesQuery = (card.dataset.name + ' ' + card.dataset.description + ' ' + card.dataset.category).toLowerCase().includes(query);
    const matchesCategory = activeCategory === 'All' || card.dataset.category === activeCategory;
    const show = matchesQuery && matchesCategory;
    card.hidden = !show;
    if (show) visible++;
  });
  emptyState.hidden = visible > 0;
}
searchInput.addEventListener('input', filterTools);
pills.forEach(pill => pill.addEventListener('click', () => {
  activeCategory = pill.dataset.category;
  pills.forEach(p => p.classList.toggle('active', p === pill));
  filterTools();
}));

function setStatus(message) { modalStatus.textContent = message || ''; }
function openModal(tool) {
  currentTool = tool;
  setStatus('');
  modalBody.replaceChildren();
  const titles = {json:'JSON Formatter',words:'Word Counter',case:'Case Converter',qr:'QR Code Generator',image:'Image Compressor',base64:'Base64 Encoder / Decoder',password:'Password Generator'};
  modalTitle.textContent = titles[tool] || 'Quick Tool';
  const render = {
    json: () => {
      addLabel('Paste JSON'); const input = addTextarea('Paste JSON here...', 8, 'jsonInput');
      const actions = addActions([['Format JSON','primary',formatJSON],['Minify JSON','secondary',minifyJSON],['Copy result','secondary',copyResult]]);
      addLabel('Result'); addResult('jsonResult');
    },
    words: () => {
      addLabel('Enter or paste your text'); const input = addTextarea('Start typing or paste text...', 7, 'wordsInput');
      const stats = document.createElement('div'); stats.className = 'tool-stats'; stats.id = 'wordStats'; modalBody.append(stats);
      input.addEventListener('input', updateWordStats); updateWordStats();
    },
    case: () => {
      addLabel('Text to convert'); addTextarea('Type or paste text...', 6, 'caseInput');
      addActions([['UPPERCASE','primary',()=>transformCase('upper')],['lowercase','secondary',()=>transformCase('lower')],['Title Case','secondary',()=>transformCase('title')],['Sentence case','secondary',()=>transformCase('sentence')],['Copy result','secondary',copyResult]]);
      addLabel('Result'); addResult('caseResult');
    },
    qr: () => {
      addLabel('Text or URL'); addInput('https://example.com', 'qrInput');
      addActions([['Generate QR','primary',generateQR]]);
      addLabel('QR code'); const box = document.createElement('div'); box.className = 'qr-result'; box.id = 'qrResult'; modalBody.append(box);
      addNote('QR image generation uses an online QR service. Avoid putting passwords or sensitive information in the QR content.');
    },
    image: () => {
      addLabel('Choose an image'); const file = document.createElement('input'); file.type = 'file'; file.accept = 'image/*'; file.className = 'file-input'; file.id = 'imageInput'; modalBody.append(file);
      const row = document.createElement('div'); row.className = 'range-row'; row.innerHTML = '<label for="qualityInput" style="margin:0;min-width:90px">Quality: <span id="qualityValue">75%</span></label><input id="qualityInput" type="range" min="20" max="95" value="75">'; modalBody.append(row);
      document.getElementById('qualityInput').addEventListener('input', e=>document.getElementById('qualityValue').textContent=e.target.value+'%');
      addActions([['Compress image','primary',compressImage]]);
      addResult('imageResult');
      addNote('Image processing runs in your browser. Output is saved as JPEG; transparent areas may become white.');
    },
    base64: () => {
      addLabel('Text'); addTextarea('Enter text or Base64...', 5, 'base64Input');
      addActions([['Encode','primary',()=>doBase64('encode')],['Decode','secondary',()=>doBase64('decode')],['Copy result','secondary',copyResult]]);
      addLabel('Result'); addResult('base64Result');
    },
    password: () => {
      addLabel('Password length'); addInput('16','passwordLength','number');
      const row = document.createElement('div'); row.className='tool-stats'; row.innerHTML='<label><input type="checkbox" id="pwUpper" checked> Uppercase</label><label><input type="checkbox" id="pwLower" checked> Lowercase</label><label><input type="checkbox" id="pwNumbers" checked> Numbers</label><label><input type="checkbox" id="pwSymbols" checked> Symbols</label>'; modalBody.append(row);
      addActions([['Generate password','primary',generatePassword],['Copy result','secondary',copyResult]]);
      addLabel('Generated password'); addResult('passwordResult');
      generatePassword();
    }
  };
  (render[tool] || render.json)();
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  const first = modalBody.querySelector('textarea,input:not([type=checkbox]):not([type=range])');
  if (first) first.focus();
}
function closeModal() { modal.hidden = true; document.body.style.overflow = ''; currentTool = ''; }
document.querySelectorAll('[data-tool]').forEach(button => button.addEventListener('click', () => openModal(button.dataset.tool)));
document.getElementById('closeModal').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

function addLabel(text) { const el=document.createElement('label'); el.textContent=text; modalBody.append(el); }
function addTextarea(placeholder, rows, id) { const el=document.createElement('textarea'); el.placeholder=placeholder; el.rows=rows; el.id=id; modalBody.append(el); return el; }
function addInput(placeholder,id,type='text') { const el=document.createElement('input'); el.type=type; el.placeholder=placeholder; el.id=id; if(type==='number'){el.min='8';el.max='64';el.value=placeholder;} modalBody.append(el); return el; }
function addActions(items) { const box=document.createElement('div'); box.className='tool-actions'; items.forEach(([label,kind,fn])=>{const b=document.createElement('button');b.type='button';b.className='action-btn '+(kind==='secondary'?'secondary':'');b.textContent=label;b.addEventListener('click',fn);box.append(b);});modalBody.append(box);return box; }
function addResult(id) { const el=document.createElement('div');el.className='result-box';el.id=id;el.textContent='Your result will appear here.';modalBody.append(el);return el; }
function addNote(text) { const p=document.createElement('p');p.className='muted-note';p.textContent=text;modalBody.append(p); }
function formatJSON(){try{document.getElementById('jsonResult').textContent=JSON.stringify(JSON.parse(document.getElementById('jsonInput').value),null,2);setStatus('JSON formatted successfully.')}catch(e){setStatus('Invalid JSON: '+e.message)}}
function minifyJSON(){try{document.getElementById('jsonResult').textContent=JSON.stringify(JSON.parse(document.getElementById('jsonInput').value));setStatus('JSON minified successfully.')}catch(e){setStatus('Invalid JSON: '+e.message)}}
async function copyResult(){const result=modalBody.querySelector('.result-box');if(!result||!result.textContent||result.textContent==='Your result will appear here.')return setStatus('Nothing to copy yet.');try{await navigator.clipboard.writeText(result.textContent);setStatus('Copied to clipboard.')}catch(e){setStatus('Copy was blocked by the browser. Select the result and copy it manually.')}}
function updateWordStats(){const text=document.getElementById('wordsInput').value;const words=text.trim()?text.trim().split(/\s+/).length:0;const chars=text.length;const noSpace=text.replace(/\s/g,'').length;const sentences=text.trim()?text.split(/[.!?]+/).filter(s=>s.trim()).length:0;const minutes=Math.max(1,Math.ceil(words/200));document.getElementById('wordStats').innerHTML='';[['Words',words],['Characters',chars],['No spaces',noSpace],['Sentences',sentences],['Reading time',words?minutes+' min':'0 min']].forEach(([k,v])=>{const s=document.createElement('span');s.className='tool-stat';s.textContent=k+': '+v;document.getElementById('wordStats').append(s);});}
function transformCase(mode){const input=document.getElementById('caseInput').value;let out=input;if(mode==='upper')out=input.toUpperCase();if(mode==='lower')out=input.toLowerCase();if(mode==='title')out=input.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());if(mode==='sentence')out=input.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g,c=>c.toUpperCase());document.getElementById('caseResult').textContent=out;setStatus('Text converted.')}
function generateQR(){const value=document.getElementById('qrInput').value.trim();if(!value)return setStatus('Enter text or a URL first.');const box=document.getElementById('qrResult');box.replaceChildren();const img=document.createElement('img');img.alt='Generated QR code';img.src='https://api.qrserver.com/v1/create-qr-code/?size=240x240&data='+encodeURIComponent(value);img.onload=()=>setStatus('QR code generated.');img.onerror=()=>setStatus('Could not reach the QR service. Check your internet connection.');box.append(img);}
function compressImage(){const file=document.getElementById('imageInput').files[0];if(!file)return setStatus('Choose an image first.');if(!file.type.startsWith('image/'))return setStatus('Please choose a valid image file.');const quality=Number(document.getElementById('qualityInput').value)/100;const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0);canvas.toBlob(blob=>{if(!blob)return setStatus('Compression failed. Try another image.');const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=(file.name.replace(/\.[^.]+$/,'')||'image')+'-compressed.jpg';a.click();const old=window.__lastImageUrl;if(old)URL.revokeObjectURL(old);window.__lastImageUrl=url;document.getElementById('imageResult').textContent=`Original: ${(file.size/1024).toFixed(1)} KB\nCompressed: ${(blob.size/1024).toFixed(1)} KB\nSaved as JPEG.`;setStatus('Compressed image download started.');},'image/jpeg',quality);};img.onerror=()=>setStatus('Could not read this image.');img.src=reader.result;};reader.readAsDataURL(file);}
function doBase64(mode){const input=document.getElementById('base64Input').value;try{document.getElementById('base64Result').textContent=mode==='encode'?btoa(unescape(encodeURIComponent(input))):decodeURIComponent(escape(atob(input.trim())));setStatus(mode==='encode'?'Encoded successfully.':'Decoded successfully.')}catch(e){setStatus('Could not process this input. Check the text or Base64 string.')}}
function generatePassword(){const length=Math.min(64,Math.max(8,Number(document.getElementById('passwordLength').value)||16));let chars='';if(document.getElementById('pwUpper').checked)chars+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';if(document.getElementById('pwLower').checked)chars+='abcdefghijklmnopqrstuvwxyz';if(document.getElementById('pwNumbers').checked)chars+='0123456789';if(document.getElementById('pwSymbols').checked)chars+='!@#$%^&*()-_=+[]{}?';if(!chars)return setStatus('Select at least one character type.');const random=crypto.getRandomValues(new Uint32Array(length));let password='';for(let i=0;i<length;i++)password+=chars[random[i]%chars.length];document.getElementById('passwordResult').textContent=password;setStatus('Generated locally in your browser.')}


// Productivity upgrades: click anywhere on a card, keyboard navigation and recent tools.
const recentToolsEl = document.getElementById('recentTools');
const recentToolIds = [];
const toolNames = {
  json:'JSON Formatter', words:'Word Counter', case:'Case Converter',
  qr:'QR Code Generator', image:'Image Compressor',
  base64:'Base64 Encoder / Decoder', password:'Password Generator'
};
function recordRecent(tool) {
  if (!tool) return;
  const item = { id: tool, name: toolNames[tool] || tool };
  const existing = recentToolIds.findIndex(x => x.id === item.id);
  if (existing >= 0) recentToolIds.splice(existing, 1);
  recentToolIds.unshift(item);
  recentToolIds.splice(5);
  renderRecentTools();
}
function renderRecentTools() {
  recentToolsEl.replaceChildren();
  const label = document.createElement('span');
  label.className = 'recent-label';
  label.textContent = 'RECENT';
  recentToolsEl.append(label);
  if (!recentToolIds.length) {
    const empty = document.createElement('span');
    empty.className = 'recent-empty';
    empty.textContent = 'Your recently opened tools will appear here.';
    recentToolsEl.append(empty);
    return;
  }
  recentToolIds.forEach(item => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'recent-chip';
    button.textContent = item.name;
    button.addEventListener('click', () => openModal(item.id));
    recentToolsEl.append(button);
  });
}
cards.forEach(card => {
  const activateCard = (event) => {
    // Let the actual inner button/link handle its own activation.
    if (event.target.closest('button, a, input, textarea, select, label')) return;
    const toolButton = card.querySelector('[data-tool]');
    const link = card.querySelector('a.tool-open');
    if (toolButton) toolButton.click();
    else if (link) window.location.href = link.href;
  };
  card.addEventListener('click', activateCard);
  card.addEventListener('keydown', event => {
    if (event.target !== card) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activateCard(event);
    }
  });
});
document.addEventListener('keydown', event => {
  const tag = (document.activeElement && document.activeElement.tagName || '').toLowerCase();
  const typing = ['input','textarea','select'].includes(tag) || document.activeElement?.isContentEditable;
  if (event.key === '/' && !typing && modal.hidden) {
    event.preventDefault();
    searchInput.focus();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && modal.hidden) {
    event.preventDefault();
    searchInput.focus();
  }
});
// Record tools opened from either the cards or recent-tool chips.
const originalOpenModal = openModal;
openModal = function(tool) {
  recordRecent(tool);
  return originalOpenModal(tool);
};
renderRecentTools();
