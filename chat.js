// Esperamos a que el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    const feed = document.getElementById('containerMessages');
    const input = document.getElementById('inMessage');
    const btnSend = document.getElementById('btnSendMessage');
    
    // 1. Verificar sesión
    const { data: { session } } = await db.auth.getSession();
    if (!session) return location.href = 'index.html';

    // 2. Función para cargar mensajes iniciales
    async function loadMessages() {
        const { data, error } = await db
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (error) console.error("Error al cargar:", error);
        else {
            feed.innerHTML = '';
            data.forEach(msg => appendMessage(msg));
        }
    }

    // 3. Función para pintar un mensaje en pantalla
    function appendMessage(msg) {
        const div = document.createElement('div');
        div.className = 'bubble';
        div.innerText = msg.content;
        feed.appendChild(div);
        feed.scrollTop = feed.scrollHeight;
    }

    // 4. Lógica de Enviar
    btnSend.onclick = async () => {
        if (!input.value.trim()) return;
        const { error } = await db.from('messages').insert([
            { content: input.value, user_id: session.user.id, room_id: 'global' }
        ]);
        if (!error) input.value = '';
    };

    // 5. Motor Realtime (Aquí ocurre la magia)
    db.channel('realtime-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          appendMessage(payload.new);
      })
      .subscribe();

    loadMessages();
});
