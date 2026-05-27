const db = supabase.createClient(
    'https://qynkgbgxavjgmvnskbsd.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5bmtnYmd4YXZqZ212bnNrYnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NDQ5NzMsImV4cCI6MjA5NTQyMDk3M30.2lbtOLD-pgKYYrJiNsaOIsw3oM3jaZUgccDA-68Y6JI'
);

async function loginUser(email, password) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

async function registerUser(email, password) {
    const { data, error } = await db.auth.signUp({ email, password });
    if (error) throw error;
    return data;
}
