import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const AdminHeader = ({ title, description, action }: AdminHeaderProps) => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 hover:bg-muted rounded-lg">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>
          {action && (
            <Button size="sm" className="gap-2" onClick={action.onClick}>
              <Plus className="w-4 h-4" />
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
