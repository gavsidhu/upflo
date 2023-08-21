import { DataSource, DataSourceOptions } from "typeorm";
import { Tag } from "../entity/Contacts/Tag.entity";
import { Ticket } from "../entity/HelpDesk/Ticket.entity";
import { Contact } from "../entity/Contacts/Contact.entity";
import { List } from "../entity/Contacts/List.entity";

export class DatabaseConnection {
  private dataSource: DataSource;

  constructor(options: DataSourceOptions) {
    this.dataSource = new DataSource({
      ...options,
      entities: [Tag, Ticket, Contact, List],
    });
  }

  async connect(): Promise<void> {
    try {
      await this.dataSource.initialize();
      console.log("Data Source has been initialized!");
    } catch (error) {
      console.error("Error during Data Source initialization", error);
    }
  }

  getConnection(): DataSource {
    return this.dataSource;
  }
}
