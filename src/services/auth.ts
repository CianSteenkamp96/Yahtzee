// Auth service stub - will be replaced with Google Sign-in later

export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  isGuest: boolean;
}

export interface AuthService {
  getCurrentUser(): Promise<User | null>;
  signInAsGuest(name: string): Promise<User>;
  signOut(): Promise<void>;
  // Future: signInWithGoogle(): Promise<User>;
}

// Local guest-only implementation
class LocalAuthService implements AuthService {
  private readonly STORAGE_KEY = 'yahtzee_user';

  async getCurrentUser(): Promise<User | null> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  async signInAsGuest(name: string): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      name,
      isGuest: true,
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const authService: AuthService = new LocalAuthService();
