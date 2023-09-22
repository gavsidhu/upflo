import { DataSourceOptions } from "typeorm";
import { DatabaseConnection } from "../database/connection";
import { Contacts } from "./Contacts/Contacts";
import { HelpDesk } from "./HelpDesk";
import { Email } from "./Email/Email";
import { EmailProvider } from "../../types/Email";
import { Workflow } from "./Workflow/Workflow";

export class Upflo {
  private dbConnection: DatabaseConnection;
  public helpdesk: HelpDesk;
  public contacts: Contacts;
  public email: Email;
  public workflows: Workflow;

  constructor(options: DataSourceOptions) {
    this.dbConnection = new DatabaseConnection(options);
  }
  async connect(emailProvider: EmailProvider) {
    await this.dbConnection.connect();
    this.contacts = new Contacts(this.dbConnection.getConnection());
    this.helpdesk = new HelpDesk(this.dbConnection.getConnection());
    this.email = new Email(this.dbConnection.getConnection(), emailProvider);
    this.workflows = new Workflow(
      this.dbConnection.getConnection(),
      this.email
    );
  }
}
