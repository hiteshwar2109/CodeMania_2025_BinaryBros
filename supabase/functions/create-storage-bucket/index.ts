
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define the function that runs when this edge function is invoked
Deno.serve(async (req) => {
  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with the auth header
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const adminAuthClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    // Check if the materials bucket already exists
    const { data: buckets, error: bucketsError } = await adminAuthClient.storage.listBuckets();
    
    if (bucketsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to list buckets', details: bucketsError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // If the materials bucket doesn't exist, create it
    const materialsBucketExists = buckets?.some(bucket => bucket.name === 'materials');
    
    if (!materialsBucketExists) {
      const { error: createBucketError } = await adminAuthClient.storage.createBucket('materials', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/*', 'application/pdf', 'text/*', 'application/vnd.ms-excel', 
                          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                          'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      });
      
      if (createBucketError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create materials bucket', details: createBucketError }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Add a policy to allow authenticated users to upload files
      const { error: policyError } = await adminAuthClient.storage.from('materials').createPolicy(
        'authenticated users can upload files',
        {
          name: 'authenticated users can upload files',
          definition: {
            statements: [{
              effect: 'allow',
              principal: { authenticated: '*' },
              action: 'object_upload',
              resource: 'materials/*',
            }],
          },
        }
      );
      
      if (policyError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create upload policy', details: policyError }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ message: 'Materials bucket created successfully' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // If the bucket already exists, return success message
    return new Response(
      JSON.stringify({ message: 'Materials bucket already exists' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
