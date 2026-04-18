# PeerPing Backend

Node.js + Express chat backend with OTP login, Socket.IO, MongoDB, and Firebase Cloud Messaging.

## Features

- Phone-number OTP authentication
- JWT-based protected API
- User search by phone number
- One-to-one conversations
- Idempotent message creation using client-generated `messageId`
- Real-time delivery with Socket.IO
- Offline sync by fetching messages after a timestamp
- Firebase Cloud Messaging for offline notification
- Basic logging and error handling

## Setup

1. Copy `.env.example` to `.env` and update values.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start MongoDB locally.
4. Run:

   ```bash
   npm run dev
   ```

## Environment Variables

- `PORT` - HTTP port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration (example `30d`)
- `OTP_EXPIRATION_MINUTES` - OTP expiry minutes
- `FCM_PROJECT_ID`, `FCM_CLIENT_EMAIL`, `FCM_PRIVATE_KEY` - Firebase Admin credentials

## API Endpoints

### Authentication

- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`

### Users

- `GET /api/users/search?phoneNumber=...`
- `POST /api/users/device-token`

### Messages

- `POST /api/messages/send`
- `GET /api/messages/:conversationId?after=timestamp`
- `PATCH /api/messages/:messageId/status`

## Postman Collection

A ready-to-use Postman collection is included in `PeerPing.postman_collection.json`.

## WebSocket Usage

Connect with a valid token:

```js
const socket = io('http://localhost:4000', {
  auth: { token: 'Bearer YOUR_JWT' }
});

socket.on('connect', () => {
  console.log('connected');
});

socket.on('NEW_MESSAGE', (message) => {
  console.log('new message', message);
});

socket.on('MESSAGE_DELIVERED', (delivery) => {
  console.log('delivered', delivery);
});
```

Send the token in the auth handshake and update the device token after login.

## Notes

- This backend uses in-memory socket tracking. Restarting the server will drop active socket connections.
- OTPs are stored in MongoDB and cleaned up when verified.
