# बारी परिणय सूत्र — Bari Parinay Sutra

GitHub-ready matrimonial website for the Bari community.

## Stack
- HTML/CSS/JavaScript frontend
- Supabase Auth + PostgreSQL + Row Level Security
- GitHub for source code / deployment

## Setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase.sql`.
3. In Supabase Authentication, create your private Admin user.
4. Copy that user's UUID and run:
   `insert into public.admins(user_id) values ('YOUR-UUID');`
5. Put the Supabase Project URL and anon/public key into `config.js`.
6. Never put a `service_role` key in the website.
7. Upload these files to a GitHub repository.
8. Enable GitHub Pages from the repository settings if desired.

## Security
- Admin access is controlled by the database `admins` table + RLS, not by hiding a button.
- Phone/email are not included in the public profile view.
- Profiles are pending by default and only approved profiles are public.
- Admin can approve, reject and block profiles.
- Users cannot access the admin data unless their auth user is present in `admins`.

## Production recommendations
- Enable email confirmation in Supabase Auth.
- Add CAPTCHA / bot protection.
- Add report/block workflow.
- Add secure image storage using Supabase Storage with file-size/type limits.
- Add privacy policy, terms, consent and grievance/contact information before public launch.
- Consider OTP/mobile verification if you want stronger identity checks.
