# CZU iCal Calendar Service

This service allows Czech University of Life Sciences Prague (CZU) students to automatically sync their university timetable with any calendar application that supports iCal/ICS subscriptions.

## 🎓 What it does

The service:

1. Logs into your CZU IS account
2. Retrieves your personal timetable
3. Converts it to iCal format
4. Serves it as a live calendar feed that you can subscribe to

## 📅 How to add your calendar

Your calendar URL will be in the following format:

```
https://czu-ical.hajas.xyz/calendar/my.ical?login=YOUR_LOGIN&password=YOUR_PASSWORD
```

Replace `YOUR_LOGIN` with your CZU username and `YOUR_PASSWORD` with your CZU password.

**⚠️ Security Note:** Your credentials are sent as URL parameters. The calendar feed will be available to anyone who has access to this URL. Only use this service if you trust the hosting environment and ensure your calendar subscriptions are kept private.

### Google Calendar

1. Open [Google Calendar](https://calendar.google.com)
2. Click the **+** button next to "Other calendars" on the left sidebar
3. Select **"From URL"**
4. Paste your calendar URL: `https://czu-ical.hajas.xyz/calendar/my.ical?login=YOUR_LOGIN&password=YOUR_PASSWORD`
5. Click **"Add calendar"**

Your CZU timetable will now appear in your Google Calendar. It may take a few minutes to sync initially.

### Apple Calendar (macOS/iOS)

#### On macOS:

1. Open the **Calendar** app
2. Go to **File** → **New Calendar Subscription**
3. Paste your calendar URL: `https://czu-ical.hajas.xyz/calendar/my.ical?login=YOUR_LOGIN&password=YOUR_PASSWORD`
4. Click **Subscribe**
5. Choose your preferred settings (name, color, auto-refresh frequency)
6. Click **OK**

#### On iOS/iPadOS:

1. Open **Settings** → **Calendar** → **Accounts**
2. Tap **Add Account** → **Other**
3. Tap **Add Subscribed Calendar**
4. Paste your calendar URL: `https://czu-ical.hajas.xyz/calendar/my.ical?login=YOUR_LOGIN&password=YOUR_PASSWORD`
5. Tap **Next** and configure your preferences
6. Tap **Save**

### Microsoft Outlook

#### Outlook on the Web:

1. Go to [outlook.com](https://outlook.com) and sign in
2. Click the calendar icon
3. Click **Add calendar** → **Subscribe from web**
4. Paste your calendar URL: `https://czu-ical.hajas.xyz/calendar/my.ical?login=YOUR_LOGIN&password=YOUR_PASSWORD`
5. Give it a name and choose a color
6. Click **Import**

#### Outlook Desktop:

1. Open Outlook
2. Go to **File** → **Account Settings** → **Internet Calendars**
3. Click **New**
4. Paste your calendar URL: `https://czu-ical.hajas.xyz/calendar/my.ical?login=YOUR_LOGIN&password=YOUR_PASSWORD`
5. Click **Add**
6. Configure your preferences and click **OK**

### Thunderbird

1. Open Thunderbird
2. Right-click on the calendar list and select **New Calendar**
3. Choose **On the Network** and click **Next**
4. Select **iCalendar (ICS)**
5. Paste your calendar URL: `https://czu-ical.hajas.xyz/calendar/my.ical?login=YOUR_LOGIN&password=YOUR_PASSWORD`
6. Click **Next**, give it a name, and click **Finish**

### Other Calendar Apps

Most calendar applications support iCal/ICS subscriptions. Look for options like:

- "Subscribe to calendar"
- "Add calendar from URL"
- "Import from web"
- "ICS subscription"

Then paste your calendar URL with your credentials.

## 🔄 Calendar Updates

The calendar subscription automatically syncs with your CZU timetable. The refresh frequency depends on your calendar app's settings (typically every few hours to once per day).

## 🛠️ Technology Stack

- **Backend**: Node.js with Express
- **Language**: TypeScript
- **Authentication**: Direct login to CZU IS
- **Calendar Format**: iCal/ICS

## ⚠️ Important Notes

- **Password Security**: Your credentials are passed as URL parameters. Keep your calendar subscription links private.
- **Changes**: If you change your CZU password, you'll need to update the calendar URL in all your calendar apps.
- **Support**: This is an unofficial service and is not affiliated with or supported by CZU.

## 📝 License

See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This project is built with TypeScript and Express. To run locally:

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start
```

---

Made with ❤️ for CZU students
