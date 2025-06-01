import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "fas fa-chart-line" },
  { name: "Campaigns", href: "/campaigns", icon: "fas fa-bullhorn" },
  { name: "Create Campaign", href: "/create-campaign", icon: "fas fa-plus-circle" },
  { name: "Customers", href: "/customers", icon: "fas fa-users" },
  { name: "Analytics", href: "/analytics", icon: "fas fa-chart-bar" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-40">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-users text-white"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Xeno CRM</h2>
            <p className="text-sm text-slate-500">Campaign Manager</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start px-4 py-3 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <i className={`${item.icon} mr-3`}></i>
                    {item.name}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
            alt="User Avatar"
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <i className="fas fa-sign-out-alt"></i>
          </Button>
        </div>
      </div>
    </aside>
  );
}
