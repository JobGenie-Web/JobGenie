# MIS RBAC System Documentation

## Overview

The MIS (Management Information System) now includes a comprehensive Role-Based Access Control (RBAC) system that allows super administrators to:

- Create custom roles
- Assign granular permissions to roles
- Assign roles to MIS users
- Control access to different parts of the MIS system

## Key Concepts

### Super Admin
- The highest level of access in the system
- Can perform all actions without restrictions
- Can create/edit/delete roles and permissions
- Can add other MIS users
- Identified by `is_super_admin = true` in the `mis_user` table

### Roles
- Named collections of permissions (e.g., "Approver", "Support Agent", "Finance Admin")
- Can be assigned to multiple MIS users
- Can have multiple permissions
- Managed through the `/mis/roles` interface

### Permissions
- Granular access controls for specific resources and actions
- Format: `resource.action` (e.g., `candidates.approve`, `jobs.edit`)
- Pre-seeded with 32 standard permissions covering all MIS operations

## Database Schema

### Tables

#### `mis_user`
- Added fields:
  - `role_id` (UUID, nullable) - The assigned role
  - `is_super_admin` (Boolean, default false) - Super admin flag

#### `mis_roles`
- `id` (UUID, primary key)
- `name` (String, unique) - Role name
- `description` (Text, nullable) - Role description
- `is_active` (Boolean) - Whether the role is active
- `created_by` (UUID) - MIS user who created the role
- `created_at`, `updated_at`

#### `mis_permissions`
- `id` (UUID, primary key)
- `name` (String, unique) - Permission name (e.g., `candidates.approve`)
- `resource` (String) - Resource type (e.g., `candidates`, `jobs`)
- `action` (String) - Action type (e.g., `view`, `create`, `edit`, `delete`)
- `description` (Text, nullable) - Permission description

#### `mis_role_permissions`
- `role_id` (UUID, FK to `mis_roles`)
- `permission_id` (UUID, FK to `mis_permissions`)
- `assigned_by` (UUID) - MIS user who assigned this permission
- `assigned_at` (Timestamp)

## Default Permissions

The system comes with 32 pre-seeded permissions organized by resource:

### Candidates
- `candidates.view` - View candidate profiles and list
- `candidates.approve` - Approve or reject candidate profiles
- `candidates.edit` - Edit candidate information
- `candidates.delete` - Delete candidate accounts
- `candidates.export` - Export candidate data

### Employers
- `employers.view` - View employer profiles and companies
- `employers.approve` - Approve or reject employer/company profiles
- `employers.edit` - Edit employer/company information
- `employers.delete` - Delete employer accounts
- `employers.export` - Export employer data

### Jobs
- `jobs.view` - View all job postings
- `jobs.create` - Create job postings
- `jobs.edit` - Edit job postings
- `jobs.delete` - Delete job postings
- `jobs.moderate` - Moderate and flag job postings

### Interviews
- `interviews.view` - View interview schedules and details
- `interviews.reschedule` - Reschedule interviews
- `interviews.cancel` - Cancel interviews

### MIS Users
- `users.view` - View MIS users list
- `users.create` - Create new MIS user accounts
- `users.edit` - Edit MIS user information
- `users.delete` - Delete MIS user accounts
- `users.manage_roles` - Assign roles to MIS users

### Roles & Permissions
- `roles.view` - View roles and permissions
- `roles.create` - Create new roles
- `roles.edit` - Edit roles and assign permissions
- `roles.delete` - Delete roles

### Reports & Analytics
- `reports.view` - View system reports and analytics
- `reports.export` - Export reports and data

### Audit Logs
- `audit.view` - View audit logs and system activity

### Settings
- `settings.view` - View system settings
- `settings.edit` - Edit system settings and configuration

## How to Use

### For Super Admins

#### 1. Create a Role

1. Navigate to `/mis/roles`
2. Click "Create Role"
3. Enter role name and description
4. Click "Create Role"
5. You'll be redirected to the permissions page

#### 2. Assign Permissions to a Role

1. Navigate to `/mis/roles`
2. Click on a role or click "Manage Permissions" from the dropdown
3. Select/deselect permissions as needed
   - **Quick Option**: Use the "Grant All Permissions" toggle to grant/revoke all permissions at once
   - **Granular Option**: Select individual permissions or use "Select All" per resource group
4. Click "Save Changes"

#### 3. Add a MIS User with Role

1. Navigate to `/mis/users`
2. Click "Add MIS User"
3. Fill in user details
4. Select a role from the dropdown (optional)
5. Click "Send Invitation"

#### 4. Add New Permissions (Optional)

When you need to add new permissions to the system:

1. Edit `scripts/add-mis-permissions.ts`
2. Add your new permissions to the `NEW_PERMISSIONS` array
3. Run: `npx tsx scripts/add-mis-permissions.ts`
4. Assign the new permissions to roles as needed

📖 **Detailed guide**: See `docs/ADDING_NEW_PERMISSIONS.md`

### For Developers

#### Checking Permissions in Code

```typescript
import { hasPermission, isSuperAdmin } from "@/lib/permissions";

// Check a specific permission
const canApprove = await hasPermission("candidates", "approve");

// Check if user is super admin
const isAdmin = await isSuperAdmin();

// In API routes
if (!await hasPermission("jobs", "edit")) {
    return NextResponse.json(
        { error: "You don't have permission to edit jobs" },
        { status: 403 }
    );
}
```

#### Available Helper Functions

```typescript
// Check single permission
hasPermission(resource: string, action: string): Promise<boolean>

// Check if user has any of the permissions
hasAnyPermission(permissions: Array<{resource, action}>): Promise<boolean>

// Check if user has all permissions
hasAllPermissions(permissions: Array<{resource, action}>): Promise<boolean>

// Check if user is super admin
isSuperAdmin(): Promise<boolean>

// Get all user permissions
getUserPermissions(): Promise<Array<{resource, action, name}>>
```

## Migration Steps

### Setting Up the First Super Admin

When you first deploy this system, you need to manually set one MIS user as a super admin:

```sql
UPDATE mis_user
SET is_super_admin = true
WHERE email = 'your-admin@example.com';
```

After this, that user can:
- Create roles
- Assign permissions to roles
- Add other MIS users with or without roles

## Best Practices

1. **Principle of Least Privilege**: Only grant the minimum permissions needed for each role
2. **Role Naming**: Use clear, descriptive names (e.g., "Candidate Approver", "Support Agent")
3. **Regular Audits**: Periodically review roles and permissions
4. **Documentation**: Document what each custom role is for and who should have it
5. **Super Admin Limit**: Keep the number of super admins to a minimum (2-3 for redundancy)

## Security Considerations

- Super admin status cannot be assigned through the UI - it must be set directly in the database
- Roles cannot be deleted if they have users assigned
- Permission checks are performed at the API level for all protected operations
- All role and permission changes are logged in the audit system

## Future Enhancements

Potential additions for Phase 2+:
- Time-based role assignments (temporary access)
- Permission inheritance hierarchies
- API rate limits per role
- Custom permissions (user-defined)
- Permission templates for common role types
- Multi-factor authentication for super admins
