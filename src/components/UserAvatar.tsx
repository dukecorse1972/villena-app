import { useState } from 'react';
import type { User } from '@supabase/supabase-js';

interface UserAvatarProps {
  user: User | null;
  imgClassName?: string;
  fallbackClassName?: string;
}

/**
 * Foto de perfil de Google si carga bien; si no (bloqueada, sin red, URL
 * caducada...) cae a la inicial del email en vez de mostrar el icono de
 * imagen rota del navegador.
 */
export default function UserAvatar({ user, imgClassName, fallbackClassName }: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initial = (user?.email?.[0] ?? '?').toUpperCase();

  if (avatarUrl && !failed) {
    return (
      <img
        src={avatarUrl}
        className={imgClassName}
        alt=""
        onError={() => setFailed(true)}
      />
    );
  }

  return <span className={fallbackClassName}>{initial}</span>;
}
