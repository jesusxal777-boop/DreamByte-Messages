// auth.js
const db = supabase.createClient(
    'https://tu-url-de-supabase.supabase.co', 
    'tu-anon-key'
);

// Función reutilizable para checar sesión
async function checkAuth(redirectIfNotAuth = true) {
    const { data: { session } } = await db.auth.getSession();
    if (!session && redirectIfNotAuth) location.href = 'index.html';
    return session;
}
