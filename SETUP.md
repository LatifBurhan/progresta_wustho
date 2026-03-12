# Setup Instructions

## 1. Install Dependencies

```bash
npm install
```

## 2. Supabase Setup

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

### Run Database Schema
1. Go to SQL Editor in Supabase Dashboard
2. Copy and paste the contents of `database/schema.sql`
3. Run the SQL script

### Create Storage Bucket
1. Go to Storage in Supabase Dashboard
2. Create a new bucket named `report-photos`
3. Make it public
4. Set up the following policy for the bucket:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload their own photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'report-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view photos
CREATE POLICY "Users can view photos" ON storage.objects
FOR SELECT USING (bucket_id = 'report-photos');

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'report-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 3. Environment Configuration

1. Copy the environment template:
```bash
cp .env.local.example .env.local
```

2. Fill in your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in:
- Supabase Dashboard → Settings → API

## 4. Update Supabase URL in Configuration

Update the `next.config.js` file with your Supabase project URL:

```javascript
images: {
  domains: ['your-project.supabase.co'],
},
```

## 5. Create App Icons

Replace the placeholder files with actual PNG icons:
- `public/icon-192x192.png` (192x192 pixels)
- `public/icon-512x512.png` (512x512 pixels)

## 6. Run the Application

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 7. First User Setup

1. Register a new account
2. The first user will be pending approval
3. Go to Supabase Dashboard → Authentication → Users
4. Find your user and note the UUID
5. Go to SQL Editor and run:

```sql
UPDATE users 
SET status_pending = false, role = 'PM' 
WHERE id = 'your-user-uuid';
```

This will make you a PM so you can approve other users.

## 8. Test the Application

1. Create some test divisions
2. Create some test projects
3. Assign projects to users
4. Submit test reports
5. Test the mobile interface

## 9. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Troubleshooting

### Common Issues

1. **Images not loading**: Check the Supabase URL in `next.config.js`
2. **Authentication errors**: Verify environment variables
3. **Database errors**: Ensure RLS policies are correctly set up
4. **PWA not installing**: Check manifest.json and service worker setup

### Database Policies

If you encounter permission errors, verify that all RLS policies are properly set up by running the schema again.

### Storage Issues

Make sure the storage bucket is public and has the correct policies for file upload/download.

## Production Considerations

1. **Security**: Review all RLS policies
2. **Performance**: Set up database indexes
3. **Monitoring**: Set up error tracking
4. **Backup**: Configure database backups
5. **CDN**: Consider using a CDN for images