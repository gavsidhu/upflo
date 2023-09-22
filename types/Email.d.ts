import { MailgunClientOptions } from "mailgun.js";

export interface EmailProvider {
  sendEmail(to: string, subject: string, body: string): Promise<any>;
}

export interface MailgunProviderConfig extends MailgunClientOptions {}
