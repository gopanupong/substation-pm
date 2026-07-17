"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { fetchProfiles, updateProfileRole } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Profile, Role } from "@/types/database";
import { cn } from "@/lib/utils";
import { Users, Shield, Mail, Phone, Building2, MapPin } from "lucide-react";
import { toast } from "sonner";

const roleColors: Record<Role, string> = {
  admin: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  manager: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  editor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  viewer: "bg-secondary text-secondary-foreground",
};

export default function UsersPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);

  // เฉพาะ admin เข้าได้
  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield className="size-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-medium">{t.permissionDenied}</h2>
      </div>
    );
  }

  useEffect(() => {
    (async () => {
      try { setProfiles(await fetchProfiles()); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      const updated = await updateProfileRole(userId, newRole);
      setProfiles((prev) => prev.map((p) => (p.id === userId ? updated : p)));
      setEditing(null);
      toast.success(t.savedSuccess);
    } catch (e) {
      toast.error(t.errorOccurred);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="size-6" /> {t.users}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">จัดการสิทธิ์การใช้งานของผู้ใช้ทั้งหมด</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => {
            const isEditing = editing === profile.id;
            return (
              <Card key={profile.id} className="overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  {/* User header */}
                  <div className="flex items-start gap-3">
                    <Avatar className="size-12">
                      <AvatarImage src={profile.avatar_url ?? undefined} />
                      <AvatarFallback className="text-sm font-bold">
                        {(profile.full_name ?? profile.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{profile.full_name ?? "—"}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="size-3" /> {profile.email}
                      </p>
                    </div>
                    {/* Role badge */}
                    {isEditing ? (
                      <Select
                        value={profile.role}
                        onValueChange={(v) => handleRoleChange(profile.id, v as Role)}
                      >
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(["admin", "manager", "editor", "viewer"] as Role[]).map((r) => (
                            <SelectItem key={r} value={r}>
                              {t[`role_${r}` as keyof typeof t] as string}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        variant="outline"
                        className={cn("text-[11px] cursor-pointer hover:opacity-80", roleColors[profile.role])}
                        onClick={() => setEditing(profile.id)}
                        title="คลิกเพื่อเปลี่ยนสิทธิ์"
                      >
                        <Shield className="size-3 mr-0.5" />
                        {t[`role_${profile.role}` as keyof typeof t] as string}
                      </Badge>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {profile.position && (
                      <p className="flex items-center gap-1.5">
                        <Building2 className="size-3" /> {profile.position}
                      </p>
                    )}
                    {profile.department && (
                      <p className="flex items-center gap-1.5">
                        <Building2 className="size-3" /> {profile.department}
                      </p>
                    )}
                    {profile.region && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="size-3" /> {profile.region}
                      </p>
                    )}
                    {profile.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="size-3" /> {profile.phone}
                      </p>
                    )}
                  </div>

                  {/* Role description */}
                  <div className="rounded-lg bg-muted/50 p-2.5 text-[11px] text-muted-foreground">
                    {t[`role_${profile.role}_desc` as keyof typeof t] as string}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
