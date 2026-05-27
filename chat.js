let currentRoom = '00000000-0000-0000-0000-000000000000';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('containerMessages');
    const input = document.getElementById('inMessage');
    const btnSend = document.getElementById('btnSendMessage');
    const roomList = document.getElementById('roomList');
    
    // Obtener sesión actual
    const { data: { session } } = await db.auth.getSession();
    const user = session?.user || { id: 'anon_' + Math.floor(Math.random() * 10000) };

    // --- 1. CARGA DE CANALES ---
    async function loadRooms() {
        const { data } = await db.from('rooms').select('*');
        if (roomList) {
            roomList.innerHTML = '<div onclick="changeRoom(\'00000000-0000-0000-0000-000000000000\')"># Global</div>';
            data?.forEach(room => {
                const div = document.createElement('div');
                div.className = 'room-item';
                div.innerText = '# ' + room.name;
                div.onclick = () => window.changeRoom(room.id);
                roomList.appendChild(div);
            });
        }
    }

    // --- 2. CARGA DE MENSAJES ---
    window.changeRoom = (id) => { currentRoom = id; loadMessages(); };

    async function loadMessages() {
        container.innerHTML = "Cargando...";
        const { data, error } = await db.from('messages')
            .select('*')
            .eq('room_id', currentRoom)
            .order('created_at', { ascending: true });
        
        if (error) { alert("Error de carga: " + error.message); return; }
        
        container.innerHTML = "";
        for (const m of data || []) { await renderMessage(m); }
    }

    // --- 3. RENDERIZADO DE MENSAJE CON PERFIL ---
    async function renderMessage(msg) {
        // Obtenemos perfil
        const { data: profile } = await db.from('profiles').select('username, avatar_url').eq('id', msg.user_id).single();
        
        const username = profile?.username || "Anónimo";
        const avatar = profile?.avatar_url || `https://ui-avatars.com/api/?name=${username.substring(0,2)}&background=random`;
        
        const div = document.createElement('div');
        div.style.cssText = "display:flex; align-items:center; padding:10px; margin:5px 0; background:rgba(255,255,255,0.05); border-radius:10px;";
        
        div.innerHTML = `
            <img src="${avatar}" style="width:35px; height:35px; border-radius:50%; margin-right:10px;">
            <div>
                <div style="font-size:0.7em; opacity:0.6;">${username}</div>
                <div>${msg.content}</div>
            </div>
        `;
        container.appendChild(div);
    }

    // --- 4. ENVIAR MENSAJE ---
    btnSend.onclick = async () => {
        if (!input.value.trim()) return;
        
        const { error } = await db.from('messages').insert([{ 
            content: input.value, 
            room_id: currentRoom,
            user_id: user.id 
        }]);

        if (error) alert("Error: " + error.message);
        else input.value = '';
    };

    // --- 5. SUBIR FOTO ---
    const fileInput = document.getElementById('fileAvatar');
    if (fileInput) {
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            const fileName = `${user.id}.${file.name.split('.').pop()}`;
            
            await db.storage.from('avatars').upload(fileName, file, { upsert: true });
            const { data: { publicUrl } } = db.storage.from('avatars').getPublicUrl(fileName);
            
            await db.from('profiles').upsert({ id: user.id, avatar_url: publicUrl });
            alert("Foto actualizada");
            loadMessages();
        };
    }

    loadRooms();
    loadMessages();
});
