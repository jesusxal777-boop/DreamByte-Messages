let currentRoom = '00000000-0000-0000-0000-000000000000';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('containerMessages');
    const input = document.getElementById('inMessage');
    const btnSend = document.getElementById('btnSendMessage');
    
    // Obtener usuario actual
    const { data: { user } } = await db.auth.getUser();

    // 1. Cargar Canales
    async function loadRooms() {
        const { data, error } = await db.from('rooms').select('*');
        const roomList = document.getElementById('roomList');
        if (roomList) {
            roomList.innerHTML = '';
            data?.forEach(room => {
                const div = document.createElement('div');
                div.className = 'room-item';
                div.innerText = '# ' + room.name;
                div.onclick = () => { 
                    currentRoom = room.id; 
                    loadMessages(); 
                };
                roomList.appendChild(div);
            });
        }
    }

    // 2. Cargar Mensajes
    async function loadMessages() {
        container.innerHTML = "Cargando...";
        const { data, error } = await db.from('messages')
            .select('*')
            .eq('room_id', currentRoom)
            .order('created_at', { ascending: true });
        
        container.innerHTML = "";
        data?.forEach(m => renderMessage(m));
    }

    // 3. Enviar Mensaje (Con user_id)
    btnSend.onclick = async () => {
        const text = input.value.trim();
        if (!text || !user) return;

        const { error } = await db.from('messages').insert([{ 
            content: text, 
            room_id: currentRoom,
            user_id: user.id // <--- AQUÍ ESTABA EL ERROR
        }]);

        if (error) alert("Error al enviar: " + error.message);
        else input.value = '';
    };

    loadRooms();
    loadMessages();
});

function renderMessage(msg) {
    const div = document.createElement('div');
    div.innerText = msg.content;
    document.getElementById('containerMessages').appendChild(div);
}
