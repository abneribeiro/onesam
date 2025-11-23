import { createAuthClient } from 'better-auth/react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const baseURL = apiUrl.replace(/\/api\/?$/, '');

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [],
});

export const { useSession, signIn, signOut, signUp } = authClient;

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
