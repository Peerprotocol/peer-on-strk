'use client'
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const handleCallback = async () => {
      const error = searchParams.get('error');
      if (error) {
        console.error('OAuth error:', error);
        router.push('/app/quests/socials');
        return;
      }

      const code = searchParams.get('code');
      const state = searchParams.get('state');
      
      // Get stored PKCE verifier
      const codeVerifier = localStorage.getItem('twitter_code_verifier');
      if (!code || !codeVerifier) {
        console.error('Missing code or code_verifier');
        router.push('/app/quests/socials');
        return;
      }

      // Verify state
      const savedState = localStorage.getItem('twitter_oauth_state');
      if (!savedState || state !== savedState) {
        console.error('State mismatch or missing');
        router.push('/app/quests/socials');
        return;
      }

      // Clean up stored values
      localStorage.removeItem('twitter_oauth_state');
      localStorage.removeItem('twitter_code_verifier');

      try {
        const response = await fetch('/api/auth/twitter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            code,
            code_verifier: codeVerifier 
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Token exchange failed');
        }

        const data = await response.json();
        localStorage.setItem('twitter_token', data.access_token);
        localStorage.setItem('twitter_user', data.user )
        router.push(`/app/quests/socials`);
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/app/quests/socials');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing login...</h1>
        <p className="text-gray-600">Please wait while we complete your authentication</p>
      </div>
    </div>
  );
}