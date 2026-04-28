# Setting Up Your First Super Admin

After implementing the RBAC system, you need to designate your first super admin who can then create roles and add other MIS users.

## Prerequisites

- Database schema has been updated (`npx prisma db push` completed)
- Permissions have been seeded (`npx tsx scripts/seed-mis-permissions.ts` completed)
- You have at least one MIS user in the system

## Steps

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor**
3. Select the `mis_user` table
4. Find the user you want to make super admin
5. Click on their row to edit
6. Set `is_super_admin` to `true`
7. Click **Save**

### Option 2: Using SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Run this SQL (replace with your admin's email):

```sql
UPDATE mis_user
SET is_super_admin = true
WHERE email = 'your-admin@example.com';
```

5. Click **Run**

### Option 3: Using Prisma Studio

1. Open terminal in your project directory
2. Run: `npx prisma studio`
3. Navigate to `mis_user` table
4. Find your user
5. Set `is_super_admin` to `true`
6. Save

## Verification

1. Log in with the super admin account
2. Navigate to `/mis/users`
3. You should see your name with a "Super Admin" badge
4. Navigate to `/mis/roles`
5. You should see the "Create Role" button and full access

## What the Super Admin Can Do

Once set up, the super admin can:

✅ Create custom roles
✅ Assign permissions to roles
✅ Add new MIS users (with or without roles)
✅ Edit existing roles
✅ Delete roles (if no users assigned)
✅ Access all MIS features without restriction

## Security Notes

- ⚠️ Keep the number of super admins to a minimum (2-3 for redundancy)
- ⚠️ Super admin status cannot be assigned through the UI - it must be set directly in the database
- ⚠️ There is no "demote super admin" UI - you must update the database directly
- ⚠️ Document who your super admins are and why

## Next Steps

After setting up your first super admin:

1. **Create Roles**: Define roles for your organization (e.g., "Approver", "Support Agent")
2. **Assign Permissions**: Give each role the appropriate permissions
3. **Add Users**: Invite other MIS users and assign them roles

## Example Roles to Create

Here are some suggested starter roles:

### Candidate Approver
- `candidates.view`
- `candidates.approve`
- `candidates.edit`

### Support Agent
- `candidates.view`
- `employers.view`
- `jobs.view`
- `interviews.view`

### Operations Manager
- All "view" permissions
- `interviews.reschedule`
- `interviews.cancel`
- `jobs.moderate`

### Finance Admin
- `reports.view`
- `reports.export`
- `candidates.export`
- `employers.export`

## Troubleshooting

### "You do not have permission to add MIS users"
- Verify `is_super_admin` is set to `true` in the database
- Clear your browser cache and cookies
- Log out and log back in

### Can't see "Roles & Permissions" menu item
- Check if you're logged in as a MIS user (not candidate or employer)
- Verify the sidebar component has been updated

### Changes not reflecting
- Clear Next.js cache: Delete `.next` folder and restart dev server
- Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## Support

If you encounter issues:
1. Check the implementation summary: `docs/RBAC_IMPLEMENTATION_SUMMARY.md`
2. Check the full documentation: `docs/MIS_RBAC_SYSTEM.md`
3. Check database schema: Ensure all tables were created correctly
