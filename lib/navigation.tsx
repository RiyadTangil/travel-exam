import {
  LayoutDashboard,
  UserPlus,
  GraduationCap,
  Building2,
  HelpCircle,
} from "lucide-react";

export type NavItem = {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
};

export const getNavItems = (): NavItem[] => [
  {
    title: "কন্ট্রোল প্যানেল",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/dashboard",
  },
  {
    title: "শিক্ষার্থীর প্রোফাইল",
    icon: <GraduationCap className="h-5 w-5" />,
    href: "/dashboard/candidates",
  },
  {
    title: "প্রশ্ন ব্যাংক",
    icon: <HelpCircle className="h-5 w-5" />,
    href: "/dashboard/questions",
  },
  {
    title: "স্টাফ ও টিম",
    icon: <UserPlus className="h-5 w-5" />,
    href: "/dashboard/staff",
  },
  {
    title: "আমার এজেন্সি",
    icon: <Building2 className="h-5 w-5" />,
    href: "/dashboard/profile",
  },
];

