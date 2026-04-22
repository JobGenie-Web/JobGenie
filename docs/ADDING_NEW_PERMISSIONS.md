# How to Add New Permissions to the MIS RBAC System

This guide explains how to add new permissions to the JobGenie MIS system.

---

## Method 1: Using the Add Permissions Script (Recommended)

This is the easiest and safest way to add new permissions.

### Step 1: Edit the Script

Open `scripts/add-mis-permissions.ts` and add your new permissions to the `NEW_PERMISSIONS` array:

```typescript
const NEW_PERMISSIONS: Permission[] = [
  // Example: Add content moderation permissions
  { 
    resource: "content", 
    action: "view", 
    description: "View flagged content" 
  },
  { 
    resource: "content", 
    action: "moderate", 
    description: "Moderate and approve/reject content" 
  },
  
  // Example: Add support ticket permissions
  { 
    resource: "tickets", 
    action: "view", 
    description: "View support tickets" 
  },
  { 
    resource: "tickets", 
    action: "create", 
    description: "Create support tickets" 
  },
];
```

### Step 2: Run the Script

```bash
npx tsx scripts/add-mis-permissions.ts
```

The script will:
- ✅ Check if permissions already exist (won't create duplicates)
- ✅ Add only new permissions
- ✅ Show a summary of what was added
- ✅ Provide next steps

### Step 3: Assign to Roles

1. Navigate to `/mis/roles` in your browser
2. Click on a role or create a new one
3. Click "Manage Permissions"
4. You'll see your new permissions in the appropriate resource group
5. Select them and click "Save Changes"

---

## Method 2: Direct SQL Insert

If you prefer to add permissions directly via SQL:

```sql
INSERT INTO mis_permissions (name, resource, action, description)
VALUES 
  ('content.view', 'content', 'view', 'View flagged content'),
  ('content.moderate', 'content', 'moderate', 'Moderate and approve/reject content'),
  ('tickets.view', 'tickets', 'view', 'View support tickets'),
  ('tickets.create', 'tickets', 'create', 'Create support tickets');
```

**Note**: Make sure the `(resource, action)` combination is unique.

---

## Method 3: Via API (Programmatic)

You can also add permissions programmatically using the Supabase admin client:

```typescript
import { createAdminClient } from "@/lib/supabase/admin";

const adminClient = createAdminClient();

await adminClient.from("mis_permissions").insert({
  name: "content.view",
  resource: "content",
  action: "view",
  description: "View flagged content",
});
```

---

## Permission Naming Convention

### Format
```
resource.action
```

### Resource Names
Use lowercase, singular nouns for consistency:
- ✅ Good: `candidates`, `jobs`, `tickets`, `content`
- ❌ Bad: `Candidates`, `JOBS`, `ticket`, `contents`

### Action Names
Common actions used in the system:
- `view` - Read access
- `create` - Create new items
- `edit` - Modify existing items
- `delete` - Remove items
- `approve` - Approval workflow
- `export` - Export data
- `moderate` - Content moderation
- `manage_roles` - Special admin actions

### Examples
```typescript
// Good examples
{ resource: "billing", action: "view", description: "View billing information" }
{ resource: "billing", action: "edit", description: "Manage billing and subscriptions" }
{ resource: "analytics", action: "view", description: "View analytics dashboard" }
{ resource: "analytics", action: "export", description: "Export analytics reports" }

// Bad examples (avoid these)
{ resource: "Billing", action: "View", description: "..." } // Wrong case
{ resource: "billing-info", action: "read", description: "..." } // Use underscore not dash, use "view" not "read"
```

---

## Common Use Cases

### 1. Adding a New Module (e.g., Billing)

```typescript
const NEW_PERMISSIONS: Permission[] = [
  { resource: "billing", action: "view", description: "View billing dashboard and invoices" },
  { resource: "billing", action: "create", description: "Create and send invoices" },
  { resource: "billing", action: "edit", description: "Edit billing plans and pricing" },
  { resource: "billing", action: "export", description: "Export billing reports" },
];
```

### 2. Adding Content Moderation

```typescript
const NEW_PERMISSIONS: Permission[] = [
  { resource: "content", action: "view", description: "View flagged content queue" },
  { resource: "content", action: "moderate", description: "Approve or reject flagged content" },
  { resource: "content", action: "ban", description: "Ban users for policy violations" },
];
```

### 3. Adding Support Tickets

```typescript
const NEW_PERMISSIONS: Permission[] = [
  { resource: "tickets", action: "view", description: "View support tickets" },
  { resource: "tickets", action: "create", description: "Create support tickets" },
  { resource: "tickets", action: "assign", description: "Assign tickets to team members" },
  { resource: "tickets", action: "resolve", description: "Resolve and close tickets" },
];
```

### 4. Adding Advanced Analytics

```typescript
const NEW_PERMISSIONS: Permission[] = [
  { resource: "analytics", action: "view", description: "View analytics dashboard" },
  { resource: "analytics", action: "advanced", description: "Access advanced analytics features" },
  { resource: "analytics", action: "export", description: "Export analytics data" },
];
```

---

## Best Practices

### 1. Start Specific, Not General
- ❌ Don't create `system.admin` that does everything
- ✅ Create specific permissions like `users.delete`, `settings.edit`

### 2. Think About Roles First
Before adding permissions, think about what roles you'll create:
- "Support Agent" might need: `tickets.view`, `tickets.create`, `tickets.assign`
- "Billing Admin" might need: `billing.view`, `billing.edit`, `billing.export`

### 3. Group Related Permissions
Keep permissions for the same resource together:
```typescript
// Good - grouped by resource
{ resource: "tickets", action: "view", ... },
{ resource: "tickets", action: "create", ... },
{ resource: "tickets", action: "resolve", ... },

// Bad - scattered
{ resource: "tickets", action: "view", ... },
{ resource: "billing", action: "view", ... },
{ resource: "tickets", action: "create", ... }, // Should be with other ticket permissions
```

### 4. Write Clear Descriptions
The description appears in the UI when assigning permissions:
- ✅ Good: "View support tickets and their history"
- ❌ Bad: "View tickets" (too vague)
- ❌ Bad: "Allows the user to view all support tickets submitted by candidates and employers including their full history and attachments" (too long)

### 5. Consider Future Needs
Think about the full CRUD cycle:
- If you add `tickets.create`, you might later need:
  - `tickets.view`
  - `tickets.edit`
  - `tickets.delete`
  - `tickets.assign`
  - `tickets.resolve`

---

## Verifying Your Permissions

After adding permissions:

### 1. Check the Database
```sql
SELECT * FROM mis_permissions 
WHERE resource = 'your_resource'
ORDER BY action;
```

### 2. Check the UI
1. Go to `/mis/roles/[any-role-id]/permissions`
2. Look for your new resource group
3. Verify all permissions appear with correct descriptions

### 3. Test Assignment
1. Assign your new permissions to a test role
2. Assign that role to a test MIS user
3. Verify the permissions work as expected

---

## Troubleshooting

### "Permission already exists" Error
The script checks for duplicates. If you see this:
- Check if the permission exists: `SELECT * FROM mis_permissions WHERE name = 'resource.action'`
- Make sure you're using unique `(resource, action)` combinations

### Permissions Not Showing in UI
1. Clear your browser cache
2. Restart your Next.js dev server
3. Check the database to ensure they were inserted
4. Check browser console for errors

### Permission Checks Not Working
After adding permissions, you need to:
1. Assign them to a role
2. Assign that role to a user
3. Use the helper functions in your code:

```typescript
import { hasPermission } from "@/lib/permissions";

const canView = await hasPermission("tickets", "view");
if (!canView) {
  return <AccessDenied />;
}
```

---

## Quick Reference

### Script Location
`scripts/add-mis-permissions.ts`

### Run Command
```bash
npx tsx scripts/add-mis-permissions.ts
```

### Database Table
`mis_permissions`

### Permission Format
```typescript
{
  resource: string,  // lowercase, singular (e.g., "tickets")
  action: string,    // lowercase (e.g., "view", "create")
  description: string // Clear, concise description
}
```

### Helper Functions
```typescript
import { hasPermission, isSuperAdmin } from "@/lib/permissions";
```

---

## Examples by Industry

### E-commerce Platform
```typescript
{ resource: "products", action: "view", description: "View product catalog" },
{ resource: "products", action: "manage", description: "Add, edit, delete products" },
{ resource: "orders", action: "view", description: "View orders" },
{ resource: "orders", action: "process", description: "Process and fulfill orders" },
{ resource: "inventory", action: "view", description: "View inventory levels" },
{ resource: "inventory", action: "adjust", description: "Adjust inventory quantities" },
```

### SaaS Application
```typescript
{ resource: "subscriptions", action: "view", description: "View subscription plans" },
{ resource: "subscriptions", action: "manage", description: "Manage user subscriptions" },
{ resource: "api_keys", action: "view", description: "View API keys" },
{ resource: "api_keys", action: "create", description: "Generate API keys" },
{ resource: "webhooks", action: "view", description: "View webhook configurations" },
{ resource: "webhooks", action: "manage", description: "Configure webhooks" },
```

### Healthcare Platform
```typescript
{ resource: "patients", action: "view", description: "View patient records" },
{ resource: "patients", action: "edit", description: "Edit patient information" },
{ resource: "appointments", action: "view", description: "View appointments" },
{ resource: "appointments", action: "schedule", description: "Schedule appointments" },
{ resource: "medical_records", action: "view", description: "Access medical records" },
{ resource: "medical_records", action: "export", description: "Export medical data" },
```

---

## Need Help?

- 📖 Full RBAC documentation: `docs/MIS_RBAC_SYSTEM.md`
- 📋 Implementation summary: `docs/RBAC_IMPLEMENTATION_SUMMARY.md`
- 🔧 Helper functions: `src/lib/permissions.ts`
