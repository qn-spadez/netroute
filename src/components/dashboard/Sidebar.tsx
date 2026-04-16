import { useState } from "react";
import { LayoutDashboard, Radio, BarChart3, Settings, Network, ChevronLeft, ChevronRight, Shield, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type View = "dashboard" | "live-traffic" | "analytics" | "security" | "alerts" | "settings";

interface Props {
  activeView: View;
  onViewChange: (view: View) => void;
}

const navItems = [
  { id: "dashboard" as View, label: "Dashboard", icon: LayoutDashboard },
  { id: "live-traffic" as View, label: "Live Traffic", icon: Radio },
  { id: "analytics" as View, label: "Analytics", icon: BarChart3 },
];

const bottomItems = [
  { id: "security" as View, label: "Security", icon: Shield },
  { id: "alerts" as View, label: "Alerts", icon: Bell },
  { id: "settings" as View, label: "Settings", icon: Settings },
];

const Sidebar = ({ activeView, onViewChange }: Props) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "h-full flex flex-col border-r border-border/20 transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
      style={{
        background: "linear-gradient(180deg, hsl(220 30% 7%) 0%, hsl(220 30% 5%) 100%)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/20">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110"
          style={{
            background: "linear-gradient(135deg, hsl(var(--neon) / 0.15), hsl(var(--neon) / 0.05))",
            border: "1px solid hsl(var(--neon) / 0.25)",
            boxShadow: "0 0 16px hsl(var(--neon) / 0.1)",
          }}
        >
          <Network className="w-4 h-4 text-neon drop-shadow-[0_0_6px_hsl(var(--neon)/0.5)]" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-heading font-bold text-foreground tracking-tight">NetRoute</p>
            <p className="text-[10px] text-muted-foreground tracking-wide">AI Smart Routing</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {!collapsed && (
          <p className="px-3 mb-3 text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium">Navigation</p>
        )}
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "nav-btn focus-glow",
              activeView === item.id
                ? "text-neon"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={activeView === item.id ? {
              background: "linear-gradient(135deg, hsl(var(--neon) / 0.12), hsl(var(--neon) / 0.04))",
              border: "1px solid hsl(var(--neon) / 0.2)",
              boxShadow: "0 0 16px hsl(var(--neon) / 0.08), inset 0 1px 0 hsl(var(--neon) / 0.1)",
            } : {
              border: "1px solid transparent",
            }}
          >
            <item.icon className={cn(
              "w-4 h-4 flex-shrink-0 transition-all duration-200",
              activeView === item.id && "drop-shadow-[0_0_6px_hsl(var(--neon)/0.5)]"
            )} />
            {!collapsed && <span className="truncate font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-border/20 space-y-1">
        {!collapsed && (
          <p className="px-3 mb-3 text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium">System</p>
        )}
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "nav-btn focus-glow",
              activeView === item.id
                ? "text-neon"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={activeView === item.id ? {
              background: "linear-gradient(135deg, hsl(var(--neon) / 0.12), hsl(var(--neon) / 0.04))",
              border: "1px solid hsl(var(--neon) / 0.2)",
              boxShadow: "0 0 16px hsl(var(--neon) / 0.08), inset 0 1px 0 hsl(var(--neon) / 0.1)",
            } : {
              border: "1px solid transparent",
            }}
          >
            <item.icon className={cn(
              "w-4 h-4 flex-shrink-0 transition-all duration-200",
              activeView === item.id && "drop-shadow-[0_0_6px_hsl(var(--neon)/0.5)]"
            )} />
            {!collapsed && <span className="truncate font-medium">{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-2 mb-3 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-all duration-200 border border-border/20 hover:border-border/40 hover:bg-muted/20 focus-glow"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
      </button>
    </div>
  );
};

export default Sidebar;
