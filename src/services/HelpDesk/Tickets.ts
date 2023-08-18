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

  /**
   * Create a new instance of the Tags class.
   * @param {DataSource} connection - The TypeORM DataSource connection.
   */
  constructor(connection: DataSource) {
    this.connection = connection;
    this.ticketRepository = this.connection.getRepository(Ticket);
    this.contactRepository = this.connection.getRepository(Contact);
  }

  /**
   * Retrieve a ticket by identifier.
   *
   * @param {number} ticketId - The identifier of a ticket.
   * @returns {Promise<Ticket>} - The retrieved ticket.
   * @throws {Error} - If the ticketId is not provided or the ticket is not found
   */
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

  /**
   * Create a new ticket.
   *
   * @param {TicketCreateParams} ticketData - Data for creating a ticket.
   * @returns {Promise<Ticket>} - The created ticket.
   * @throws {Error} - If the ticketData is not provided, the specified contact is not found, or error occurs during saving the ticket.
   */
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

  /**
   * Update a ticket.
   *
   * @param {number} ticketId - The identifier of a ticket.
   * @param {TicketUpdateParams} ticketData - Data for updating a ticket.
   * @returns {Promise<Ticket>} - The updated ticket.
   * @throws {Error} - If the ticketId or ticketData is not provided, the specified ticket is not found, or error occurs during updating the ticket.
   */
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

  /**
   * Delete a ticket.
   *
   * @param {number} ticketId - The identifier of a ticket.
   * @returns {Promise<void>}
   * @throws {Error} - If the specified ticket is not found or error occurs during deleting the ticket.
   */
  async delete(ticketId: number): Promise<void> {
    try {
      const deleteResult = await this.ticketRepository.delete({
        id: ticketId,
      });

      if (deleteResult.affected === 0) {
        throw new Error(`List not found`);
      }
    } catch (error) {
      throw new Error(`There was an error deleting the list: ${error.message}`);
    }
  }

  /**
   * List all tickets.
   *
   * @param {TicketListParams} [params={}] - Parameters for listing tickets.
   * @returns {Promise<Ticket[]>} - A list of tickets.
   * @throws {Error} - If the error occurs during fetching the tickets.
   */
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
