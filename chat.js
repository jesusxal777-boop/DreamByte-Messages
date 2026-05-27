document.addEventListener('DOMContentLoaded', async () => {
    // 1. Validar que los elementos existen
    const btn = document.getElementById('btnSendMessage');
    const input = document.getElementById('inMessage');
    const container = document.getElementById('containerMessages');

    if (!btn || !input) {
        alert("Error crítico: El botón o el input no existen en el HTML.");
        return;
    }

    // 2. Evento del botón
    btn.addEventListener('click', async () => {
        const contenido = input.value.trim();
        if (!contenido) return;

        // Intentar guardar en Supabase
        const { error } = await db.from('messages').insert([
            { content: contenido }
        ]);

        if (error) {
            alert("Error de Supabase: " + error.message);
        } else {
            input.value = '';
            alert("¡Enviado!");
        }
    });

    // 3. Prueba de lectura (ver si al menos carga algo)
    const { data, error } = await db.from('messages').select('*').limit(5);
    if (error) {
        alert("No puedo leer mensajes: " + error.message);
    } else {
        container.innerHTML = "Conectado. Mensajes cargados: " + data.length;
    }
});
