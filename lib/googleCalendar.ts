import { google } from 'googleapis';

function getAuth() {
  const key = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!, 'base64').toString());
  const auth = new google.auth.JWT(
    key.client_email,
    undefined,
    key.private_key,
    ['https://www.googleapis.com/auth/calendar']
  );
  return auth;
}

export async function createCalendarEvent(domain: string, expirationDate: Date): Promise<string> {
  const auth = getAuth();
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: `SSL Expiration for ${domain}`,
    description: `The SSL certificate for ${domain} expires soon.`,
    start: { dateTime: expirationDate.toISOString(), timeZone: 'UTC' },
    end: { dateTime: new Date(expirationDate.getTime() + 60 * 1000).toISOString(), timeZone: 'UTC' },
    reminders: {
      useDefault: false,
      overrides: [{ method: 'email', minutes: 30 * 24 * 60 }],
    },
  };

  const res = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    requestBody: event,
  });
  return res.data.id!;
}

export async function updateCalendarEvent(eventId: string, newExpirationDate: Date) {
  const auth = getAuth();
  const calendar = google.calendar({ version: 'v3', auth });
  
  const event = {
    start: { dateTime: newExpirationDate.toISOString(), timeZone: 'UTC' },
    end: { dateTime: new Date(newExpirationDate.getTime() + 60*1000).toISOString(), timeZone: 'UTC' },
    reminders: {
      useDefault: false,
      overrides: [{ method: 'email', minutes: 30 * 24 * 60 }],
    },
  };

  await calendar.events.patch({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    eventId,
    requestBody: event
  });
}
