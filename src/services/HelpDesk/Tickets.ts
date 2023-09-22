import { DataSource, In, Repository } from "typeorm";
import { Ticket } from "../../entity/HelpDesk/Ticket.entity";
import {
  TicketCreateParams,
  TicketListParams,
  TicketUpdateParams,
} from "../../../types/Ticket";
import { Contact } from "../../entity/Contacts/Contact.entity";

export class Tickets {
  private connection: DataSource;
  private ticketRepository: Repository<Ticket>;
  private contactRepository: Repository<Contact>;

  constructor(connection: DataSource) {
    this.connection = connection;
    this.ticketRepository = this.connection.getRepository(Ticket);
    this.contactRepository = this.connection.getRepository(Contact);
  }

  async retrieve(ticketId: number): Promise<Ticket> {
    if (!ticketId) {
      throw new Error("No ticket id provided");
    }

    try {
      const ticket = await this.ticketRepository.findOne({
        where: { id: ticketId },
      });

      if (!ticket) throw new Error(`Ticket with id of ${ticketId} not found`);

      return ticket;
    } catch (error) {
      throw new Error(`Error when retrieving ticket: ${error.message}`);
    }
  }

  async create(ticketData: TicketCreateParams): Promise<Ticket> {
    if (!ticketData) {
      throw new Error("No ticket data provided");
    }

    const { contactId } = ticketData;

    if (contactId) {
      try {
        const contactSelected = await this.contactRepository.findOne({
          where: { id: contactId },
        });

        if (!contactSelected) {
          throw new Error(`Contact with ID ${contactId} not found.`);
        }

        const newTicket = this.ticketRepository.create({
          ...ticketData,
          contact: contactSelected,
        });

        await this.ticketRepository.save(newTicket);

        return newTicket;
      } catch (error) {
        throw new Error(`Error when creating ticket: ${error.message}`);
      }
    } else {
      try {
        const newTicket = this.ticketRepository.create(ticketData);
        await this.ticketRepository.save(newTicket);

        return newTicket;
      } catch (error) {
        throw new Error(`Error when creating ticket: ${error.message}`);
      }
    }
  }

  async update(
    ticketId: number,
    ticketData: TicketUpdateParams
  ): Promise<Ticket> {
    if (!ticketData) throw new Error("No ticket data provided");
    if (!ticketId) throw new Error("No ticket id provided");

    try {
      const ticket = await this.ticketRepository.findOne({
        where: { id: ticketId },
      });
      if (!ticket) {
        throw new Error("Ticket not found");
      }

      await this.ticketRepository.update(ticketId, ticketData);
      const updatedTag = await this.ticketRepository.findOne({
        where: {
          id: ticketId,
        },
      });
      return updatedTag;
    } catch (error) {
      throw new Error(`Error updating a ticket: ${error.message}`);
    }
  }

  async delete(ticketId: number): Promise<void> {
    try {
      const deleteResult = await this.ticketRepository.delete({
        id: ticketId,
      });

      if (deleteResult.affected === 0) {
        throw new Error(`Ticket not found`);
      }
    } catch (error) {
      throw new Error(
        `There was an error deleting the ticket: ${error.message}`
      );
    }
  }

  async list(params: TicketListParams = {}): Promise<Ticket[]> {
    try {
      if (params.status && params.status.length > 0) {
        const tickets = await this.ticketRepository.find({
          where: { status: In(params.status) },
        });
        return tickets;
      }
      const tickets = await this.ticketRepository.find();
      return tickets;
    } catch (error) {
      throw new Error(`Failed to list tickets: ${error.message}`);
    }
  }
}
