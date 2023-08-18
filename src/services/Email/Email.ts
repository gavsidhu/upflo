import { DataSource } from "typeorm";
import { EmailProvider } from "../../../types/Email";

export class Email {
  private connection: DataSource;
  private provider: EmailProvider;

  constructor(connection: DataSource, provider: EmailProvider) {
    this.connection = connection;
    this.provider = provider;
  }

  async sendEmail(to: string, subject: string, body: string) {
    return await this.provider.sendEmail(to, subject, body);
  }
}
