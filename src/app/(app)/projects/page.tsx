"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Search, MapPin, Zap, Calendar, MoreVertical,
  Trash2, Edit, Eye, Filter,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { fetchProjects, deleteProject } from "@/lib/data";
import { cn, pct, progressColor, formatDate } from "@/lib/utils";
import { useI18n } from "@/i18n/context";
import { useAuth } from "@/lib/auth/context";
import type { Project, ProjectStatus } from "@/types/database";

// ====== status badge colors ======
const statusBadge: Record<ProjectStatus, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  planning:   { variant: "secondary", className: "" },
  active:     { variant: "default",   className: "bg-blue-600 text-white hover:bg-blue-600/90 border-transparent" },
  paused:     { variant: "outline",   className: "border-amber-500 text-amber-600 bg-amber-50" },
  completed:  { variant: "default",   className: "bg-emerald-600 text-white hover:bg-emerald-600/90 border-transparent" },
  delayed:    { variant: "destructive", className: "" },
};

const statusOptions: ProjectStatus[] = ["planning", "active", "paused", "completed", "delayed"];

// ====== skeleton card ======
function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}

// ====== main component ======
export default function ProjectsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canManage = user && (user.role === "admin" || user.role === "manager");

  // ---- fetch ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchProjects();
        if (!cancelled) setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ---- filter ----
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (q) {
        const haystack = `${p.name} ${p.code ?? ""} ${p.location ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [projects, search, statusFilter]);

  // ---- delete ----
  const handleDelete = async (id: string) => {
    if (!window.confirm(t.deleteConfirm)) return;
    setDeletingId(id);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.projects}</h1>
          <p className="text-muted-foreground text-sm">{t.dashboardSubtitle}</p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              {t.newProject}
            </Link>
          </Button>
        )}
      </div>

      {/* ===== Filters ===== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.search + " ..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.all}</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>{(t as Record<string, string>)[`status_${s}`]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ===== Loading ===== */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ===== Empty ===== */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-16">
          <div className="rounded-full bg-muted p-4">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium">{t.noProjects}</p>
            <p className="text-muted-foreground text-sm">{t.noProjectsDesc}</p>
          </div>
          {canManage && (
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                {t.createFirstProject}
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* ===== Grid ===== */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => {
            const p = pct(project.progress);
            const badge = statusBadge[project.status];
            return (
              <Card key={project.id} className="relative">
                {/* status badge top-right */}
                <div className="absolute right-4 top-4 z-10">
                  <Badge variant={badge.variant} className={badge.className}>
                    {(t as Record<string, string>)[`status_${project.status}`]}
                  </Badge>
                </div>

                <CardHeader className="pr-20">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  {project.code && (
                    <CardDescription className="font-mono text-xs">
                      {project.code}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* location */}
                  {project.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </div>
                  )}

                  {/* voltage + capacity */}
                  <div className="flex items-center gap-4 text-sm">
                    {project.voltage_level && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Zap className="h-4 w-4" />
                        {project.voltage_level}
                      </span>
                    )}
                    {project.capacity_mva != null && (
                      <span className="text-muted-foreground">
                        {project.capacity_mva} MVA
                      </span>
                    )}
                  </div>

                  {/* progress */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t.progress}</span>
                      <span className="font-medium">{p}%</span>
                    </div>
                    <Progress value={p} className={cn("h-3 [&>div]:", progressColor(p))} />
                  </div>

                  {/* owner + contractor */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    {project.owner && (
                      <div>
                        <span className="font-medium">{t.owner}:</span> {project.owner}
                      </div>
                    )}
                    {project.contractor && (
                      <div>
                        <span className="font-medium">{t.contractor}:</span> {project.contractor}
                      </div>
                    )}
                  </div>

                  {/* dates */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {formatDate(project.start_date)} &mdash; {formatDate(project.end_date)}
                    </span>
                  </div>

                  {/* footer */}
                  <div className="flex items-center justify-between pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/projects/${project.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t.view}
                      </Link>
                    </Button>

                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${project.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t.edit}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={deletingId === project.id}
                            onClick={() => handleDelete(project.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deletingId === project.id ? t.loading : t.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
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
