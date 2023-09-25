import { DataSource, DataSourceOptions } from "typeorm";
import { Tag } from "../entity/Contacts/Tag.entity";
import { Ticket } from "../entity/HelpDesk/Ticket.entity";
import { Contact } from "../entity/Contacts/Contact.entity";
import { List } from "../entity/Contacts/List.entity";
import { EmailEvents } from "../entity/Workflow/EmailEvents.entity";
import { Workflow } from "../entity/Workflow/Workflow.entity";
import { WorkFlowQueue } from "../entity/Workflow/WorkflowQueue.entity";
import { Note } from "../entity/Contacts/Note.entity";
import { WorkflowQueueArchive } from "../entity/Workflow/WorkflowQueueArchive.entity";

export class DatabaseConnection {
  private dataSource: DataSource;

  constructor(options: DataSourceOptions) {
    this.dataSource = new DataSource({
      ...options,
      entities: [
        Tag,
        Ticket,
        Contact,
        List,
        Note,
        EmailEvents,
        Workflow,
        WorkFlowQueue,
        WorkflowQueueArchive,
      ],
    });
  }

  getConnection(): DataSource {
    return this.dataSource;
  }
}
