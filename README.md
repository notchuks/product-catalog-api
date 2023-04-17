## Express TypeScript REST API

Expressjs REST API written with typescript, zod for schema validation, JWTs for creating sessions, prometheus for measuring performance, Jest for automated tests, google OAuth2 for authentication, Swagger for documentation and Docker + Caddy for deployment.

A minimal Next.js client is also provided to test Oauth. Local authentication is also available with JWTs and cookies.

```bash
cd client

yarn install

cd ../server

yarn install
```

Open [http://localhost:3000](http://localhost:3000) with your browser to sign in with OAuth, or [http://localhost:3000/auth/register](http://localhost:3000/auth/register) to authenticate locally.