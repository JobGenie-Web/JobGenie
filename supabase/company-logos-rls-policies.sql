-- ================================================================
-- RLS Policies for company-logos Storage Bucket
-- ================================================================
-- This file contains the necessary RLS policies to allow employers
-- to upload, update, and delete company logos in Supabase Storage.

-- First, ensure the bucket exists (if not already created)
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- Drop existing policies (if any) to start fresh
-- ================================================================

DROP POLICY IF EXISTS "Allow public read access to company logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated employers to upload company logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow employers to update their own company logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow employers to delete their own company logos" ON storage.objects;

-- ================================================================
-- 1. Allow PUBLIC READ access (anyone can view company logos)
-- ================================================================

CREATE POLICY "Allow public read access to company logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'company-logos');

-- ================================================================
-- 2. Allow AUTHENTICATED users to UPLOAD company logos
-- ================================================================

CREATE POLICY "Allow authenticated employers to upload company logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'company-logos'
    AND auth.uid() IN (
        SELECT user_id FROM public.employers
    )
);

-- ================================================================
-- 3. Allow employers to UPDATE their own company logos
-- ================================================================

CREATE POLICY "Allow employers to update their own company logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'company-logos'
    AND auth.uid() IN (
        SELECT user_id FROM public.employers
    )
)
WITH CHECK (
    bucket_id = 'company-logos'
    AND auth.uid() IN (
        SELECT user_id FROM public.employers
    )
);

-- ================================================================
-- 4. Allow employers to DELETE their own company logos
-- ================================================================

CREATE POLICY "Allow employers to delete their own company logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'company-logos'
    AND auth.uid() IN (
        SELECT user_id FROM public.employers
    )
);

-- ================================================================
-- Verification Query
-- ================================================================
-- Run this to verify the policies were created successfully:

-- SELECT 
--     schemaname,
--     tablename,
--     policyname,
--     permissive,
--     roles,
--     cmd,
--     qual
-- FROM pg_policies
-- WHERE tablename = 'objects' 
-- AND policyname LIKE '%company%logo%'
-- ORDER BY policyname;
