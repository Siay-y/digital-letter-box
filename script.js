const $ = (sel, el=document) => el.querySelector(sel);
const toast = (msg) => {
    const el = $('#toast');
    el.textContent = msg; el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2200);
};

const state = {
    nome: localStorage.getItem('nome') || '',
    titulo: localStorage.getItem('titulo') || '',
    mensagem: localStorage.getItem('mensagem') || '',
    autor: localStorage.getItem('autor') || '',
};

// Inputs
const nome = $('#nome');
const titulo = $('#titulo');
const mensagem = $('#mensagem');
const count = $('#count');

const to = $('#to');
const title = $('#title');
const previewMsg = $('#previewMsg');
const autorSpan = $('#autor');
const alvoLabel = $('#alvoLabel');

const aplicar = $('#aplicar');
const previewBtn = $('#preview');
const share = $('#share');
const limpar = $('#limpar');

const envelope = $('#envelope');

try {
    const params = new URLSearchParams(location.hash.slice(1) || location.search.slice(1));
    if (params.size) {
    state.nome = params.get('n')?.slice(0, 40) || state.nome;
    state.titulo = params.get('t')?.slice(0, 60) || state.titulo;
    state.mensagem = decodeURIComponent(params.get('m') || '') || state.mensagem;
    state.autor = params.get('a')?.slice(0, 40) || state.autor;
    }
} catch(_){}

nome.value = state.nome;
titulo.value = state.titulo;
mensagem.value = state.mensagem;

const updateCount = () => { count.textContent = mensagem.value.length; };
mensagem.addEventListener('input', () => { updateCount(); saveDraft(); });
nome.addEventListener('input', saveDraft);
titulo.addEventListener('input', saveDraft);

$('.seal').addEventListener('dblclick', () => {
    const assinatura = prompt('Assine sua carta (seu nome):', state.autor || '');
    if (assinatura !== null) {
    state.autor = assinatura.slice(0, 40);
    autorSpan.textContent = state.autor || 'Sensei';
    localStorage.setItem('autor', state.autor);
    }
});

function applyToLetter(openEnvelope = true) {
    const n = (nome.value || 'Minha Pessoa Favorita').trim();
    const t = (titulo.value || 'Você é meu lugar preferido').trim();
    const m = (mensagem.value || '...').trim();

    to.textContent = `Para: ${n}`;
    title.textContent = t;
    previewMsg.textContent = m;
    autorSpan.textContent = state.autor || 'Sensei';
    alvoLabel.textContent = n.toLowerCase() === 'minha pessoa favorita' ? 'minha pessoa favorita' : n;

    if (openEnvelope) {
    envelope.classList.remove('open');
    void envelope.offsetWidth; 
    envelope.classList.add('open');
    setTimeout(()=> confetti(24), 500);
    }
}

function saveDraft() {
    localStorage.setItem('nome', nome.value);
    localStorage.setItem('titulo', titulo.value);
    localStorage.setItem('mensagem', mensagem.value);
}

aplicar.addEventListener('click', () => { applyToLetter(); toast('Carta atualizada ✨'); });
previewBtn.addEventListener('click', () => { applyToLetter(); });

share.addEventListener('click', async () => {
    const url = new URL(location.href.split('#')[0]);
    url.hash = new URLSearchParams({
    n: nome.value,
    t: titulo.value,
    m: mensagem.value,
    a: state.autor || ''
    }).toString();
    const link = url.toString();
    try {
    await navigator.clipboard.writeText(link);
    toast('Link copiado para a área de transferência!');
    } catch {
    prompt('Copie o link para compartilhar:', link);
    }
});

limpar.addEventListener('click', () => {
    nome.value = '';
    titulo.value = '';
    mensagem.value = '';
    updateCount();
    saveDraft();
    toast('Campos limpos');
});

updateCount();
applyToLetter(false);

const fx = document.getElementById('fx');
const ctx = fx.getContext('2d');
let W, H; const DPR = Math.min(devicePixelRatio || 1, 2);
function resize() {
    W = innerWidth; H = innerHeight; fx.width = W * DPR; fx.height = H * DPR; ctx.scale(DPR, DPR);
}
resize(); addEventListener('resize', resize);

let particles = [];
function spawn(x, y, vx, vy, life, kind='heart') { particles.push({x, y, vx, vy, life, max: life, kind}); }

function heart(ctx, x, y, r) {
    ctx.beginPath();
    const d = r;
    ctx.moveTo(x, y + d/4);
    ctx.bezierCurveTo(x - d, y - d/2, x - d, y + d, x, y + d);
    ctx.bezierCurveTo(x + d, y + d, x + d, y - d/2, x, y + d/4);
    ctx.closePath();
}

function confetti(n=16) {
    for (let i=0;i<n;i++) {
    const x = innerWidth/2, y = 0;
    const vx = (Math.random() - .5) * 3;
    const vy = 2 + Math.random() * 2.5;
    spawn(x, y, vx, vy, 220 + Math.random()*80, 'dot');
    }
}

let mouse = {x: W/2, y: H/2};
window.addEventListener('mousemove', e => { mouse = {x: e.clientX, y: e.clientY}; for (let i=0;i<2;i++) spawn(mouse.x, mouse.y, (Math.random()-.5)*.8, (Math.random()-.5)*.8, 80+Math.random()*40, 'heart'); });

function loop() {
    ctx.clearRect(0,0,W,H);
    for (let i=particles.length-1; i>=0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += p.kind==='dot' ? 0.03 : 0.005; p.life--;
    const a = Math.max(p.life / p.max, 0);
    if (p.kind === 'heart') {
        ctx.save(); ctx.globalAlpha = a * 0.9; ctx.fillStyle = '#ff6b9e'; ctx.translate(p.x, p.y); ctx.rotate((p.max-p.life)/30); heart(ctx, 0, 0, 6); ctx.fill(); ctx.restore();
    } else {
        ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = ['#ff5ea8','#8a64ff','#ffd166'][i%3]; ctx.fillRect(p.x, p.y, 4, 8); ctx.restore();
    }
    if (p.life <= 0 || p.y > H+40) particles.splice(i,1);
    }
    requestAnimationFrame(loop);
}
loop();

window.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 'p') { e.preventDefault(); applyToLetter(); }
    if (e.ctrlKey && e.key.toLowerCase() === 's') { e.preventDefault(); share.click(); }
});