import { DataSourceOptions } from "typeorm";
import { DatabaseConnection } from "../database/connection";
import { Contacts } from "./Contacts/Contacts";
import { HelpDesk } from "./HelpDesk";
import { Email } from "./Email/Email";
import { EmailProvider } from "../../types/Email";
import { Workflow } from "./Workflow/Workflow";
import EventEmitter from "events";

export class Upflo {
  private dbConnection: DatabaseConnection;
  public helpdesk: HelpDesk;
  public contacts: Contacts;
  public email: Email;
  public workflows: Workflow;
  private eventEmitter: EventEmitter;

  constructor(options: DataSourceOptions, emailProvider: EmailProvider) {
    this.eventEmitter = new EventEmitter();
    this.dbConnection = new DatabaseConnection(options);
    this.contacts = new Contacts(this.dbConnection.getConnection());
    this.helpdesk = new HelpDesk(this.dbConnection.getConnection());
    this.email = new Email(this.dbConnection.getConnection(), emailProvider);
    this.workflows = new Workflow(
      this.dbConnection.getConnection(),
      this.email
    );
  }

  on(event: string, listener: (...args: any[]) => void) {
    this.eventEmitter.on(event, listener);
  }

  emit(event: string, ...args: any[]) {
    this.eventEmitter.emit(event, ...args);
  }
}
