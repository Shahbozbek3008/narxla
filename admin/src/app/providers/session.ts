import { useSession } from '@/entities/session';
import { configureHttp } from '@/shared/api';

export function bindSessionToHttp() {
  configureHttp({
    getKey: () => useSession.getState().key,
    onUnauthorized: () => useSession.getState().signOut(),
  });
}
