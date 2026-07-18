"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-4 p-6">
      <AlertCircle className="size-12 text-destructive" />
      <h2 className="text-lg font-semibold">เกิดข้อผิดพลาด</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        {error.message || "ไม่สามารถโหลดหน้านี้ได้ กรุณาลองอีกครั้ง"}
      </p>
      <Button variant="outline" onClick={reset}>
        ลองอีกครั้ง
      </Button>
    </div>
  );
}
