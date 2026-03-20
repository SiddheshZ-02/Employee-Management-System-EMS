import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  refreshSession,
  expireSession,
  clearSessionExpired,
  loadUserFromStorage,
  setToken,
} from "@/store/slices/authSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const SessionTimeoutManager = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, sessionExpiry, sessionExpired } = useAppSelector(
    (s) => s.auth
  );

  const timerRef = useRef<number | null>(null);
  const lastRefreshRef = useRef<number>(0);

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (isAuthenticated && sessionExpiry) {
      const delay = sessionExpiry - Date.now();
      if (delay <= 0) {
        dispatch(expireSession());
      } else {
        timerRef.current = window.setTimeout(() => {
          dispatch(expireSession());
        }, delay);
      }
    }
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAuthenticated, sessionExpiry, dispatch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const handler = () => {
      const now = Date.now();
      if (now - lastRefreshRef.current > 30_000) {
        lastRefreshRef.current = now;
        dispatch(refreshSession());
      }
    };
    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
    };
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    const onExpired = () => dispatch(expireSession());
    const onTokenUpdated = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) {
        dispatch(setToken(detail));
        dispatch(refreshSession());
      }
    };
    window.addEventListener("ems:sessionExpired", onExpired as EventListener);
    window.addEventListener("ems:tokenUpdated", onTokenUpdated as EventListener);
    return () => {
      window.removeEventListener("ems:sessionExpired", onExpired as EventListener);
      window.removeEventListener("ems:tokenUpdated", onTokenUpdated as EventListener);
    };
  }, [dispatch]);

  const goToLogin = () => {
    dispatch(clearSessionExpired());
    if (location.pathname !== "/auth") {
      navigate("/auth", { replace: true });
    }
  };

  return (
    <Dialog open={sessionExpired} onOpenChange={(open) => !open && goToLogin()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Session expired</DialogTitle>
          <DialogDescription>
            Your session has expired for security reasons. Please log in again to
            continue.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button onClick={goToLogin}>Go to Login</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionTimeoutManager;
