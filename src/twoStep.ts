// Two-step sign-in state for this browser tab: set while the password is checked and the email code is pending.
const K = 'mk-2fa'
export const twoStep = {
  get(): string | null { try { return sessionStorage.getItem(K) } catch { return null } },
  set(v: string) { try { sessionStorage.setItem(K, v) } catch { /* private mode */ } },
  clear() { try { sessionStorage.removeItem(K) } catch { /* private mode */ } },
}
