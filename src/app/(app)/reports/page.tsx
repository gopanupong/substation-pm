"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { fetchReports, fetchProjects, fetchAttachments } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { ProgressReport, Project, Attachment } from "@/types/database";
import { formatDate, pct } from "@/lib/utils";
import { FileText, MapPin, Cloud, Camera, ChevronRight, User } from "lucide-react";
import Image from "next/image";

export default function ReportsPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState<string>("all");

  useEffect(() => {
    (async () => {
      try {
        const [r, p, a] = await Promise.all([fetchReports(), fetchProjects(), fetchAttachments()]);
        setReports(r); setProjects(p); setAttachments(a);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = filterProject === "all"
    ? reports
    : reports.filter((r) => r.project_id === filterProject);

  const getProject = (id: string) => projects.find((p) => p.id === id);
  const getAttachments = (reportId: string) => attachments.filter((a) => a.report_id === reportId);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t.reports}</h1>
          <p className="text-sm text-muted-foreground">{t.reportTitle}</p>
        </div>
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder={t.all} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.all}</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="size-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">{t.noReports}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.noReportsDesc}</p>
            <Button className="mt-4" onClick={() => router.push("/projects")}>
              {t.createFirstProject}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((report) => {
            const project = getProject(report.project_id);
            const imgs = getAttachments(report.id);
            return (
              <Card key={report.id} className="overflow-hidden">
                <CardContent className="p-5 space-y-3">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {project && (
                          <Badge variant="outline" className="text-[11px]">
                            {project.name}
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(report.report_date, locale === "th" ? "th" : "en")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {report.location && (
                          <span className="flex items-center gap-1"><MapPin className="size-3" />{report.location}</span>
                        )}
                        {report.weather && (
                          <span className="flex items-center gap-1"><Cloud className="size-3" />{report.weather}</span>
                        )}
                        {report.progress_delta != null && report.progress_delta > 0 && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0">
                            +{report.progress_delta}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/projects/${report.project_id}`)}>
                      {t.view} <ChevronRight className="size-4" />
                    </Button>
                  </div>

                  <Separator />

                  {/* Work done */}
                  <div>
                    <h4 className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                      <FileText className="size-3.5" /> {t.workDone}
                    </h4>
                    <p className="text-sm whitespace-pre-line">{report.work_done}</p>
                  </div>

                  {/* Issues */}
                  {report.issues && (
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
                      <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                        ⚠️ {t.issues}
                      </h4>
                      <p className="text-sm text-amber-800 dark:text-amber-300 whitespace-pre-line">{report.issues}</p>
                    </div>
                  )}

                  {/* Next steps */}
                  {report.next_steps && (
                    <div>
                      <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                        📋 {t.nextSteps}
                      </h4>
                      <p className="text-sm whitespace-pre-line">{report.next_steps}</p>
                    </div>
                  )}

                  {/* Photo attachments */}
                  {imgs.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {imgs.filter((a) => a.is_image).slice(0, 4).map((att) => (
                        <div key={att.id} className="relative size-20 rounded-lg overflow-hidden border group">
                          <Image
                            src={att.file_url}
                            alt={att.caption ?? att.file_name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                          {att.caption && (
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1 py-0.5">
                              <p className="text-[9px] text-white truncate">{att.caption}</p>
                            </div>
                          )}
                        </div>
                      ))}
                      {imgs.length > 4 && (
                        <div className="size-20 rounded-lg border flex items-center justify-center bg-muted text-sm text-muted-foreground">
                          +{imgs.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
