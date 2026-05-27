const db = supabase.createClient(
    'https://qynkgbgxavjgmvnskbsd.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5bmtnYmd4YXZqZ212bnNrYnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NDQ5NzMsImV4cCI6MjA5NTQyMDk3M30.2lbtOLD-pgKYYrJiNsaOIsw3oM3jaZUgccDA-68Y6JI'
);


// Función reutilizable para checar sesión
async function checkAuth(redirectIfNotAuth = true) {
    const { data: { session } } = await db.auth.getSession();
    if (!session && redirectIfNotAuth) location.href = 'index.html';
    return session;
}
