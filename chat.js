// chat.js
document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('containerMessages');
    
    function log(msg) {
        const p = document.createElement('p');
        p.innerText = ">> " + msg;
        contenedor.appendChild(p);
    }

    log("1. JS cargado...");

    try {
        // ¿Está definida la variable 'db'?
        if (typeof db === 'undefined') {
            log("ERROR: 'db' no está definido. ¿Cargaste auth.js antes?");
            return;
        }

        const { data: { user } } = await db.auth.getUser();
        if (!user) {
            log("ERROR: No hay usuario autenticado.");
            return;
        }
        log("2. Usuario logueado: " + user.email);

        // Prueba de lectura
        const { data, error } = await db.from('messages').select('*').limit(1);
        if (error) {
            log("ERROR BD: " + error.message);
        } else {
            log("3. Base de datos conectada. Mensajes visibles.");
        }

        // Prueba de envío
        document.getElementById('btnSendMessage').onclick = async () => {
            log("Intentando enviar...");
            const { error } = await db.from('messages').insert([{ content: "Hola", user_id: user.id }]);
            if (error) log("Error al enviar: " + error.message);
            else log("¡Enviado con éxito!");
        };

    } catch (e) {
        log("ERROR FATAL: " + e.message);
    }
});
