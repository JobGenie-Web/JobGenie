# Quick Start: Managing Permissions

## Grant All Permissions Toggle

A "Grant All Permissions" toggle has been added to the permissions manager to quickly grant or revoke all permissions at once.

### Location
`/mis/roles/[roleId]/permissions`

### How It Works
- **Toggle ON**: Grants all available permissions to the role (like super admin)
- **Toggle OFF**: Revokes all permissions from the role

### Visual
The toggle appears at the top of the permissions page in a highlighted alert box:
- Shows current status: "All Granted" or "Limited Access"
- Displays total number of permissions
- One-click to grant/revoke all

---

## Adding New Permissions

### Quick Method (3 Steps)

#### Step 1: Edit the Script
Open `scripts/add-mis-permissions.ts` and add your permissions:

```typescript
const NEW_PERMISSIONS: Permission[] = [
  { 
    resource: "billing", 
    action: "view", 
    description: "View billing dashboard" 
  },
  { 
    resource: "billing", 
    action: "edit", 
    description: "Manage billing settings" 
  },
];
```

#### Step 2: Run the Script
```bash
npm run mis:add-permissions
```

#### Step 3: Assign to Roles
1. Go to `/mis/roles`
2. Select a role → "Manage Permissions"
3. Find your new permissions
4. Check them and click "Save Changes"

---

## Available Commands

```bash
# Seed initial 32 permissions (run once during setup)
npm run mis:seed-permissions

# Add new permissions (run anytime)
npm run mis:add-permissions
```

---

## Examples

See `scripts/examples/example-add-permissions.ts` for ready-to-use permission sets:

- ✅ Billing Module (5 permissions)
- ✅ Content Moderation (4 permissions)
- ✅ Support Tickets (5 permissions)
- ✅ Analytics (4 permissions)
- ✅ Notifications (4 permissions)
- ✅ Email Campaigns (4 permissions)
- ✅ API Management (4 permissions)
- ✅ File Storage (4 permissions)

---

## Permission Format

```typescript
{
  resource: "resource_name",  // lowercase, singular (e.g., "billing", "tickets")
  action: "action_name",      // lowercase (e.g., "view", "create", "edit")
  description: "What this permission allows"
}
```

### Common Actions
- `view` - Read access
- `create` - Create new items
- `edit` - Modify existing items
- `delete` - Remove items
- `approve` - Approval workflow
- `export` - Export data
- `moderate` - Content moderation
- `manage` - Full management access

---

## Need More Help?

📖 **Detailed Guide**: `docs/ADDING_NEW_PERMISSIONS.md`
📋 **Full Documentation**: `docs/MIS_RBAC_SYSTEM.md`
🔧 **Helper Functions**: `src/lib/permissions.ts`

---

## Common Scenarios

### Scenario 1: I need billing permissions
1. Open `scripts/examples/example-add-permissions.ts`
2. Copy the `BILLING_PERMISSIONS` array
3. Paste into `scripts/add-mis-permissions.ts`
4. Run: `npm run mis:add-permissions`

### Scenario 2: I want to make a "Super User" role
1. Create role: `/mis/roles` → "Create Role"
2. Name it "Super User"
3. Go to "Manage Permissions"
4. Toggle "Grant All Permissions" ON
5. Save

### Scenario 3: I only want to give report access
1. Create role: "Report Viewer"
2. Go to "Manage Permissions"
3. Find "Reports" section
4. Check only `reports.view` and `reports.export`
5. Save

---

## Tips

💡 **Start Specific**: Don't grant all permissions unless necessary  
💡 **Test First**: Create a test role and test user before rolling out  
💡 **Document Roles**: Add clear descriptions when creating roles  
💡 **Regular Review**: Periodically review who has what permissions  
💡 **Use Groups**: Group related permissions (e.g., all billing permissions together)
