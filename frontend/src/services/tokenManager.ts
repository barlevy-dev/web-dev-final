let _token: string | null = null;

export const tokenManager = {
  getToken: () => _token,
  setToken: (token: string | null) => {
    _token = token;
  },
};
