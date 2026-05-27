document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si el usuario está logueado
    const { data: { session } } = await db.auth.getSession();
    if (!session) return location.href = 'index.html';

    // Vincular botones
    document.getElementById('btnSendMessage').onclick = async () => {
        const input = document.getElementById('inMessage');
        const { error } = await db.from('messages').insert([{ 
            room_id: '00000000-0000-0000-0000-000000000000', 
            content: input.value,
            user_id: session.user.id 
        }]);
        if (!error) input.value = '';
    };

    // Suscripción Realtime
    db.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          console.log("Nuevo mensaje:", payload.new);
          // Aquí iría la función para pintar el mensaje en pantalla
      }).subscribe();
});
