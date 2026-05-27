let currentRoom = '00000000-0000-0000-0000-000000000000';
let mediaRecorder;
let audioChunks = [];

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('containerMessages');
    const input = document.getElementById('inMessage');
    const btnSend = document.getElementById('btnSendMessage');
    const fileInput = document.getElementById('fileInput');

    const { data: { session } } = await db.auth.getSession();
    const user = session?.user || { id: 'anon_' + Math.floor(Math.random() * 10000) };

    // --- CARGA DE MENSAJES ---
    window.changeRoom = (id) => { currentRoom = id; loadMessages(); };

    async function loadMessages() {
        container.innerHTML = "Cargando...";
        const { data } = await db.from('messages').select('*').eq('room_id', currentRoom).order('created_at', { ascending: true });
        container.innerHTML = "";
        for (const m of data || []) { await renderMessage(m); }
    }

    // --- RENDERIZADO CON ARCHIVOS Y AUDIO ---
    async function renderMessage(msg) {
        const { data: profile } = await db.from('profiles').select('username, avatar_url').eq('id', msg.user_id).single();
        const username = profile?.username || "Anónimo";
        const avatar = profile?.avatar_url || `https://ui-avatars.com/api/?name=${username.substring(0,2)}&background=random`;
        
        const div = document.createElement('div');
        div.style.cssText = "display:flex; align-items:center; padding:10px; margin:5px 0; background:rgba(255,255,255,0.05); border-radius:10px; cursor:pointer;";
        
        // Detectar si es imagen, audio o texto
        let contentHtml = msg.content;
        if (msg.content.startsWith('http')) {
            if (msg.content.match(/\.(jpeg|jpg|gif|png)$/)) {
                contentHtml = `<img src="${msg.content}" style="max-width:200px; border-radius:10px;">`;
            } else if (msg.content.match(/\.(wav|mp3|ogg|webm)$/)) {
                contentHtml = `<audio controls src="${msg.content}"></audio>`;
            }
        }

        div.innerHTML = `
            <img src="${avatar}" style="width:35px; height:35px; border-radius:50%; margin-right:10px;">
            <div onclick="navigator.clipboard.writeText('${msg.content}'); alert('Copiado!');">
                <div style="font-size:0.7em; opacity:0.6;">${username}</div>
                <div>${contentHtml}</div>
            </div>
        `;
        container.appendChild(div);
    }

    // --- SUBIDA DE ARCHIVOS ---
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        const fileName = `${Date.now()}_${file.name}`;
        await db.storage.from('chat-attachments').upload(fileName, file);
        const { data: { publicUrl } } = db.storage.from('chat-attachments').getPublicUrl(fileName);
        await db.from('messages').insert([{ content: publicUrl, room_id: currentRoom, user_id: user.id }]);
        loadMessages();
    };

    // --- GRABACIÓN DE AUDIO ---
    document.getElementById('btnRecord').onclick = async () => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const fileName = `audio_${Date.now()}.webm`;
                await db.storage.from('chat-attachments').upload(fileName, audioBlob);
                const { data: { publicUrl } } = db.storage.from('chat-attachments').getPublicUrl(fileName);
                await db.from('messages').insert([{ content: publicUrl, room_id: currentRoom, user_id: user.id }]);
                loadMessages();
            };
            mediaRecorder.start();
        } else {
            mediaRecorder.stop();
        }
    };

    // --- ENVIAR MENSAJE ---
    btnSend.onclick = async () => {
        if (!input.value.trim()) return;
        await db.from('messages').insert([{ content: input.value, room_id: currentRoom, user_id: user.id }]);
        input.value = '';
    };

    loadMessages();
});
