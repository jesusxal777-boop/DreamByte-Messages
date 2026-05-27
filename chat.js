// Variable global para controlar la sala actual
let currentRoom = '00000000-0000-0000-0000-000000000000';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('containerMessages');
    const input = document.getElementById('inMessage');
    const btnSend = document.getElementById('btnSendMessage');
    const btnRoom = document.getElementById('btnNewRoom');

    function log(msg) {
        const div = document.createElement('div');
        div.style.padding = "5px";
        div.style.color = "#fff";
        div.innerText = "> " + msg;
        container.appendChild(div);
    }

    log("Iniciando conexión...");

    // 1. Cargar mensajes iniciales
    async function loadMessages() {
        container.innerHTML = ""; // Limpiar pantalla
        const { data, error } = await db
            .from('messages')
            .select('*')
            .eq('room_id', currentRoom)
            .order('created_at', { ascending: true });

        if (error) {
            log("Error BD: " + error.message);
        } else if (data.length === 0) {
            log("Sin mensajes. ¡Sé el primero!");
        } else {
            data.forEach(m => {
                const p = document.createElement('div');
                p.style.padding = "8px";
                p.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
                p.innerText = m.content;
                container.appendChild(p);
            });
        }
    }

    // 2. Lógica de Enviar
    btnSend.onclick = async () => {
        const text = input.value.trim();
        if (!text) return;

        const { error } = await db.from('messages').insert([{ 
            content: text, 
            room_id: currentRoom 
        }]);

        if (error) {
            log("Error al enviar: " + error.message);
        } else {
            input.value = '';
            // No hacemos nada más, el Realtime disparará la actualización
        }
    };

    // 3. Botón Nuevo Canal
    btnRoom.onclick = async () => {
        const name = prompt("Nombre del nuevo canal:");
        if (name) {
            const { error } = await db.from('rooms').insert([{ name }]);
            if (error) log("Error al crear canal: " + error.message);
            else log("Canal creado, recarga para ver.");
        }
    };

    // 4. Suscripción Realtime (Para que los mensajes aparezcan solos)
    db.channel('messages-channel')
      .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `room_id=eq.${currentRoom}` 
      }, (payload) => {
          const p = document.createElement('div');
          p.innerText = payload.new.content;
          container.appendChild(p);
      })
      .subscribe();

    loadMessages();
});
