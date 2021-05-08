import { google } from 'googleapis';

export const googleDriveConstants = {
  oAuth2Client: new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
  ),
  refresh_token: process.env.REFRESH_TOKEN,
};
