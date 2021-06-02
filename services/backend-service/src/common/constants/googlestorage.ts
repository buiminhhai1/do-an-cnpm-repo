import { google } from 'googleapis';

export const googleStorageConstants = {
  oAuth2Client: new google.auth.OAuth2(
    process.env.GOOGLE_STORAGE_CLIENT_ID,
    process.env.GOOGLE_STORAGE_CLIENT_SECRET,
    process.env.GOOGLE_STORAGE_REDIRECT_URI,
  ),
  refresh_token: process.env.GOOGLE_STORAGE_REFRESH_TOKEN,
};
