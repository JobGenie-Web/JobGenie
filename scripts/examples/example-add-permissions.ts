/**
 * EXAMPLE: How to add new permissions
 * 
 * This is an example file showing different scenarios for adding permissions.
 * Copy the permissions you need to scripts/add-mis-permissions.ts
 */

interface Permission {
  resource: string;
  action: string;
  description: string;
}

// ============================================
// Example 1: Adding Billing Module
// ============================================
const BILLING_PERMISSIONS: Permission[] = [
  { 
    resource: "billing", 
    action: "view", 
    description: "View billing dashboard and invoices" 
  },
  { 
    resource: "billing", 
    action: "create", 
    description: "Create and send invoices" 
  },
  { 
    resource: "billing", 
    action: "edit", 
    description: "Edit billing plans and pricing" 
  },
  { 
    resource: "billing", 
    action: "delete", 
    description: "Delete or void invoices" 
  },
  { 
    resource: "billing", 
    action: "export", 
    description: "Export billing reports and data" 
  },
];

// ============================================
// Example 2: Adding Content Moderation
// ============================================
const MODERATION_PERMISSIONS: Permission[] = [
  { 
    resource: "content", 
    action: "view", 
    description: "View flagged content queue" 
  },
  { 
    resource: "content", 
    action: "moderate", 
    description: "Approve or reject flagged content" 
  },
  { 
    resource: "content", 
    action: "ban", 
    description: "Ban users for policy violations" 
  },
  { 
    resource: "content", 
    action: "restore", 
    description: "Restore previously removed content" 
  },
];

// ============================================
// Example 3: Adding Support Tickets
// ============================================
const SUPPORT_PERMISSIONS: Permission[] = [
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
  { 
    resource: "tickets", 
    action: "assign", 
    description: "Assign tickets to team members" 
  },
  { 
    resource: "tickets", 
    action: "resolve", 
    description: "Resolve and close tickets" 
  },
  { 
    resource: "tickets", 
    action: "export", 
    description: "Export ticket reports" 
  },
];

// ============================================
// Example 4: Adding Analytics Module
// ============================================
const ANALYTICS_PERMISSIONS: Permission[] = [
  { 
    resource: "analytics", 
    action: "view", 
    description: "View analytics dashboard" 
  },
  { 
    resource: "analytics", 
    action: "advanced", 
    description: "Access advanced analytics features" 
  },
  { 
    resource: "analytics", 
    action: "export", 
    description: "Export analytics data and reports" 
  },
  { 
    resource: "analytics", 
    action: "configure", 
    description: "Configure analytics tracking and settings" 
  },
];

// ============================================
// Example 5: Adding Notifications System
// ============================================
const NOTIFICATION_PERMISSIONS: Permission[] = [
  { 
    resource: "notifications", 
    action: "view", 
    description: "View notification templates and history" 
  },
  { 
    resource: "notifications", 
    action: "create", 
    description: "Create notification templates" 
  },
  { 
    resource: "notifications", 
    action: "send", 
    description: "Send notifications to users" 
  },
  { 
    resource: "notifications", 
    action: "manage", 
    description: "Manage notification settings and preferences" 
  },
];

// ============================================
// Example 6: Adding Email Campaign System
// ============================================
const CAMPAIGN_PERMISSIONS: Permission[] = [
  { 
    resource: "campaigns", 
    action: "view", 
    description: "View email campaigns" 
  },
  { 
    resource: "campaigns", 
    action: "create", 
    description: "Create and schedule email campaigns" 
  },
  { 
    resource: "campaigns", 
    action: "send", 
    description: "Send email campaigns" 
  },
  { 
    resource: "campaigns", 
    action: "analyze", 
    description: "Analyze campaign performance" 
  },
];

// ============================================
// Example 7: Adding API Management
// ============================================
const API_PERMISSIONS: Permission[] = [
  { 
    resource: "api", 
    action: "view", 
    description: "View API keys and usage" 
  },
  { 
    resource: "api", 
    action: "create", 
    description: "Generate API keys" 
  },
  { 
    resource: "api", 
    action: "revoke", 
    description: "Revoke API keys" 
  },
  { 
    resource: "api", 
    action: "logs", 
    description: "View API request logs" 
  },
];

// ============================================
// Example 8: Adding File Storage Management
// ============================================
const STORAGE_PERMISSIONS: Permission[] = [
  { 
    resource: "storage", 
    action: "view", 
    description: "View storage usage and files" 
  },
  { 
    resource: "storage", 
    action: "upload", 
    description: "Upload files" 
  },
  { 
    resource: "storage", 
    action: "delete", 
    description: "Delete files" 
  },
  { 
    resource: "storage", 
    action: "configure", 
    description: "Configure storage settings and policies" 
  },
];

// ============================================
// HOW TO USE THIS FILE
// ============================================
// 1. Choose the permissions you need from the examples above
// 2. Copy them to scripts/add-mis-permissions.ts
// 3. Run: npm run mis:add-permissions
// 4. Go to /mis/roles and assign the new permissions to roles
