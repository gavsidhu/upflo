import { DataSource, Repository, UpdateResult, DeleteResult } from "typeorm";
import { mock, MockProxy } from "jest-mock-extended";
import { Workflow } from "../../../src/services/Workflow/Workflow";
import { Contact } from "../../../src/entity/Contacts/Contact.entity";
import { Workflow as WorkflowEntity } from "../../../src/entity/Workflow/Workflow.entity";
import { Email } from "../../../src/services/Email";
import { WorkflowConfig } from "../../../types/Workflow";
import { EmailEvents } from "../../../src/entity/Workflow/EmailEvents.entity";

describe("Workflow", () => {
  let workflows: Workflow;
  let emails: Email;
  let mockDataSource: MockProxy<DataSource>;
  let mockWorkflowRepository: MockProxy<Repository<WorkflowEntity>>;
  let mockContactRepository: MockProxy<Repository<Contact>>;
  let mockEmailEventRepository: MockProxy<Repository<EmailEvents>>;
  let mockEmailProvider: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEmailProvider = { sendEmail: jest.fn() };
  });

  beforeAll(() => {
    mockWorkflowRepository = mock<Repository<WorkflowEntity>>();
    mockContactRepository = mock<Repository<Contact>>();
    mockEmailEventRepository = mock<Repository<EmailEvents>>();
    mockDataSource = mock<DataSource>();
    mockDataSource.getRepository.mockImplementation((entity) => {
      if ((entity as Function).name === "Workflow") {
        return mockWorkflowRepository as any;
      } else if ((entity as Function).name === "Contact") {
        return mockContactRepository as any;
      } else if ((entity as Function).name === "EmailEvents") {
        return mockEmailEventRepository as any;
      }
    });
    emails = new Email(mockDataSource, mockEmailProvider);
    workflows = new Workflow(mockDataSource, emails);
  });

  afterAll(() => {
    const cronJob = workflows.getCronJob();
    cronJob.stop();
  });

  it("should start a workflow and add email events to the database", async () => {
    const workflowConfig: WorkflowConfig = {
      name: "test",
      description: "test",
      emailEvents: [
        {
          body: "Email 1 body",
          sendDelay: 0,
          sendFrom: "sender@example.com",
          subject: "Email 1 subject",
        },
        {
          body: "Email 2 body",
          sendDelay: 3600, // Delay in seconds
          sendFrom: "sender@example.com",
          subject: "Email 2 subject",
        },
      ],
    };

    const contact = new Contact();
    contact.email = "test@email.com";

    mockContactRepository.findOne.mockResolvedValueOnce(contact);

    const newRow = new EmailEvents();

    mockEmailEventRepository.create.mockReturnValue(newRow);

    await workflows.startWorkflow(workflowConfig, contact.email);

    expect(mockContactRepository.findOne).toBeCalledWith({
      where: { email: contact.email },
    });
  });

  it("should save a workflow", async () => {
    const workflow = workflows
      .create()
      .setName("Workflow")
      .setDescription("This is a test")
      .addEmailEvent({
        body: "Hello world",
        sendFrom: "me@emails.com",
        subject: "This is a test",
        sendDelay: 0,
      })
      .build();
    console.log(workflow);
    const savedWorkflow = new WorkflowEntity();
    savedWorkflow.id = "1";
    savedWorkflow.emailEvents = workflow.emailEvents;
    savedWorkflow.name = workflow.name;
    savedWorkflow.description = workflow.description;

    mockWorkflowRepository.create.mockReturnValue(savedWorkflow);
    mockWorkflowRepository.save.mockResolvedValue(savedWorkflow);

    const result = await workflows.save(workflow);
    expect(result).toEqual(savedWorkflow);
    expect(mockWorkflowRepository.create).toHaveBeenCalledWith(workflow);
    expect(mockWorkflowRepository.save).toHaveBeenCalledWith(savedWorkflow);
  });

  it("should retrieve workflow", async () => {
    const workflowId = "1";
    const workflow = new WorkflowEntity();
    workflow.id = workflowId;

    mockWorkflowRepository.findOne.mockResolvedValueOnce(workflow);

    const result = await workflows.retrieve(workflowId);

    expect(result).toEqual(workflow);
    expect(mockWorkflowRepository.findOne).toBeCalledWith({
      where: { id: workflowId },
    });
  });

  it("should delete a workflow", async () => {
    const workflowId = "1";

    mockWorkflowRepository.delete.mockResolvedValue({
      affected: 1,
    } as DeleteResult);

    await workflows.delete(workflowId);

    expect(mockWorkflowRepository.delete).toHaveBeenCalledWith({
      id: workflowId,
    });
  });

  it("should throw an error if workflow not found", async () => {
    const workflowId = "1";

    mockWorkflowRepository.delete.mockResolvedValue({
      affected: 0,
    } as DeleteResult);

    await expect(workflows.delete(workflowId)).rejects.toThrow(
      `Workflow not found`
    );

    expect(mockWorkflowRepository.delete).toHaveBeenCalledWith({
      id: workflowId,
    });
  });

  it("should list all workflows", async () => {
    const fakeWorkflows = [
      {
        id: "1",
        name: "Workflow",
        description: "This is a test",
        emailEvents: [
          {
            body: "Hello world",
            sendFrom: "me@emails.com",
            subject: "This is a test",
            sendDelay: 0,
          },
        ],
      },
      {
        id: "2",
        name: "Workflow 2",
        description: "This is a test 2",
        emailEvents: [
          {
            body: "Hello world 2",
            sendFrom: "me2@emails.com",
            subject: "This is a test 2",
            sendDelay: 2,
          },
        ],
      },
    ].map((data) => {
      const workflow = new WorkflowEntity();
      workflow.id = data.id;
      workflow.name = data.name;
      workflow.description = data.description;
      workflow.emailEvents = data.emailEvents;
      return workflow;
    });

    mockWorkflowRepository.find.mockResolvedValue(fakeWorkflows);

    const result = await workflows.list();

    expect(result).toEqual(fakeWorkflows);
    expect(mockWorkflowRepository.find).toBeCalledTimes(1);
  });
});
