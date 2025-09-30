# Supabase Setup Guide for easyAI

Follow these steps to set up your Supabase project and database for easyAI.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: easyAI
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public** key
   - **service_role** key (keep this secret!)

## Step 3: Update Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
```

## Step 4: Enable Required Extensions

1. In Supabase dashboard, go to **Database** → **Extensions**
2. Search for and enable these extensions:
   - `uuid-ossp` (for UUID generation)
   - `vector` (for AI embeddings)

## Step 5: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Run each migration file in order:

### Migration 1: Initial Schema
Copy and paste the contents of `supabase/migrations/001_initial_schema.sql` and click **Run**

### Migration 2: Seed Plans
Copy and paste the contents of `supabase/migrations/002_seed_plans.sql` and click **Run**

### Migration 3: Admin Functions
Copy and paste the contents of `supabase/migrations/003_seed_admin.sql` and click **Run**

## Step 6: Create Your Admin Account

1. Register a new account in your easyAI app
2. In Supabase SQL Editor, run:
```sql
SELECT create_admin_user('your-email@example.com');
```
Replace with your actual email address.

## Step 7: Set Up Storage (Optional)

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket called `legal-documents`
3. Set it to **Public** if you want documents to be publicly accessible

## Step 8: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure these settings:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add your production URL when ready
   - **Email confirmations**: Disable for development (enable for production)

## Step 9: Test Your Setup

1. Start your development server: `npm run dev`
2. Try registering a new account
3. Check if the user appears in the **Authentication** → **Users** section
4. Verify the user record is created in the `users` table

## Next Steps

Once your database is set up, you can:

1. **Deploy Edge Functions** for AI chat functionality
2. **Configure Paystack** for payment processing
3. **Upload legal documents** for RAG functionality
4. **Test subscription flows**

## Troubleshooting

### Common Issues:

**"relation does not exist" errors**
- Make sure you ran all migrations in order
- Check that extensions are enabled

**Authentication not working**
- Verify your environment variables are correct
- Check that Site URL matches your development URL

**RLS policy errors**
- Ensure you're authenticated when testing
- Check that policies are created correctly

### Getting Help:

- Check Supabase logs in the dashboard
- Review the browser console for errors
- Consult [Supabase documentation](https://supabase.com/docs)

## Security Notes

- Never commit your `service_role` key to version control
- Use environment variables for all sensitive data
- Enable RLS policies before going to production
- Regularly rotate your database password