"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useLinkedIn } from "@/hooks/linkedin";
import { useAuth } from "@/hooks/auth";
import { Button } from "@/components/ui/button";
import { Linkedin, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function LinkedInConnectPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isConnected, isLoading, error, connectLinkedIn, checkConnection } = useLinkedIn();
  const [isConnecting, setIsConnecting] = useState(false);
  const redirectingRef = useRef(false);

  // Redirect to login if not authenticated (with guards)
  useEffect(() => {
    // Wait for auth check to complete
    if (authLoading || redirectingRef.current) return;
    
    // Check localStorage as source of truth
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    // Only redirect if definitely not authenticated (no token in localStorage)
    if (!token && !isAuthenticated) {
      redirectingRef.current = true;
      router.replace("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Check connection status on mount (only once)
  const checkedRef = useRef(false);
  useEffect(() => {
    if (!authLoading && isAuthenticated && !checkedRef.current) {
      checkedRef.current = true;
      // Small delay to ensure auth state is fully settled
      const timer = setTimeout(() => {
        checkConnection();
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]); // checkConnection is stable, safe to omit

  // Redirect to dashboard if already connected (with guards)
  useEffect(() => {
    // Don't redirect if already redirecting or auth is loading
    if (redirectingRef.current || authLoading) return;
    
    // If connected (regardless of loading state), redirect to dashboard
    // The loading state might be true during the check, but if isConnected is true,
    // it means we have a valid connection and should redirect
    if (isConnected) {
      // Prevent multiple redirects
      if (redirectingRef.current) return;
      redirectingRef.current = true;
      
      // Small delay to show success state, then redirect
      const timer = setTimeout(() => {
        try {
          router.replace("/dashboard/profile");
        } catch (error) {
          console.error("Redirect error:", error);
          // Fallback: use window.location if router fails
          window.location.href = "/dashboard/profile";
        }
      }, 1500);
      
      // Fallback: Force redirect after 5 seconds if router.replace doesn't work
      const fallbackTimer = setTimeout(() => {
        if (window.location.pathname === "/linkedin-connect") {
          console.warn("Redirect timeout, forcing navigation");
          window.location.href = "/dashboard/profile";
        }
      }, 5000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(fallbackTimer);
      };
    }
  }, [isConnected, authLoading, router]);

  const handleConnect = async () => {
    setIsConnecting(true);
    const result = await connectLinkedIn();
    
    if (result.success && result.authUrl) {
      // Open LinkedIn OAuth in popup
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      const popup = window.open(
        result.authUrl,
        'linkedin-oauth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=yes,status=yes`
      );

      if (!popup) {
        alert('Popup blocked. Please allow popups for this site.');
        setIsConnecting(false);
        return;
      }

      // Poll for popup closure and check connection
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          setIsConnecting(false);
          // Check connection status after popup closes
          checkConnection();
        }
      }, 500);

      // Timeout after 5 minutes
      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
          clearInterval(checkPopup);
          setIsConnecting(false);
        }
      }, 5 * 60 * 1000);
    } else {
      setIsConnecting(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Check token directly as source of truth
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!isAuthenticated && !token) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-[#F4F9FF]">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="glow-effect top-0 left-0 w-[800px] h-[800px] opacity-40" />
      <div className="glow-effect bottom-0 right-0 w-[600px] h-[600px] opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px] relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-3xl mb-6 shadow-xl shadow-primary/30">
            <Linkedin className="w-12 h-12 text-white fill-current" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
            {isConnected ? "LinkedIn Connected!" : "Connect LinkedIn"}
          </h1>
          <p className="text-slate-600 font-bold">
            {isConnected
              ? "Your LinkedIn account is successfully connected"
              : "Scale your reach and automate your engagement"}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-primary/10 border border-white">
          {isLoading && !isConnected ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-bold">Checking connection status...</p>
            </div>
          ) : isConnected ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Successfully Connected!</h3>
              <p className="text-slate-600 font-bold mb-8">
                Redirecting to your dashboard...
              </p>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="bg-primary h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3"
                >
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-4">
                {[
                  { id: 1, title: "Authorize Access", desc: "Grant permission to post on your LinkedIn account" },
                  { id: 2, title: "Secure Connection", desc: "Your credentials are stored securely on our servers" },
                  { id: 3, title: "Start Posting", desc: "Create and schedule posts directly from dashboard" }
                ].map((step) => (
                  <div key={step.id} className="flex items-start gap-4 p-5 bg-primary/5 rounded-[1.5rem] border border-primary/10 group hover:bg-primary/10 transition-colors">
                    <div className="w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black shadow-lg shadow-primary/20">
                      {step.id}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 mb-0.5">{step.title}</h4>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleConnect}
                disabled={isConnecting || isLoading}
                className="w-full h-16 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Linkedin className="w-6 h-6 mr-3 fill-current" />
                    Connect LinkedIn
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-center items-center gap-6 mt-10">
          <Link href="#" className="text-slate-400 text-xs font-black hover:text-primary transition-colors uppercase tracking-widest">Terms</Link>
          <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
          <Link href="#" className="text-slate-400 text-xs font-black hover:text-primary transition-colors uppercase tracking-widest">Privacy</Link>
          <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
          <Link href="/dashboard/profile" className="text-slate-400 text-xs font-black hover:text-primary transition-colors uppercase tracking-widest">Skip for now</Link>
        </div>
      </motion.div>
    </div>
  );
}

