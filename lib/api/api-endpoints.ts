/**
 * Centralized API endpoints and Query Keys for the retained modules.
 */

export const ENDPOINTS = {
  USERS: { URL: "/api/users", KEY: "users" },
  UPLOAD: { URL: "/api/upload", KEY: "upload" },
  CRM: {
    LEADS: { URL: "/api/crm/leads", KEY: "crm-leads" },
    METRICS: { URL: "/api/crm/metrics", KEY: "crm-metrics" },
    TASKS: { URL: "/api/crm/tasks", KEY: "crm-tasks" },
  },
  INVOICE_TEMPLATE_CONFIG: { URL: "/api/invoice-template-config", KEY: "invoice-template-config" },
};
