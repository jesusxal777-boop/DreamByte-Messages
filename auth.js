const db = supabase.createClient(
    'https://ouidchcrmuyqtebnmvmw.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aWRjaGNybXV5cXRlYm5tdm13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTI4MjksImV4cCI6MjA5NTQyODgyOX0.q7yIx2ts-ooHBrSqlkDlpGBoBpEyg2WafMKX1XCsKHI'
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
