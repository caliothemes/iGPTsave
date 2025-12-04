import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
};

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('igpt_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('igpt_session_id', sessionId);
  }
  return sessionId;
};

export default function VisitTracker({ page }) {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        let userEmail = 'anonymous';
        try {
          const isAuth = await base44.auth.isAuthenticated();
          if (isAuth) {
            const user = await base44.auth.me();
            if (user?.email) userEmail = user.email;
          }
        } catch (e) {
          // Not authenticated
        }

        // Check if already tracked this page in this session
        const sessionId = getSessionId();
        const trackKey = `visit_${page}_${sessionId}`;
        if (sessionStorage.getItem(trackKey)) return;

        await base44.entities.Visit.create({
          user_email: userEmail,
          page: page,
          user_agent: navigator.userAgent.slice(0, 500),
          device: getDeviceType(),
          session_id: sessionId
        });

        sessionStorage.setItem(trackKey, 'true');
      } catch (e) {
        console.error('Visit tracking error:', e);
      }
    };

    trackVisit();
  }, [page]);

  return null;
}