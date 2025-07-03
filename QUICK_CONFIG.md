# Quick Configuration Guide

## Single Point Configuration ✨

Now you only need to edit **ONE FILE** to change ports and most settings!

### Change Client Port

Edit only the main `.env` file:

```env
CLIENT_PORT=3080
```

This automatically:

-   ✅ Sets the React dev server to port 3080
-   ✅ Updates CORS to allow `http://localhost:3080`
-   ✅ Keeps all connections working

### Change Server Port

Edit only the main `.env` file:

```env
PORT=4000
```

This automatically:

-   ✅ Sets the server to port 4000
-   ✅ Updates API URLs to `http://localhost:4000`
-   ✅ Updates Socket URLs to `http://localhost:4000`

### Example: Running on Different Ports

```env
# Main .env file - ONLY file you need to edit!
PORT=4000          # Server runs on 4000
CLIENT_PORT=3080   # Client runs on 3080
```

### What Happens Automatically

-   🔗 CORS Origin: `http://localhost:{CLIENT_PORT}`
-   🌐 API Base URL: `http://localhost:{PORT}`
-   🔌 Socket URL: `http://localhost:{PORT}`
-   ⚛️ React Dev Server: Uses `CLIENT_PORT`

### No More Editing Multiple Files!

❌ **Before**: Edit 3 files (`.env`, `client/.env`, `server/.env`)  
✅ **Now**: Edit 1 file (`.env`)

All other settings like monitoring intervals, security options, etc. can still be customized in the main `.env` file.
