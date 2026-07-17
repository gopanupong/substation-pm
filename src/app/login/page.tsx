"use client";

import { useAuth } from "@/lib/auth/context";
import { useI18n } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import {
  Zap, Sun, Moon, Globe, Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Role } from "@/types/database";
import { isDemoMode } from "@/lib/supabase/config";

export default function LoginPage() {
  const { signInWithGoogle, signInDemo, isDemo } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>("manager");

  // เข้า demo ทันทีถ้ามี role ที่เลือก
  const handleDemo = () => {
    signInDemo(selectedRole);
    router.push("/");
  };

  const roleOptions: { role: Role; label: string; desc: string }[] = [
    { role: "admin", label: t.role_admin, desc: t.role_admin_desc },
    { role: "manager", label: t.role_manager, desc: t.role_manager_desc },
    { role: "editor", label: t.role_editor, desc: t.role_editor_desc },
    { role: "viewer", label: t.role_viewer, desc: t.role_viewer_desc },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* พื้นหลังลวดลาย */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Zap className="size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t.appName}</h1>
          <p className="text-muted-foreground text-sm">{t.loginSubtitle}</p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{t.loginTitle}</CardTitle>
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <Shield className="size-3.5" />
              {t.secureLogin}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Login */}
            {!isDemo && (
              <Button
                className="w-full gap-3"
                size="lg"
                onClick={signInWithGoogle}
              >
                <svg className="size-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t.loginWithGoogle}
              </Button>
            )}

            {isDemo && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t.loginDemoDesc}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {roleOptions.map((opt) => (
                      <button
                        key={opt.role}
                        onClick={() => setSelectedRole(opt.role)}
                        className={`rounded-lg border p-3 text-left transition-all hover:bg-accent ${
                          selectedRole === opt.role
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">{opt.label}</span>
                          {selectedRole === opt.role && (
                            <Badge variant="default" className="ml-auto px-1.5 py-0 text-[10px]">✓</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                          {opt.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                  <Button className="w-full" size="lg" onClick={handleDemo}>
                    {t.loginDemo}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer: theme + language */}
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-accent"
          >
            {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            {theme === "dark" ? t.lightMode : t.darkMode}
          </button>
          <Separator orientation="vertical" className="h-4" />
          <button
            onClick={() => setLocale(locale === "th" ? "en" : "th")}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-accent"
          >
            <Globe className="size-3.5" />
            {locale === "th" ? "ไทย / EN" : "EN / ไทย"}
          </button>
        </div>

        {/* Demo mode badge */}
        {isDemo && (
          <div className="text-center">
            <Badge variant="outline" className="text-[11px]">
              🔧 {t.demoNotice}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
