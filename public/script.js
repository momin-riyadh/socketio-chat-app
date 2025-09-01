const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const fileInput = document.getElementById('fileInput');
const messages = document.getElementById('messages');
const typingEl = document.getElementById('typing');
let myId = null;

// Get and store our socket id when connected
socket.on('connect', () => {
    myId = socket.id;
});

// Track typing state and debounce stop-typing
let typing = false;
let lastTypingTime = 0;
const TYPING_TIMER_LENGTH = 1200; // ms

function updateTyping() {
    if (!typing) {
        typing = true;
        socket.emit('typing');
    }
    lastTypingTime = Date.now();
    setTimeout(() => {
        const timeDiff = Date.now() - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
            typing = false;
            socket.emit('stop typing');
        }
    }, TYPING_TIMER_LENGTH + 10);
}

input.addEventListener('input', () => {
    const val = input.value;
    if (val && val.trim().length > 0) {
        updateTyping();
    } else {
        if (typing) {
            typing = false;
            socket.emit('stop typing');
        }
    }
});

form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const val = input.value.trim();

    // If there are files selected, send them first (can be with or without text)
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const files = Array.from(fileInput.files);
        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const b64 = arrayBufferToBase64(arrayBuffer);
            const attachment = {
                name: file.name,
                type: file.type || 'application/octet-stream',
                size: file.size,
                data: b64
            };
            // Emit attachment
            socket.emit('chat attachment', attachment);
            // Optimistic render
            addAttachmentMessage({id: myId, attachment});
        }
        // clear file input
        fileInput.value = '';
    }

    if (val) {
        socket.emit('chat message', val);
        // Optimistic render my own message immediately as right-aligned
        addMessage({id: myId, text: val});
        input.value = '';
        input.focus();
        if (typing) {
            typing = false;
            socket.emit('stop typing');
        }
    }
});

// Render typing indicators from others
const typers = new Set();

socket.on('typing', ({id}) => {
    if (id && id !== myId) {
        typers.add(id);
        renderTyping();
    }
});

socket.on('stop typing', ({id}) => {
    if (id) {
        typers.delete(id);
        renderTyping();
    }
});

function renderTyping() {
    const count = typers.size;
    if (count === 0) {
        typingEl.innerHTML = '';
        return;
    }
    // Simple animated dots using inline CSS
    typingEl.innerHTML = `<span class="inline-flex items-center gap-2">
    <span class="w-2 h-2 rounded-full bg-slate-300/70 animate-bounce" style="animation-delay:0ms"></span>
    <span class="w-2 h-2 rounded-full bg-slate-300/70 animate-bounce" style="animation-delay:150ms"></span>
    <span class="w-2 h-2 rounded-full bg-slate-300/70 animate-bounce" style="animation-delay:300ms"></span>
    <span class="opacity-80">${count === 1 ? 'Someone is typing…' : 'Multiple people are typing…'}</span>
  </span>`;
}

socket.on('chat message', function (payload) {
    // payload: { id, text }
    if (payload && payload.id === myId) {
        // Already optimistically rendered my own message; skip duplicate
        return;
    }
    if (payload && payload.id) {
        typers.delete(payload.id);
        renderTyping();
    }
    addMessage(payload);
});

// Receive attachments
socket.on('chat attachment', function (payload) {
    // payload: { id, attachment }
    if (payload && payload.id === myId) return;
    if (payload && payload.id) {
        typers.delete(payload.id);
        renderTyping();
    }
    addAttachmentMessage(payload);
});

function addMessage(payload) {
    const {id, text} = typeof payload === 'object' && payload !== null ? payload : {
        id: 'unknown',
        text: String(payload)
    };
    const item = document.createElement('li');

    // System messages remain simple and centered without avatar
    if (id === 'system') {
        item.textContent = text;
        item.classList.add('mx-auto', 'text-xs', 'opacity-80', 'bg-white/5');
    } else {
        // Mark as rich message so index.html observer can style appropriately
        item.setAttribute('data-msg', 'true');

        const isMine = id === myId;
        const seed = encodeURIComponent(String(id || 'unknown'));
        const avatarUrl = `https://api.dicebear.com/8.x/identicon/svg?seed=${seed}`;

        // Build inner structure: avatar + bubble
        // For my messages: content then avatar on the right; align row to end
        // For others: avatar then content on the left
        const bubbleBase = 'max-w-[75%] px-3 py-2 rounded-lg shadow border';
        const bubbleMine = 'bg-primary-600/30 border-primary-400/30';
        const bubbleOther = 'bg-white/10 border-white/10 text-left';

        const avatarImg = `<img src="${avatarUrl}" alt="avatar" class="w-8 h-8 rounded-full ring-1 ring-white/20 bg-white/10" loading="lazy">`;
        const bubble = `<div class="${bubbleBase} ${isMine ? bubbleMine : bubbleOther}"><span class="break-words">${text}</span></div>`;

        if (isMine) {
            item.innerHTML = `${bubble}<div class="shrink-0">${avatarImg}</div>`;
            item.classList.add('self-end', 'ml-auto', 'flex', 'items-end', 'gap-2', 'justify-end');
        } else {
            item.innerHTML = `<div class="shrink-0">${avatarImg}</div>${bubble}`;
            item.classList.add('self-start', 'mr-auto', 'flex', 'items-end', 'gap-2');
        }
    }

    // Ensure parent container treats children as a flex column
    messages.classList.add('flex', 'flex-col');
    messages.appendChild(item);
    messages.scrollTo({top: messages.scrollHeight, behavior: 'smooth'});
}

function addAttachmentMessage(payload) {
    const {id, attachment} = payload;
    const item = document.createElement('li');
    item.setAttribute('data-msg', 'true');
    const isMine = id === myId;
    const seed = encodeURIComponent(String(id || 'unknown'));
    const avatarUrl = `https://api.dicebear.com/8.x/identicon/svg?seed=${seed}`;

    const bubbleBase = 'max-w-[75%] px-3 py-2 rounded-lg shadow border';
    const bubbleMine = 'bg-primary-600/30 border-primary-400/30 text-right';
    const bubbleOther = 'bg-white/10 border-white/10 text-left';

    const avatarImg = `<img src="${avatarUrl}" alt="avatar" class="w-8 h-8 rounded-full ring-1 ring-white/20 bg-white/10" loading="lazy">`;

    const preview = renderAttachmentPreview(attachment);
    const bubble = `<div class="${bubbleBase} ${isMine ? bubbleMine : bubbleOther}">${preview}</div>`;

    if (isMine) {
        item.innerHTML = `${bubble}<div class="shrink-0">${avatarImg}</div>`;
        item.classList.add('self-end', 'ml-auto', 'flex', 'items-end', 'gap-2', 'justify-end');
    } else {
        item.innerHTML = `<div class="shrink-0">${avatarImg}</div>${bubble}`;
        item.classList.add('self-start', 'mr-auto', 'flex', 'items-end', 'gap-2');
    }

    messages.classList.add('flex', 'flex-col');
    messages.appendChild(item);
    messages.scrollTo({top: messages.scrollHeight, behavior: 'smooth'});
}

function renderAttachmentPreview(att) {
    const safeName = att.name || 'file';
    const mime = att.type || 'application/octet-stream';
    const dataUrl = `data:${mime};base64,${att.data}`;
    const commonBtn = 'inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10';

    if (mime.startsWith('image/')) {
        return `<a href="${dataUrl}" download="${safeName}" target="_blank" class="block max-w-full">
      <img src="${dataUrl}" alt="${safeName}" class="max-h-60 rounded-lg border border-white/10" loading="lazy" />
      <div class="text-xs mt-1 opacity-80 max-w-full break-all break-words whitespace-normal overflow-hidden" title="${safeName}">${safeName}</div>
    </a>`;
    }
    if (mime === 'application/pdf') {
        return `<a href="${dataUrl}" download="${safeName}" target="_blank" class="${commonBtn} max-w-full overflow-hidden">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v0A3.375 3.375 0 0010.125 3.75H8.25A3.75 3.75 0 004.5 7.5v9a3.75 3.75 0 003.75 3.75h6.75"/></svg>
      <span class="max-w-full inline-block align-bottom break-all break-words whitespace-normal overflow-hidden" title="${safeName}">${safeName}</span>
    </a>`;
    }
    // default: show generic download link
    return `<a href="${dataUrl}" download="${safeName}" target="_blank" class="${commonBtn} max-w-full overflow-hidden">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 10.5L12 15m0 0l4.5-4.5M12 15V3"/></svg>
    <span class="max-w-full inline-block align-bottom break-all break-words whitespace-normal overflow-hidden" title="${safeName}">${safeName} (${Math.round((att.size || 0) / 1024)} KB)</span>
  </a>`;
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
}
