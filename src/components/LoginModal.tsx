import React, { useState } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, syncUserProfile } from '../firebase';
import { UserProfile } from '../types';
import { Globe, X, Mail, Lock, Sparkles, User, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'google' | 'email_login' | 'email_signup'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const profile = await syncUserProfile(res.user);
      onLoginSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        setErrorMsg(
          'O pop-up de login foi bloqueado pelo navegador. Você pode usar a opção de E-mail ou Convidado abaixo.'
        );
      } else {
        setErrorMsg(err.message || 'Erro ao realizar login com o Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'email_signup') {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        if (name && res.user) {
          await updateProfile(res.user, { displayName: name });
        }
        const profile = await syncUserProfile(res.user);
        onLoginSuccess(profile);
      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const profile = await syncUserProfile(res.user);
        onLoginSuccess(profile);
      }
      onClose();
    } catch (err: any) {
      console.error('Email Auth error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Este e-mail já está cadastrado. Alterne para Entrar.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
      } else {
        setErrorMsg(err.message || 'Erro ao autenticar.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    // Instant demo profile so anyone can test everything without external popups
    const demoProfile: UserProfile = {
      uid: 'demo-user-wikiworldweb-884',
      email: 'usuario.demo@wikiworldweb.com',
      name: 'Explorador WikiWorldWeb',
      isAdmin: false,
      isBanned: false
    };
    onLoginSuccess(demoProfile);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-8 pb-6 text-center bg-gradient-to-b from-slate-900 to-slate-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 mx-auto mb-3 shadow-xl shadow-blue-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Globe className="w-7 h-7 text-sky-400" />
            </div>
          </div>

          <h2 className="text-xl font-bold tracking-tight">WikiWorldWeb</h2>
          <p className="text-xs text-slate-400 mt-1">
            Central de Produtos &amp; Serviços Digitais
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'google' ? (
            <div className="space-y-3">
              {/* Google Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleLogin}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-sm transition-all flex items-center justify-center gap-3 hover:shadow-md disabled:opacity-60"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? 'Conectando...' : 'Continuar com o Google'}</span>
              </button>

              <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  ou use e-mail
                </span>
              </div>

              {/* Email Option Switch */}
              <button
                type="button"
                onClick={() => setMode('email_login')}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4 text-slate-600" />
                <span>Entrar com E-mail e Senha</span>
              </button>

              {/* Demo Mode Button */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                <span>Acesso Visitante Comum</span>
              </button>

              {/* Burocratas Autorizados de Extensões */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl space-y-2 text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 block">
                  Burocratas de Extensões (Firebase Master):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const profile: UserProfile = {
                        uid: 'sZxfMuOBPbXdR8nttVPXIN8QOOl1',
                        email: 'pedrohenriquecardonaperes@gmail.com',
                        name: 'Pedro Henrique Peres',
                        isAdmin: true,
                        isBanned: false
                      };
                      onLoginSuccess(profile);
                      onClose();
                    }}
                    className="py-1.5 px-2 bg-white hover:bg-indigo-100 text-indigo-950 border border-indigo-200 rounded-lg text-[10px] font-bold truncate transition-colors"
                    title="Entrar como pedrohenriquecardonaperes@gmail.com"
                  >
                    Pedro Henrique
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const profile: UserProfile = {
                        uid: '6aPqWVh8JVYL5NqEb78iDGPD7dH3',
                        email: 'wazzimagiygg@gmail.com',
                        name: 'Wazzima Giygg',
                        isAdmin: true,
                        isBanned: false
                      };
                      onLoginSuccess(profile);
                      onClose();
                    }}
                    className="py-1.5 px-2 bg-white hover:bg-indigo-100 text-indigo-950 border border-indigo-200 rounded-lg text-[10px] font-bold truncate transition-colors"
                    title="Entrar como wazzimagiygg@gmail.com"
                  >
                    Wazzima Giygg
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Email Form */
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {mode === 'email_signup' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Seu Nome
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome completo"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  'Aguarde...'
                ) : mode === 'email_signup' ? (
                  <>
                    <span>Criar Minha Conta</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                {mode === 'email_login' ? (
                  <button
                    type="button"
                    onClick={() => setMode('email_signup')}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Não tem conta? Cadastre-se
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode('email_login')}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Já tem conta? Fazer Login
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setMode('google')}
                  className="text-slate-500 hover:text-slate-700"
                >
                  Voltar ao Google
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
