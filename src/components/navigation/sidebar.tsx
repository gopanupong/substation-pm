"use client";

import { useAuth } from "@/lib/auth/context";
import { useI18n } from "@/i18n/context";
import { isDemoMode } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, FolderKanban, ListTodo, FileText, Users,
  Zap, Sun, Moon, Globe, LogOut, ChevronLeft, Menu, Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  labelKey: keyof typeof import("@/i18n/dictionaries").dictionaries.th;
}

const navItems: NavItem[] = [
  { href: "/", icon: <LayoutDashboard className="size-4.5" />, labelKey: "dashboard" },
  { href: "/projects", icon: <FolderKanban className="size-4.5" />, labelKey: "projects" },
  { href: "/tasks", icon: <ListTodo className="size-4.5" />, labelKey: "tasks" },
  { href: "/reports", icon: <FileText className="size-4.5" />, labelKey: "reports" },
];

export function Sidebar() {
  const { user, profile, signOut, isDemo } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // ดึงชื่อจาก dictionary แบบ dynamic
  const getLabel = (key: NavItem["labelKey"]) => t[key] as string;

  return (
    <aside
      className={`no-print flex flex-col border-r border-border bg-sidebar transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Zap className="size-4" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold truncate">{t.appShort}</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto size-7 shrink-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={`size-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? getLabel(item.labelKey) : undefined}
            >
              {item.icon}
              {!collapsed && getLabel(item.labelKey)}
            </Link>
          );
        })}

        {/* Users — เฉพาะ admin */}
        {user?.role === "admin" && (
          <Link
            href="/users"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/users"
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground"
            } ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? t.users : undefined}
          >
            <Users className="size-4.5" />
            {!collapsed && t.users}
          </Link>
        )}
      </nav>

      {/* Bottom bar: user info + controls */}
      <div className="border-t border-border p-2">
        {/* Theme & Language */}
        <div className={`flex items-center gap-1 mb-2 ${collapsed ? "justify-center" : "px-1"}`}>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setLocale(locale === "th" ? "en" : "th")}
          >
            <Globe className="size-3.5" />
          </Button>
          {isDemo && (
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${collapsed ? "hidden" : ""}`}>
              DEMO
            </Badge>
          )}
        </div>

        <Separator />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-accent transition-colors ${collapsed ? "justify-center" : ""}`}>
              <Avatar className="size-8 shrink-0">
                <AvatarImage src={user?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">
                  {user?.full_name?.charAt(0) ?? "U"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.full_name ?? "—"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-56">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {t.role}: <span className="font-medium text-foreground">{t[`role_${user?.role}` as keyof typeof t] as string}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <Shield className="mr-2 size-4" /> {t.settings}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { signOut(); router.push("/login"); }}>
              <LogOut className="mr-2 size-4" /> {t.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
