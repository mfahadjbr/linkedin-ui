"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { useAuth } from "@/hooks/auth";
import { useLinkedIn } from "@/hooks/linkedin";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense, useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isConnected, isLoading: linkedInLoading, checkConnection } = useLinkedIn();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectingRef = useRef(false);
  const lastPathnameRef = useRef(pathname);
  const linkedInCheckedRef = useRef(false);
  const oauthRedirectHandledRef = useRef(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Reset redirect flag when pathname changes
  useEffect(() => {
    if (lastPathnameRef.current !== pathname) {
      redirectingRef.current = false;
      linkedInCheckedRef.current = false;
      oauthRedirectHandledRef.current = false;
      lastPathnameRef.current = pathname;
    }
  }, [pathname]);

  // Check if this is a fresh OAuth redirect (has token in URL)
  useEffect(() => {
    if (oauthRedirectHandledRef.current) return;
    
    const tokenInUrl = searchParams?.get('token');
    const successInUrl = searchParams?.get('success');
    
    // If token is in URL, this is a fresh OAuth redirect
    if (tokenInUrl && successInUrl === 'true') {
      oauthRedirectHandledRef.current = true;
      
      // Clean up URL (remove token and other OAuth params) for security
      if (typeof window !== 'undefined') {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('token');
        newUrl.searchParams.delete('success');
        newUrl.searchParams.delete('user');
        newUrl.searchParams.delete('email');
        window.history.replaceState({}, document.title, newUrl.pathname + (newUrl.search || ''));
      }
      
      // Check LinkedIn connection after OAuth (similar to login page)
      if (!linkedInCheckedRef.current) {
        linkedInCheckedRef.current = true;
        checkConnection();
      }
    }
  }, [searchParams, checkConnection]);

  // Handle authentication check
  useEffect(() => {
    // Don't redirect if already redirecting or still loading
    if (redirectingRef.current || isLoading || !pathname?.startsWith("/dashboard")) return;
    
    // Check localStorage as source of truth
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const hasToken = !!token;
    
    // If no token and not authenticated, redirect to login
    if (!hasToken && !isAuthenticated) {
      redirectingRef.current = true;
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Handle LinkedIn check redirect after OAuth (similar to login page)
  useEffect(() => {
    // Only handle OAuth redirect case
    if (!oauthRedirectHandledRef.current || redirectingRef.current) return;
    
    // Wait for LinkedIn check to complete
    if (linkedInLoading || !linkedInCheckedRef.current) return;
    
    // Don't redirect if already on linkedin-connect page
    if (pathname === "/linkedin-connect") return;
    
    redirectingRef.current = true;
    
    // Redirect based on LinkedIn connection status (just like in simple auth)
    // If isConnected is true, stay on current page; if false, go to LinkedIn connect
    if (!isConnected) {
      router.replace("/linkedin-connect");
    }
  }, [isConnected, linkedInLoading, pathname, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F9FF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#F4F9FF] overflow-hidden flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 z-40 flex-shrink-0 sticky top-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
            P
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            Post<span className="text-primary">siva</span>
          </span>
        </Link>
        {/* The toggle button is now handled by the DashboardSidebar component directly for better state visibility */}
      </header>

      <DashboardSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 overflow-y-auto relative custom-scrollbar w-full">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#F4F9FF]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
