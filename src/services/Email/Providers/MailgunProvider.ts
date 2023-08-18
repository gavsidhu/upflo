import Mailgun from "mailgun.js";
import FormData from "form-data";
import { EmailProvider, MailgunProviderConfig } from "../../../../types/Email";
import { IMailgunClient } from "mailgun.js/Interfaces";
import { MailgunMessageData } from "mailgun.js";

export class MailgunProvider implements EmailProvider {
  private mailgun: Mailgun;
  private mailgunClient: IMailgunClient;
  private domain: string;

  constructor(config: MailgunProviderConfig & { domain: string }) {
    this.mailgun = new Mailgun(FormData);
    this.mailgunClient = this.mailgun.client(config);
    this.domain = config.domain;
  }

  async sendEmail(to: string, subject: string, body: string) {
    const messageData: MailgunMessageData = {
      to: to,
      from: `test@${this.domain}`,
      subject: subject,
      text: body,
    };

    const res = await this.mailgunClient.messages.create(
      this.domain,
      messageData
    );
    return res;
  }
}
