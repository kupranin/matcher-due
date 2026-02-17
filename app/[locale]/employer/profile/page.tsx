"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

export default function EmployerProfileRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/employer/cabinet/profile");
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-500">Redirecting to company profile...</p>
    </div>
  );
}
