import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
  const buckets = [
    { id: 'avatars', public: true },
    { id: 'opportunities_images', public: true },
    { id: 'mentor_id_docs', public: false }
  ];
  
  for (const bucket of buckets) {
    const { data, error } = await supabase.storage.getBucket(bucket.id);
    if (error && error.message.includes('not found')) {
      console.log(`Creating bucket ${bucket.id}...`);
      const { data: createData, error: createError } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
      });
      if (createError) {
        console.error(`Failed to create bucket ${bucket.id}:`, createError);
      } else {
        console.log(`Bucket ${bucket.id} created successfully.`);
      }
    } else if (data) {
      console.log(`Bucket ${bucket.id} already exists.`);
    } else {
      console.error(`Error checking bucket ${bucket.id}:`, error);
    }
  }
}

setupStorage();
