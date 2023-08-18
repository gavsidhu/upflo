import { DataSource, DataSourceOptions } from "typeorm";
import { Tag } from "../entity/Contacts/Tag.entity";
import { Ticket } from "../entity/HelpDesk/Ticket.entity";
import { Contact } from "../entity/Contacts/Contact.entity";
import { List } from "../entity/Contacts/List.entity";

/**
 * Class representing a `DatabaseConnection`.
 *
 * @class
 */
export class DatabaseConnection {
  /**
   * The source of the data.
   *
   * @private
   * @type {DataSource}
   */
  private dataSource: DataSource;

  /**
   * Creates a new `DatabaseConnection` class with options.
   *
   * @param {DataSourceOptions} options - The `DataSource` options.
   */
  constructor(options: DataSourceOptions) {
    this.dataSource = new DataSource({
      ...options,
      entities: [Tag, Ticket, Contact, List], // The list of entities to be linked with the data source.
    });
  }

  /**
   * Initializes the data source asynchronously.
   *
   * @returns {Promise<void>} - Promise represents the completion of an asynchronous operation.
   */
  async connect(): Promise<void> {
    try {
      await this.dataSource.initialize();
      console.log("Data Source has been initialized!");
    } catch (error) {
      console.error("Error during Data Source initialization", error);
    }
  }

  /**
   * Gets the existing initialized data source connection.
   *
   * @returns {DataSource} - The existing initialized data source connection.
   */
  getConnection(): DataSource {
    return this.dataSource;
  }
}
