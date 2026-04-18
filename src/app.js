const express = require( 'express' );
const cors = require( 'cors' );
const helmet = require( 'helmet' );
const rateLimit = require( 'express-rate-limit' );
const morgan = require( 'morgan' );
const authRoutes = require( './routes/authRoutes' );
const userRoutes = require( './routes/userRoutes' );
const messageRoutes = require( './routes/messageRoutes' );
const { errorHandler } = require( './middleware/errorHandler' );
const logger = require( './config/logger' );

const app = express();

const homepageHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PeerPing</title>
  <meta name="description" content="PeerPing backend service - real-time chat, notifications, and secure user management." />
  <style>
    :root {
      color-scheme: dark;
      color: #e9f2fb;
      background: #040b18;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      background: radial-gradient(circle at top left, rgba(37, 166, 255, 0.18), transparent 34%),
                  radial-gradient(circle at bottom right, rgba(102, 126, 234, 0.22), transparent 28%),
                  linear-gradient(180deg, #061324 0%, #02101f 100%);
      color: #edf2fb;
    }

    img {
      max-width: 100%;
      display: block;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .page {
      width: min(1120px, calc(100% - 2rem));
      margin: 0 auto;
      padding: 2.5rem 0 3.5rem;
    }

    .hero {
      padding: 3rem 0 4rem;
      display: grid;
      gap: 2rem;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      color: #6ac6ff;
      text-transform: uppercase;
      letter-spacing: 0.24em;
      font-size: 0.78rem;
      font-weight: 700;
    }

    .hero-title {
      margin: 0;
      font-size: clamp(2.7rem, 4vw, 4.5rem);
      line-height: 0.95;
      max-width: 12ch;
    }

    .hero-copy {
      margin: 1.5rem 0 0;
      max-width: 680px;
      color: #c5d3e8;
      font-size: 1.05rem;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 2rem;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      padding: 0 1.6rem;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      font-weight: 700;
      transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
    }

    .button.primary {
      background: linear-gradient(135deg, #3da7ff 0%, #68e1ff 100%);
      color: #031827;
      box-shadow: 0 18px 40px rgba(63, 172, 255, 0.18);
    }

    .button.secondary {
      background: rgba(255, 255, 255, 0.06);
      color: #e5efff;
      border: 1px solid rgba(255,255,255,0.1);
    }

    .button:hover {
      transform: translateY(-1px);
    }

    .feature-grid,
    .steps-grid {
      display: grid;
      gap: 1.2rem;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      margin-top: 2.5rem;
    }

    .card {
      padding: 1.75rem;
      border-radius: 28px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(16px);
      box-shadow: 0 20px 80px rgba(0,0,0,0.15);
    }

    .card-title {
      margin: 0 0 0.75rem;
      font-size: 1.12rem;
      letter-spacing: -0.03em;
    }

    .card-copy {
      margin: 0;
      color: #adbdcf;
      font-size: 0.98rem;
    }

    .step-marker {
      width: 3rem;
      height: 3rem;
      display: grid;
      place-items: center;
      border-radius: 16px;
      background: rgba(61, 167, 255, 0.16);
      color: #b0e3ff;
      font-weight: 700;
      font-size: 1rem;
      margin-bottom: 1rem;
    }

    .section-title {
      margin: 0 0 1rem;
      font-size: 1.55rem;
      letter-spacing: -0.04em;
    }

    .section-copy {
      margin: 0;
      max-width: 720px;
      color: #b6c7db;
      font-size: 1rem;
    }

    .api-panel {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 1.5rem;
      align-items: start;
      margin-top: 2.5rem;
    }

    .code-sample {
      padding: 1.4rem;
      border-radius: 24px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      color: #e8f7ff;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      font-size: 0.94rem;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .footer {
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      color: #7f96b1;
      font-size: 0.95rem;
    }

    .footer a {
      color: #90b9ff;
    }

    @media (max-width: 780px) {
      .hero {
        padding-top: 2rem;
      }

      .api-panel {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="hero">
      <div>
        <div class="eyebrow">PeerPing Backend</div>
        <h1 class="hero-title">Real-time messaging built for developers.</h1>
        <p class="hero-copy">PeerPing delivers secure chat, notification-ready conversations, and intuitive backend services for teams and apps. Explore the API and start building connected experiences fast.</p>
        <div class="hero-actions">
          <a class="button primary" href="/api/auth">Get Started</a>
          <a class="button secondary" href="#features">View Features</a>
        </div>
      </div>
      <div class="card" style="background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));">
        <p class="section-title">Live status</p>
        <p class="card-copy">This service is running on <strong>Node.js</strong> with Express, Socket.IO, MongoDB, and Firebase Cloud Messaging for push alerts.</p>
      </div>
    </section>

    <section id="features">
      <div class="section-title">What PeerPing offers</div>
      <p class="section-copy">A lightweight backend for real-time conversations, OTP authentication, notifications, and developer-friendly API endpoints.</p>
      <div class="feature-grid">
        <article class="card">
          <h3 class="card-title">Instant Messaging</h3>
          <p class="card-copy">Send and receive conversation data through a fast API with WebSocket support for live updates.</p>
        </article>
        <article class="card">
          <h3 class="card-title">Group Conversations</h3>
          <p class="card-copy">Create conversations for one-to-one or group chats and manage users with secure access controls.</p>
        </article>
        <article class="card">
          <h3 class="card-title">Smart Notifications</h3>
          <p class="card-copy">Keep users informed with Firebase-powered notifications for new messages and important events.</p>
        </article>
        <article class="card">
          <h3 class="card-title">Secure Authentication</h3>
          <p class="card-copy">OTP-based authentication with safe token handling and rate limiting for protected onboarding.</p>
        </article>
      </div>
    </section>

    <section>
      <div class="section-title" style="margin-top: 3rem;">How it works</div>
      <div class="steps-grid">
        <article class="card">
          <div class="step-marker">1</div>
          <h3 class="card-title">Authenticate</h3>
          <p class="card-copy">Use the auth API to sign in users quickly with OTP and start a secure session.</p>
        </article>
        <article class="card">
          <div class="step-marker">2</div>
          <h3 class="card-title">Create conversations</h3>
          <p class="card-copy">Open new chats, invite participants, and fetch message history through REST endpoints.</p>
        </article>
        <article class="card">
          <div class="step-marker">3</div>
          <h3 class="card-title">Send messages</h3>
          <p class="card-copy">Dispatch messages in real time and deliver notifications when new activity arrives.</p>
        </article>
      </div>
    </section>

    <section class="api-panel">
      <div>
        <div class="section-title">API-first backend</div>
        <p class="section-copy">PeerPing is designed for developers: simple route structure, extensible sockets, and fast responses with security best practices built in.</p>
      </div>
      <div class="code-sample">
        GET /api/auth/status
        POST /api/auth/login
        GET /api/users/:id
        POST /api/messages/send
      </div>
    </section>

    <footer class="footer">
      <span>PeerPing Backend • Powered by Express & Socket.IO</span>
      <span><a href="https://github.com/your-repo">GitHub</a> • <a href="#">Docs</a></span>
    </footer>
  </main>
</body>
</html>`;

const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split( ',' ).map( ( origin ) => origin.trim() ).filter( Boolean )
    : [ 'http://localhost:3000' ];

const corsOptions = {
    origin: ( origin, callback ) => {
        if ( !origin ) return callback( null, true );
        if ( corsOrigins.includes( origin ) ) return callback( null, true );
        callback( new Error( 'Not allowed by CORS' ) );
    },
    credentials: true,
};

const authLimiter = rateLimit( {
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests from this IP, please try again later' },
} );

app.use( helmet() );
app.use( express.json( { limit: '100kb' } ) );
app.use( cors( corsOptions ) );
app.use( morgan( 'combined' ) );

app.get( '/', ( req, res ) => {
    res.set( 'Content-Type', 'text/html; charset=utf-8' );
    res.send( homepageHtml );
} );

app.get( '/amidead', ( req, res ) => res.json( { status: 'ok', service: 'peerping-backend', endpoint: 'amidead', alive: true } ) );
app.use( '/api/auth', authLimiter, authRoutes );
app.use( '/api/users', userRoutes );
app.use( '/api/messages', messageRoutes );

// Response logging middleware
app.use( ( req, res, next ) => {
    res.on( 'finish', () => {
        logger.info( `Response: ${ req.method } ${ req.url } ${ res.statusCode }` );
    } );
    next();
} );

app.use( errorHandler );

module.exports = app;
