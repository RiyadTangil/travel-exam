import {
  LayoutDashboard,
  FileText,
  Settings,
  UserPlus,
  Target,
} from "lucide-react";
import type { DataNode } from "antd/es/tree";

export type NavItem = {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
};

export const getNavItems = (): NavItem[] => [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/dashboard",
  },
  {
    title: "Task Manager & CRM",
    icon: <Target className="h-5 w-5" />,
    href: "/dashboard/crm",
  },
  {
    title: "Configuration",
    icon: <Settings className="h-5 w-5" />,
    children: [
      {
        title: "My Company",
        icon: <Settings className="h-5 w-5" />,
        href: "/dashboard/profile",
      },
      {
        title: "Users",
        icon: <UserPlus className="h-5 w-5" />,
        children: [
          {
            title: "Manage Users",
            href: "/dashboard/configuration/users",
          },
          {
            title: "Roles",
            href: "/dashboard/configuration/roles",
          },
        ],
      },
      {
        title: "Invoice Templates",
        icon: <FileText className="h-5 w-5" />,
        href: "/dashboard/configuration/invoice-templates",
      },
    ],
  },
];

const crudChildren = (prefix: string) => [
  { title: "Create", key: `perm-${prefix}-create` },
  { title: "Edit", key: `perm-${prefix}-edit` },
  { title: "View", key: `perm-${prefix}-view` },
  { title: "Delete", key: `perm-${prefix}-delete` },
];

export const getPermissionTreeData = (): DataNode[] => {
  const items = getNavItems();

  const generateNodes = (navItems: NavItem[]): DataNode[] => {
    return navItems.map((item) => {
      const keyPrefix = item.href ? item.href : item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const node: DataNode = {
        title: item.title,
        key: `perm-${keyPrefix}`,
      };

      if (item.children && item.children.length > 0) {
        node.children = generateNodes(item.children);
      } else if (item.href) {
        // If it's a leaf node, add CRUD permissions
        // Exception: Dashboard and maybe some reports might not need full CRUD, 
        // but adding it everywhere is consistent.
        if (item.title === "Dashboard") {
          // Dashboard only needs View
          node.children = [{ title: "View", key: `perm-${keyPrefix}-view` }];
        } else {
          node.children = crudChildren(keyPrefix);
        }
      }

      return node;
    });
  };

  return [
    {
      title: "Select all",
      key: "perm-all",
      children: generateNodes(items),
    },
  ];
};
