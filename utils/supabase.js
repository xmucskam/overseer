import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xtvyremffpyhpjrzbnry.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0dnlyZW1mZnB5aHBqcnpibnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMjgxMTcsImV4cCI6MjA2MTYwNDExN30.BQp4SATuWSVMrRifl6Z2xLH895_sL7kL9OApm2ooDFw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
        fetch: fetch,
    },
});
