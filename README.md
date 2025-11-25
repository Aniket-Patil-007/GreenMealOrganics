# GreenMealOrganics OTP Login Setup

## Features
✅ OTP-based mobile authentication  
✅ 6-digit OTP generation  
✅ 5-minute OTP expiry  
✅ 30-second resend timer  
✅ Twilio SMS integration  

## Setup Instructions

### 1. Install Dependencies
```bash
cd /Users/pratikshapatil/Downloads/GreenMealFinal
npm install
```

### 2. Get Twilio Credentials
1. Sign up at [Twilio.com](https://www.twilio.com)
2. Get your:
   - Account SID
   - Auth Token
   - Twilio Phone Number (SMS-capable)

### 3. Configure Environment Variables
Edit `.env` file and add your Twilio credentials:
```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
PORT=3000
```

### 4. Start the Backend Server
```bash
npm start
```
Server will run on `http://localhost:3000`

### 5. Open the Frontend
Open `index.html` in your browser (use a local server for best results):
```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (http-server)
npx http-server
```

## How to Use

1. Click **Login** button
2. Enter 10-digit mobile number
3. Click **Send OTP**
4. OTP will be sent to your phone via SMS
5. Enter the 6-digit OTP
6. Click **Login** to verify

## API Endpoints

### Send OTP
**POST** `/send-otp`
```json
{
  "phoneNumber": "9876543210"
}
```

### Verify OTP
**POST** `/verify-otp`
```json
{
  "phoneNumber": "9876543210",
  "otp": "123456"
}
```

## Testing Without Twilio
For local testing without sending actual SMS:
- Edit `server.js` and comment out the `client.messages.create()` line
- OTP will still be generated and stored
- Use any 6-digit number to verify

## Security Notes
- OTPs expire after 5 minutes
- OTPs are stored in memory (use Redis for production)
- Always use HTTPS in production
- Never commit `.env` file to version control

## Troubleshooting

**"Cannot POST /send-otp"**
- Ensure server is running on port 3000
- Check if Node.js is installed

**"Failed to send OTP"**
- Verify Twilio credentials in `.env`
- Check internet connection
- Ensure phone number format is correct (10 digits)

**"CORS Error"**
- Frontend must be served on a different port than backend
- Backend is on `3000`, serve frontend on `8000` or `5500`
