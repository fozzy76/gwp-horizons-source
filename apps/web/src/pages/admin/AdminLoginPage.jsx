import React, { useCallback, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TurnstileWidget from '@/components/TurnstileWidget.jsx';
import { toast } from 'sonner';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const turnstileRef = useRef(null);
  const handleTurnstileVerify = useCallback((token) => setTurnstileToken(token), []);
  const { login, completeMfaLogin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!mfaToken && turnstileRef.current?.enabled && !turnstileToken) {
        toast.error('Complete the security check first.');
        setLoading(false);
        return;
      }
      const result = mfaToken
        ? await completeMfaLogin(mfaToken, mfaCode)
        : await login(email, password, turnstileToken);
      if (result.mfaRequired) {
        setMfaToken(result.mfaToken || '');
        toast.info('Enter your authenticator code.');
        return;
      }
      toast.success('Logged in successfully');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 admin-layout">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl font-bold tracking-tight">Admin Login</CardTitle>
          <CardDescription className="text-base">Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!mfaToken && <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="h-12"
              />
            </div>}
            {!mfaToken && <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="h-12"
              />
            </div>}
            {mfaToken && <div className="space-y-2">
              <Label htmlFor="mfaCode">Authenticator Code</Label>
              <Input
                id="mfaCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                required
                className="h-12"
              />
            </div>}
            {!mfaToken && <TurnstileWidget ref={turnstileRef} onVerify={handleTurnstileVerify} />}
            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? 'Signing in...' : (mfaToken ? 'Verify Code' : 'Sign In')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
