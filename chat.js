document.addEventListener('DOMContentLoaded', async () => {
    // Verificamos sesión sin consultar ninguna tabla extra
    const { data: { session } } = await db.auth.getSession();
    if (!session) return location.href = 'index.html';

    // Ahora los botones sí funcionarán porque no esperamos nada de la BD
    document.getElementById('btnSendMessage').onclick = async () => {
        const content = document.getElementById('inMessage').value;
        const { error } = await db.from('messages').insert([
            { content: content, user_id: session.user.id } 
        ]);
        if (error) alert("Error: " + error.message);
        else document.getElementById('inMessage').value = '';
    };
});
