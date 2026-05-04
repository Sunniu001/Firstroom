import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://sunniy.com';
const WC_API = process.env.NEXT_PUBLIC_WC_API_URL || 'https://sunniy.com/wp-json/wc/v3';
const WC_KEY = process.env.WC_CONSUMER_KEY || '';
const WC_SECRET = process.env.WC_CONSUMER_SECRET || '';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // 1. Get JWT token from WordPress
          const jwtRes = await fetch(`${WP_URL}/wp-json/jwt-auth/v1/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: credentials.email,
              password: credentials.password
            }),
          });

          const jwtData = await jwtRes.json();
          if (!jwtRes.ok) throw new Error(jwtData.message || 'Invalid credentials');

          // 2. Fetch WooCommerce customer data
          const basicAuth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
          const custRes = await fetch(
            `${WC_API}/customers?email=${encodeURIComponent(credentials.email as string)}&role=all`,
            { headers: { Authorization: `Basic ${basicAuth}` } }
          );
          const custData = await custRes.json();
          const customer = Array.isArray(custData) && custData[0] ? custData[0] : null;

          // 3. Return a user object that NextAuth will store in the JWT
          return {
            id: String(customer?.id || 0),
            email: jwtData.user_email,
            name: jwtData.user_display_name,
            wpToken: jwtData.token,
            wpId: customer?.id,
            wpFirstName: customer?.first_name || jwtData.user_display_name,
            wpLastName: customer?.last_name || '',
          };
        } catch (error: any) {
          console.error('Auth Authorize Error:', error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For social logins, we still need the sync logic
      if (account?.provider === 'google') {
        try {
          const basicAuth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
          const fetchOpts = { headers: { Authorization: `Basic ${basicAuth}`, 'Content-Type': 'application/json' } };
          const email = user.email!;

          // Find or create customer
          const custRes = await fetch(`${WC_API}/customers?email=${encodeURIComponent(email)}&role=all`, fetchOpts);
          const custData = await custRes.json();
          let customer = Array.isArray(custData) && custData[0] ? custData[0] : null;

          let socialPassword = '';
          if (customer) {
            const meta = customer.meta_data?.find((m: any) => m.key === '_social_auth_pwd');
            socialPassword = meta?.value || 'SocialLogin123!';
          } else {
            socialPassword = Math.random().toString(36).slice(-10) + 'A1!';
            const createRes = await fetch(`${WC_API}/customers`, {
              ...fetchOpts,
              method: 'POST',
              body: JSON.stringify({
                email,
                first_name: user.name?.split(' ')[0] || '',
                last_name: user.name?.split(' ').slice(1).join(' ') || '',
                password: socialPassword,
                meta_data: [{ key: '_social_auth_pwd', value: socialPassword }]
              }),
            });
            customer = await createRes.json();
          }

          // Get JWT token for social user
          let jwtRes = await fetch(`${WP_URL}/wp-json/jwt-auth/v1/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password: socialPassword }),
          });

          // If JWT fails, the user might have a different password (traditional email user).
          // We will update their password to the social one to link the accounts.
          if (!jwtRes.ok && customer) {
            await fetch(`${WC_API}/customers/${customer.id}`, {
              ...fetchOpts,
              method: 'PUT',
              body: JSON.stringify({
                password: socialPassword,
                meta_data: [{ key: '_social_auth_pwd', value: socialPassword }]
              }),
            });

            // Try JWT again with the updated password
            jwtRes = await fetch(`${WP_URL}/wp-json/jwt-auth/v1/token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: email, password: socialPassword }),
            });
          }

          const jwtData = await jwtRes.json();

          if (jwtRes.ok) {
            (user as any).wpToken = jwtData.token;
            (user as any).wpId = customer.id;
            (user as any).wpFirstName = customer.first_name || user.name;
            (user as any).wpLastName = customer.last_name || '';
          }
          return true;
        } catch (err) {
          console.error('Social auth error:', err);
          return true; // Still allow sign in even if sync fails, we can recover later
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.wpToken = (user as any).wpToken;
        token.wpId = (user as any).wpId;
        token.wpFirstName = (user as any).wpFirstName;
        token.wpLastName = (user as any).wpLastName;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).wpToken = token.wpToken;
      (session as any).wpId = token.wpId;
      (session as any).wpFirstName = token.wpFirstName;
      (session as any).wpLastName = token.wpLastName;
      return session;
    },
  },
  pages: {
    error: '/',
    signIn: '/',
  },
  secret: process.env.AUTH_SECRET,
});
