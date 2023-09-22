import {
  DataSource,
  EntityManager,
  LessThanOrEqual,
  Repository,
} from "typeorm";
import { EmailEvents } from "../../entity/Workflow/EmailEvents.entity";
import { EmailEvent, WorkflowConfig } from "../../../types/Workflow";
import { Contact } from "../../entity/Contacts/Contact.entity";
import { Workflow as WorkflowEntity } from "../../entity/Workflow/Workflow.entity";
import { WorkFlowQueue } from "../../entity/Workflow/WorkflowQueue.entity";
import { formatDateTime } from "../../utils/formatDateTime";
import { addHours } from "../../utils/addHours";
import WorkflowBuilder from "./WorkflowBuilder";
import * as cron from "node-cron";
import { Email } from "../Email";
import { WorkflowQueueArchive } from "../../entity/Workflow/WorkflowQueueArchive.entity";

export class Workflow {
  private connection: DataSource;
  private dbManager: EntityManager;
  private emailEventRepository: Repository<EmailEvents>;
  private contactRepository: Repository<Contact>;
  private workflowRepository: Repository<WorkflowEntity>;
  private queueRepository: Repository<WorkFlowQueue>;
  private queueArchiveRepository: Repository<WorkflowQueueArchive>;
  private email: Email;
  private cronJob: cron.ScheduledTask;

  constructor(connection: DataSource, email: Email) {
    this.connection = connection;
    this.dbManager = connection.manager;
    this.emailEventRepository = connection.getRepository(EmailEvents);
    this.contactRepository = connection.getRepository(Contact);
    this.workflowRepository = connection.getRepository(WorkflowEntity);
    this.queueRepository = connection.getRepository(WorkFlowQueue);
    this.queueArchiveRepository =
      connection.getRepository(WorkflowQueueArchive);
    this.email = email;

    this.initCronJob();
  }

  private initCronJob() {
    // every 45 seconds
    this.cronJob = cron.schedule("*/45 * * * * *", async () => {
      const emailsToBeSent = await this.getEmailsToBeSent();

      await this.addEmailToQueue(emailsToBeSent);

      await this.sendEmails();
    });

    this.cronJob.start();
  }

  private async getEmailsToBeSent() {
    const currentTime = new Date().toUTCString();

    const emailsToBeSent = await this.emailEventRepository.find({
      where: { sent: false, sendAt: LessThanOrEqual(currentTime) },
    });

    const filteredEmails = await Promise.all(
      emailsToBeSent.map(async (email) => {
        // Check if the email event ID exists in the workflow_queue
        const existingQueueItem = await this.queueRepository
          .createQueryBuilder("queueItem")
          .where("queueItem.payload->>:id = :emailId", {
            id: "id",
            emailId: email.id,
          })
          .getOne();

        if (existingQueueItem) {
          console.log(
            `Email event ${email.id} is already in the queue. Skipping.`
          );
          return null;
        }

        return email;
      })
    );

    const filteredAndNotNullEmails = filteredEmails.filter(
      (email) => email !== null
    );

    return filteredAndNotNullEmails;
  }

  private async addEmailToQueue(emails: EmailEvents[]) {
    if (emails.length < 1) {
      return;
    }

    for (const email of emails) {
      const queuedEmail = this.queueRepository.create({ payload: email });

      await this.queueRepository.save(queuedEmail);
      console.log(`Email event ${email.id} added to queue`);
    }
  }

  private async sendEmails() {
    const queueItems = await this.queueRepository.find();
    if (queueItems.length < 1) {
      return;
    }
    for (const item of queueItems) {
      try {
        const {
          payload: { body, sendTo, subject, id },
        } = item;
        await this.email.sendEmail(sendTo, subject, body);
        console.log(
          `Queue item: ${item.id}proccessed and email with id of ${id} has been sent`
        );
        await this.setEmailSent(id);

        const archivedItem = this.queueArchiveRepository.create({
          queueData: item,
        });
        await this.queueArchiveRepository.save(archivedItem);
        console.log(`Added queue item ${item.id} to archive`);
        await this.queueRepository.delete({ id: item.id });
        console.log(`Removed item ${item.id} from queue`);
      } catch (error) {
        console.log(error);
        throw new Error(`There was an error. ${error}`);
      }
    }
  }

  private async setEmailSent(id: string) {
    const emailEvent = await this.emailEventRepository.findOne({
      where: { id: id },
    });

    if (!emailEvent) {
      console.log("Email event not found");
      return;
    }

    emailEvent.sent = true;

    await this.emailEventRepository.save(emailEvent);
  }

  private async addEmailEventRow(
    emailEvent: EmailEvent,
    contact: Contact
  ): Promise<EmailEvents> {
    try {
      const { body, sendDelay, sendFrom, subject } = emailEvent;

      const time = new Date();
      const sendAt = time.setTime(time.getTime() + addHours(sendDelay));
      const emailEventRow = this.emailEventRepository.create({
        body,
        sent: false,
        sendAt: new Date(sendAt).toUTCString(),
        contact,
        sendFrom,
        sendTo: contact.email,
        subject,
      });

      await this.emailEventRepository.save(emailEventRow);

      return emailEventRow;
    } catch (error) {
      throw new Error(`Error adding email event: ${error.message}`);
    }
  }

  public create(): WorkflowBuilder {
    return new WorkflowBuilder();
  }

  public async startWorkflow(
    workflow: WorkflowConfig,
    contactEmail: string,
    params?: any
  ) {
    try {
      const contact = await this.contactRepository.findOne({
        where: { email: contactEmail },
      });

      if (!contact) {
        throw new Error("Contact not found");
      }

      for (const [index, emailEvent] of workflow.emailEvents.entries()) {
        // TODO: set body params before adding to db
        const newEmailEvent = await this.addEmailEventRow(emailEvent, contact);
        const time = formatDateTime(new Date());
        console.log(
          `${time} - Email event ${index} from workflow: ${workflow.name} ha been added to table email_events with an id of ${newEmailEvent.id}`
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  getCronJob() {
    return this.cronJob;
  }

  public async unsubscribe(contactEmail: string) {
    try {
      const emails = await this.emailEventRepository.find({
        where: { sendTo: contactEmail },
      });

      if (emails.length < 1) {
        return;
      }

      const deleteResult = await this.emailEventRepository.delete({
        sendTo: contactEmail,
      });
      return deleteResult;
    } catch (error) {
      throw new Error(`There was a problem unsubscribing ${contactEmail}`);
    }
  }

  public async save(workflow: WorkflowConfig) {
    try {
      const newWorkflow = this.workflowRepository.create(workflow);
      await this.workflowRepository.save(newWorkflow);
      return newWorkflow;
    } catch (error) {
      throw new Error(`There was an error saving the workflow. ${error}`);
    }
  }
  public async retrieve(workflowId: string) {
    try {
      const workflow = await this.workflowRepository.findOne({
        where: { id: workflowId },
      });

      if (!workflow) {
        throw new Error("Workflow not found");
      }

      return workflow;
    } catch (error) {
      throw new Error(`There wwas an error retrieving the workflow. ${error}`);
    }
  }
  public async delete(workflowId: string): Promise<void> {
    try {
      const deleteResult = await this.workflowRepository.delete({
        id: workflowId,
      });

      if (deleteResult.affected === 0) {
        throw new Error(`Workflow not found`);
      }
    } catch (error) {
      throw new Error(
        `There was an error deleting the workflow: ${error.message}`
      );
    }
  }
  public async list(): Promise<WorkflowEntity[]> {
    try {
      const workflows = await this.workflowRepository.find();
      return workflows;
    } catch (error) {
      throw new Error(`Failed to list workflows: ${error.message}`);
    }
  }
}
