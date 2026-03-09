import dotenv from 'dotenv';
dotenv.config();

console.log('--- ALL ENV VARS ---');
Object.keys(process.env).forEach(key => {
  if (key.includes('SUPABASE') || key.includes('VITE') || key.includes('GEMINI')) {
    console.log(`${key}: FOUND`);
  }
});
console.log('--------------------');

console.log('Checking Environment Variables (with dotenv):');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'PRESENT' : 'MISSING');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'PRESENT' : 'MISSING');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'PRESENT' : 'MISSING');
