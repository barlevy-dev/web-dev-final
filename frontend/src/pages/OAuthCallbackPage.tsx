import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { tokenManager } from '@/services/tokenManager';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { setTokenAndUser } = useAuth();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const finalize = async () => {
      try {
        tokenManager.setToken(token);
        const user = await authService.getMe();
        setTokenAndUser(token, user);
        navigate('/', { replace: true });
      } catch {
        navigate('/login', { replace: true });
      }
    };

    finalize();
  }, [searchParams, setTokenAndUser, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="text-sm text-muted-foreground">Completing sign-in…</p>
      </div>
    </div>
  );
}
