import { DataSource, Repository, UpdateResult, DeleteResult } from "typeorm";
import { mock, MockProxy } from "jest-mock-extended";
import { Tickets } from "../../../src/services/HelpDesk/Tickets";
import { Ticket } from "../../../src/entity/HelpDesk/Ticket.entity";
import { Contact } from "../../../src/entity/Contacts/Contact.entity";

describe("Tickets", () => {
  let tickets: Tickets;
  let mockDataSource: MockProxy<DataSource>;
  let mockRepository: MockProxy<Repository<Ticket>>;
  let mockContactRepository: MockProxy<Repository<Contact>>;
  enum TicketStatus {
    OPEN = "open",
    PENDING = "pending",
    RESOLVED = "resolved",
    CLOSED = "closed",
    ON_HOLD = "on_hold",
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    mockRepository = mock<Repository<Ticket>>();
    mockContactRepository = mock<Repository<Contact>>();
    mockDataSource = mock<DataSource>();
    mockDataSource.getRepository.mockImplementation((entity) => {
      if ((entity as Function).name === "Ticket") {
        return mockRepository as any;
      } else if ((entity as Function).name === "Contact") {
        return mockContactRepository as any;
      }
    });

    tickets = new Tickets(mockDataSource);
  });

  it("should retrieve a ticket by id", async () => {
    const ticketId = 1;
    const fakeTicket = new Ticket();
    fakeTicket.id = ticketId;

    mockRepository.findOne.mockResolvedValueOnce(fakeTicket); // Second call check with name and returns fakeList

    const result = await tickets.retrieve(ticketId);

    expect(result).toEqual(fakeTicket);
    expect(mockRepository.findOne).toBeCalledWith({ where: { id: 1 } });
  });

  it("should create a ticket", async () => {
    const ticketData = {
      email: "test@email.com",
      subject: "Subject",
      content: "content",
      status: TicketStatus.CLOSED,
    };
    const savedTicket = new Ticket();
    savedTicket.id = 1;
    savedTicket.email = ticketData.email;
    savedTicket.subject = ticketData.subject;
    savedTicket.status = ticketData.status;
    savedTicket.content = ticketData.content;

    mockRepository.create.mockReturnValue(savedTicket);
    mockRepository.save.mockResolvedValue(savedTicket);

    const result = await tickets.create(ticketData);
    expect(result).toEqual(savedTicket);
    expect(mockRepository.create).toHaveBeenCalledWith(ticketData);
    expect(mockRepository.save).toHaveBeenCalledWith(savedTicket);
  });

  it("should update a ticket", async () => {
    const ticketId = 1;
    const ticketData = {
      email: "test@email.com",
      subject: "Subject",
      content: "content",
      status: TicketStatus.OPEN,
    };

    const existingTicket = new Ticket();
    existingTicket.id = ticketId;
    existingTicket.content = "CONTENT";
    existingTicket.subject = "subject";
    existingTicket.status = TicketStatus.CLOSED;
    existingTicket.email = "test@email.com";

    const updatedTicket = new Ticket();
    updatedTicket.id = ticketId;
    updatedTicket.email = ticketData.email;
    updatedTicket.subject = ticketData.subject;
    updatedTicket.content = ticketData.content;
    updatedTicket.status = ticketData.status;

    mockRepository.findOne
      .mockResolvedValue(existingTicket)
      .mockResolvedValue(updatedTicket);
    mockRepository.update.mockResolvedValue({} as UpdateResult);

    const result = await tickets.update(ticketId, ticketData);

    expect(result).toEqual(updatedTicket);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: ticketId },
    });
    expect(mockRepository.update).toHaveBeenCalledWith(ticketId, ticketData);
  });

  it("should delete a ticket", async () => {
    const ticketId = 1;

    mockRepository.delete.mockResolvedValue({
      affected: 1,
    } as DeleteResult);

    await tickets.delete(ticketId);

    expect(mockRepository.delete).toHaveBeenCalledWith({ id: ticketId });
  });

  it("should throw an error if ticket not found", async () => {
    const ticketId = 1;

    mockRepository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

    await expect(tickets.delete(ticketId)).rejects.toThrow(`List not found`);

    expect(mockRepository.delete).toHaveBeenCalledWith({ id: ticketId });
  });

  it("should list all tickets", async () => {
    const fakeTickets = [
      {
        id: 1,
        email: "email 1",
        content: "content 1",
        status: TicketStatus.PENDING,
        subject: "subject",
      },
      {
        id: 2,
        email: "email 2",
        content: "content 2",
        status: TicketStatus.PENDING,
        subject: "subject",
      },
      {
        id: 3,
        email: "email 3",
        content: "content 3",
        status: TicketStatus.PENDING,
        subject: "subject",
      },
    ].map((data) => {
      const ticket = new Ticket();
      ticket.id = data.id;
      ticket.email = data.email;
      ticket.content = data.content;
      ticket.subject = data.subject;
      return ticket;
    });

    mockRepository.find.mockResolvedValue(fakeTickets);

    const result = await tickets.list();

    expect(result).toEqual(fakeTickets);
    expect(mockRepository.find).toBeCalledTimes(1);
  });
});
