import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://sunniy.com';
const WC_API = process.env.NEXT_PUBLIC_WC_API_URL || 'https://sunniy.com/wp-json/wc/v3';
const WC_KEY = process.env.WC_CONSUMER_KEY || '';
const WC_SECRET = process.env.WC_CONSUMER_SECRET || '';

function generateRandomPassword() {
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8) + 'A1!';
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (!user.email) return false;

        const basicAuth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
        const fetchOpts = { headers: { Authorization: `Basic ${basicAuth}`, 'Content-Type': 'application/json' } };

        // 1. Find existing customer by email
        const custRes = await fetch(`${WC_API}/customers?email=${encodeURIComponent(user.email)}&role=all`, fetchOpts);
        const custData = await custRes.json();
        let customer = Array.isArray(custData) && custData[0] ? custData[0] : null;

        let socialPassword = '';
        let needsUpdate = false;

        if (customer) {
          // Check if we have a stored social password
          const meta = customer.meta_data?.find((m: any) => m.key === '_social_auth_pwd');
          if (meta?.value) {
            socialPassword = meta.value;
          } else {
            socialPassword = generateRandomPassword();
            needsUpdate = true;
          }
        } else {
          // Create new customer
          socialPassword = generateRandomPassword();
          const createRes = await fetch(`${WC_API}/customers`, {
            ...fetchOpts,
            method: 'POST',
            body: JSON.stringify({
              email: user.email,
              first_name: user.name?.split(' ')[0] || '',
              last_name: user.name?.split(' ').slice(1).join(' ') || '',
              password: socialPassword,
              meta_data: [{ key: '_social_auth_pwd', value: socialPassword }]
            }),
          });
          customer = await createRes.json();
        }

        if (needsUpdate && customer) {
          await fetch(`${WC_API}/customers/${customer.id}`, {
            ...fetchOpts,
            method: 'PUT',
            body: JSON.stringify({
              password: socialPassword,
              meta_data: [{ key: '_social_auth_pwd', value: socialPassword }]
            }),
          });
        }

        // 2. Get JWT token using the social password
        let jwtRes = await fetch(`${WP_URL}/wp-json/jwt-auth/v1/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user.email, password: socialPassword }),
        });

        // If JWT fails, the password might have been changed manually. Reset it.
        if (!jwtRes.ok && customer && !needsUpdate) {
          socialPassword = generateRandomPassword();
          
          await fetch(`${WC_API}/customers/${customer.id}`, {
            ...fetchOpts,
            method: 'PUT',
            body: JSON.stringify({
              password: socialPassword,
              meta_data: [{ key: '_social_auth_pwd', value: socialPassword }]
            }),
          });
          
          jwtRes = await fetch(`${WP_URL}/wp-json/jwt-auth/v1/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user.email, password: socialPassword }),
          });
        }

        if (!jwtRes.ok) {
          console.error('Failed to get WP JWT token during social login');
          return false;
        }

        const jwtData = await jwtRes.json();

        // Attach WP JWT and customer info to the user object for session
        (user as any).wpToken = jwtData.token;
        (user as any).wpEmail = jwtData.user_email;
        (user as any).wpDisplayName = jwtData.user_display_name;
        (user as any).wpId = customer.id;
        (user as any).wpFirstName = customer.first_name || jwtData.user_display_name;
        (user as any).wpLastName = customer.last_name || '';

        return true;
      } catch (err) {
        console.error('Social auth error:', err);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.wpToken = (user as any).wpToken;
        token.wpEmail = (user as any).wpEmail;
        token.wpDisplayName = (user as any).wpDisplayName;
        token.wpId = (user as any).wpId;
        token.wpFirstName = (user as any).wpFirstName;
        token.wpLastName = (user as any).wpLastName;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).wpToken = token.wpToken;
      (session as any).wpEmail = token.wpEmail;
      (session as any).wpDisplayName = token.wpDisplayName;
      (session as any).wpId = token.wpId;
      (session as any).wpFirstName = token.wpFirstName;
      (session as any).wpLastName = token.wpLastName;
      return session;
    },
  },
  pages: {
    error: '/', 
  },
});
