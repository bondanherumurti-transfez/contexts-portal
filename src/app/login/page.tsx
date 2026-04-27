"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { env } from "@/lib/env";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { Spinner } from "@/components/ui/Spinner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (user) router.replace("/inbox");
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-secondary">
        <Spinner size="lg" />
      </div>
    );
  }

  function handleGoogleLogin() {
    window.location.href = `${env.NEXT_PUBLIC_API_BASE}/api/auth/google/start`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-secondary">
      <div className="bg-background border-hairline rounded-lg p-8 w-80 text-center">
        {/* Logo mark */}
        <div className="flex justify-center mb-5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none">C</span>
          </div>
        </div>

        <p className="text-[15px] font-medium text-text-body mb-1">
          contextus portal
        </p>
        <p className="text-[12px] text-text-muted mb-6">
          manage your widgets and leads
        </p>

        {error === "auth_failed" && (
          <div className="mb-4 px-3 py-2 bg-error-bg text-error-text text-[11px] rounded text-left">
            sign-in failed — please try again
          </div>
        )}
        {error === "not_invited" && (
          <div className="mb-4 px-3 py-2 bg-error-bg text-error-text text-[11px] rounded text-left">
            your account hasn't been set up yet — contact us to get access
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          className="w-full h-[38px] flex items-center justify-center gap-2.5 border-hairline rounded text-[13px] text-text-body hover:bg-background-secondary transition-colors"
        >
          <GoogleIcon />
          continue with google
        </button>

        <p className="mt-5 text-[11px] text-text-muted">
          <a href="#" className="hover:underline">terms</a>
          {" · "}
          <a href="#" className="hover:underline">privacy</a>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.31a3.69 3.69 0 0 1-1.6 2.42v2h2.58c1.51-1.39 2.39-3.44 2.39-5.88Z" fill="#4285F4"/>
      <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.58-2a4.8 4.8 0 0 1-7.18-2.52H.86v2.07A8 8 0 0 0 8 16Z" fill="#34A853"/>
      <path d="M3.54 9.54A4.83 4.83 0 0 1 3.29 8c0-.54.09-1.06.25-1.54V4.39H.86A8.01 8.01 0 0 0 0 8c0 1.29.31 2.51.86 3.61l2.68-2.07Z" fill="#FBBC05"/>
      <path d="M8 3.18c1.22 0 2.31.42 3.17 1.24l2.37-2.37A7.95 7.95 0 0 0 8 0 8 8 0 0 0 .86 4.39l2.68 2.07A4.77 4.77 0 0 1 8 3.18Z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background-secondary">
          <Spinner size="lg" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
