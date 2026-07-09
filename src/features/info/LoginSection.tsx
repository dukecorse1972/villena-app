import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/Modal';
import UserAvatar from '../../components/UserAvatar';
import styles from './LoginSection.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LoginSection({ open, onClose }: Props) {
  const { t } = useTranslation();
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();

  const [mode,     setMode]     = useState<'login' | 'register'>('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState<string | null>(null);

  const clearMessages = () => { setError(null); setSuccess(null); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();
    setBusy(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        onClose();
      } else {
        await signUpWithEmail(email, password);
        setSuccess(t('loginSection.checkEmail'));
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loginSection.unknownError'));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    clearMessages();
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loginSection.googleError'));
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="340px">
      <div className={styles.modal}>

        {/* Cabecera */}
        <div className={styles.header}>
          <span className={styles.title}>
            {user ? t('loginSection.myAccount') : mode === 'login' ? t('loginSection.login') : t('loginSection.createAccount')}
          </span>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Usuario autenticado ── */}
        {user ? (
          <div className={styles.loggedIn}>
            <div className={styles.avatarLg}>
              <UserAvatar user={user} imgClassName={styles.avatarImg} />
            </div>
            <div className={styles.userEmail}>{user.email}</div>
            <div className={styles.syncBadge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {t('loginSection.favoritesSynced')}
            </div>
            <button className={styles.signOutBtn} onClick={handleSignOut}>
              {t('loginSection.signOut')}
            </button>
          </div>
        ) : (
          <>
            {/* Toggle Entrar / Crear cuenta */}
            <div className={styles.modeToggle}>
              <button
                className={`${styles.modeBtn}${mode === 'login' ? ` ${styles.active}` : ''}`}
                onClick={() => { setMode('login'); clearMessages(); }}
              >
                {t('loginSection.enter')}
              </button>
              <button
                className={`${styles.modeBtn}${mode === 'register' ? ` ${styles.active}` : ''}`}
                onClick={() => { setMode('register'); clearMessages(); }}
              >
                {t('loginSection.createAccount')}
              </button>
            </div>

            {/* Google */}
            <button className={styles.googleBtn} onClick={handleGoogle} disabled={busy}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('loginSection.enterWithGoogle')}
            </button>

            <div className={styles.divider}><span>{t('loginSection.or')}</span></div>

            {/* Formulario email */}
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="email"
                placeholder={t('loginSection.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
                autoComplete="email"
              />
              <input
                type="password"
                placeholder={t('loginSection.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
              />
              {error   && <div className={styles.errorMsg}>{error}</div>}
              {success && <div className={styles.successMsg}>{success}</div>}
              <button type="submit" className={styles.submitBtn} disabled={busy}>
                {busy ? t('loginSection.oneMoment') : mode === 'login' ? t('loginSection.enter') : t('loginSection.createAccount')}
              </button>
            </form>

            <p className={styles.hint}>
              {mode === 'login' ? t('loginSection.hintLogin') : t('loginSection.hintRegister')}
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
