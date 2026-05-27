let currentRoom = '00000000-0000-0000-0000-000000000000';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('containerMessages');
    const input = document.getElementById('inMessage');
    const btnSend = document.getElementById('btnSendMessage');
    
    // Obtener sesión o generar ID anónimo
    const { data: { session } } = await db.auth.getSession();
    const user = session?.user || { id: 'anon_' + Math.floor(Math.random() * 10000), email: 'Anónimo' };

    // --- CARGA DE MENSAJES ---
    async function loadMessages() {
        container.innerHTML = "Cargando...";
        const { data } = await db.from('messages')
            .select('*')
            .eq('room_id', currentRoom)
            .order('created_at', { ascending: true });
        
        container.innerHTML = "";
        if (data) {
            for (const m of data) {
                await renderMessage(m);
            }
        }
    }

    // --- RENDERIZADO CON FOTO DE PERFIL ---
    async function renderMessage(msg) {
        // Obtenemos el perfil para la foto
        const { data: profile } = await db.from('profiles').select('username, avatar_url').eq('id', msg.user_id).single();
        
        const username = profile?.username || "Anónimo";
        const avatar = profile?.avatar_url || `https://ui-avatars.com/api/?name=${username}&background=random`;
        
        const div = document.createElement('div');
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.padding = "10px";
        div.style.margin = "5px 0";
        div.style.background = "rgba(255,255,255,0.05)";
        div.style.borderRadius = "10px";
        
        div.innerHTML = `
            <img src="${avatar}" style="width:35px; height:35px; border-radius:50%; margin-right:10px;">
            <div>
                <div style="font-size:0.7em; opacity:0.6;">${username}</div>
                <div>${msg.content}</div>
            </div>
        `;
        container.appendChild(div);
    }

    // --- ENVIAR MENSAJE ---
    btnSend.onclick = async () => {
        if (!input.value.trim()) return;
        
        const { error } = await db.from('messages').insert([{ 
            content: input.value, 
            room_id: currentRoom,
            user_id: user.id 
        }]);

        if (!error) input.value = '';
    };

    // --- SUBIR FOTO DE PERFIL (Si tienes un input file) ---
    const fileInput = document.getElementById('fileAvatar');
    if (fileInput) {
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}.${fileExt}`;
            
            await db.storage.from('avatars').upload(fileName, file, { upsert: true });
            const { data: { publicUrl } } = db.storage.from('avatars').getPublicUrl(fileName);
            
            await db.from('profiles').upsert({ id: user.id, avatar_url: publicUrl, username: user.email });
            alert("Foto actualizada");
            loadMessages();
        };
    }

    loadMessages();
});
