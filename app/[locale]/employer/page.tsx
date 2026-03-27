"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

export default function EmployerPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/employer/register");
  }, [router]);
  return null;
}
