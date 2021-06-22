export const MAIL_HOST = process.env.MAIL_HOST;
export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_PASSWORD = process.env.MAIL_PASSWORD;
export const MAIL_FROM = process.env.MAIL_FROM;
export const MAIL_TRANSPORT = `smtp://${MAIL_USER}:${MAIL_PASSWORD}@${MAIL_HOST}`;
