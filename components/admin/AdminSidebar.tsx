import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CreditCard,
  Settings,
  LogOut,
  BarChart3,
} from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/admin" },
    { icon: FolderKanban, label: "Projects", path: "/admin/projects", badge: 12 },
    { icon: Users, label: "Clients", path: "/admin/clients" },
    { icon: CreditCard, label: "Payments", path: "/admin/payments" },
    { icon: BarChart3, label: "Reports", path: "/admin/reports" },
    { icon: LayoutDashboard, label: "Logistics", path: "/admin/logistics" },
    { icon: LayoutDashboard, label: "Coupons", path: "/admin/coupons" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: LayoutDashboard, label: "Support", path: "/admin/support" },
    { icon: LayoutDashboard, label: "Notifications", path: "/admin/notifications" },
    { icon: LayoutDashboard, label: "Affiliates", path: "/admin/affiliates" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-foreground text-background hidden lg:block">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-background/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">W</span>
            </div>
            <div>
              <span className="font-bold">WebOwnr</span>
              <span className="block text-xs text-background/60">Admin Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
                isActive(item.path)
                  ? "bg-background/10 text-background"
                  : "text-background/60 hover:bg-background/5 hover:text-background"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="absolute right-3 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-background/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-medium">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">Admin User</p>
              <p className="text-xs text-background/60 truncate">admin@webownr.com</p>
            </div>
            <button className="p-2 hover:bg-background/10 rounded-lg">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
