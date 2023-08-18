import { DataSource } from "typeorm";
import { Tickets } from "./Tickets";

export class HelpDesk {
  private connection: DataSource;
  public tickets: Tickets;

  constructor(connection: DataSource) {
    this.connection = connection;
    this.tickets = new Tickets(connection);
  }
}
