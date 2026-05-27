let currentRoom = '00000000-0000-0000-0000-000000000000'; // Canal Global

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Cargar canales y configurar botones
    loadRooms();
    
    // 2. Botón enviar (Ahora incluye el ID de sala)
    document.getElementById('btnSendMessage').onclick = async () => {
        const input = document.getElementById('inMessage');
        if (!input.value) return;
        
        await db.from('messages').insert([{ 
            content: input.value, 
            room_id: currentRoom 
        }]);
        input.value = '';
    };

    // 3. Botón crear canal
    document.getElementById('btnNewRoom').onclick = async () => {
        const name = prompt("Nombre del nuevo canal:");
        if (name) await db.from('rooms').insert([{ name }]);
    };
});

async function loadRooms() {
    const { data } = await db.from('rooms').select('*');
    const list = document.getElementById('roomList');
    list.innerHTML = '';
    
    // Agregar el canal global fijo
    data.forEach(room => {
        const div = document.createElement('div');
        div.className = 'room-item';
        div.innerText = '# ' + room.name;
        div.onclick = () => { currentRoom = room.id; loadMessages(); };
        list.appendChild(div);
    });
}
