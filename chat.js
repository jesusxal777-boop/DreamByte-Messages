// Usamos una función autoejecutable para que no haya conflictos
(async function() {
    console.log("Iniciando lógica de chat...");

    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }

    const btn = document.getElementById('btnSendMessage');
    const input = document.getElementById('inMessage');
    const container = document.getElementById('containerMessages');

    if (!btn) {
        alert("Error: No encontré el botón btnSendMessage");
        return;
    }

    // Configurar el evento de envío
    btn.addEventListener('click', async () => {
        const text = input.value.trim();
        if (!text) return;

        try {
            // Intentar insertar en Supabase
            const { error } = await db.from('messages').insert([
                { content: text, user_id: (await db.auth.getUser()).data.user.id }
            ]);

            if (error) {
                alert("Error de Supabase: " + error.message);
            } else {
                input.value = ''; // Limpiar input si tuvo éxito
            }
        } catch (e) {
            alert("Error al conectar: " + e.message);
        }
    });

    // Realtime básico
    db.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const div = document.createElement('div');
          div.innerText = payload.new.content;
          container.appendChild(div);
      })
      .subscribe();
})();
