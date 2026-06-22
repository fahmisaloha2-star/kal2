const KEY = 'admin_token';

export const auth = {
  getToken: (): string | null => sessionStorage.getItem(KEY),
  setToken: (token: string) => sessionStorage.setItem(KEY, token),
  clearToken: () => sessionStorage.removeItem(KEY),
  isLoggedIn: (): boolean => !!sessionStorage.getItem(KEY),
};
