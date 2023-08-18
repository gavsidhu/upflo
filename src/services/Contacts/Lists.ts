import { DataSource, Repository } from "typeorm";
import {
  ListAddContactParams,
  ListCreateParams,
  ListRemoveContactParams,
  ListUpdateParams,
} from "../../../types/Contacts/List";
import { List } from "../../entity/Contacts/List.entity";
import { Contact } from "../../entity/Contacts/Contact.entity";

export class Lists {
  private connection: DataSource;
  private listRepository: Repository<List>;
  private contactRepository: Repository<Contact>;

  /**
   * Create a new instance of the Tags class.
   * @param {DataSource} connection - The TypeORM DataSource connection.
   */
  constructor(connection: DataSource) {
    this.connection = connection;
    this.listRepository = this.connection.getRepository(List);
    this.contactRepository = this.connection.getRepository(Contact);
  }
  /**
   *
   * @param {string} listId Target list's ID
   * @returns {Promise<List>} The retrieved list.
   * @throws {Error} - If list ID is not provided.
   * @throws {Error} - If the list is not found.
   */
  async retrieve(listId: string): Promise<List> {
    if (!listId) throw new Error("No list id provided");
    try {
      const list = await this.listRepository.findOne({
        where: { id: listId },
      });
      if (!list) throw new Error(`List with id of ${listId} does not exist`);

      return list;
    } catch (error) {
      throw new Error(`There was an error retriving list: ${error.message}`);
    }
  }

  /**
   * Create a new list
   *
   * @param {TicketCreateParams} listData - Data for creating the list.
   * @returns {Promise<List>} - The created list.
   * @throws {Error} - If the listData is not provided or an error occurs while saving the list.
   */
  async create(listData: ListCreateParams): Promise<List> {
    if (!listData) throw new Error("No list data provided");

    try {
      const newList = this.listRepository.create(listData);
      await this.listRepository.save(newList);
      return newList;
    } catch (error) {
      throw new Error(`Error when creating list: ${error.message}`);
    }
  }

  /**
   *
   * @param {string} listId - The identifier of a list.
   * @param {ListUpdateParams} listData - Data for updating a ticket.
   * @returns {Promise<List>} - The updated list.
   * @throws {Error} - If listId is not provided, listData is not provided, the specified list is not found or an error occuers when updating the list.
   */

  async update(listId: string, listData: ListUpdateParams): Promise<List> {
    if (!listId) throw new Error("No list id provided ");
    if (!listData) throw new Error("No list data provided");

    try {
      const list = await this.listRepository.findOne({ where: { id: listId } });
      if (!list) throw new Error("List not found");

      await this.listRepository.update(listId, listData);
      const updatedList = await this.listRepository.findOne({
        where: { id: listId },
      });
      return updatedList;
    } catch (error) {
      throw new Error(`Error while updating list: ${error.message}`);
    }
  }

  /**
   *
   * @param {string} listId - The identifier of a list.
   * @returns {Promise<void>}
   * @throws {Error} - If specified list is not found or error occurs when deleting ticket.
   */
  async delete(listId: string): Promise<void> {
    try {
      const deleteResult = await this.listRepository.delete({
        id: listId,
      });

      if (deleteResult.affected === 0) {
        throw new Error(`List not found`);
      }
    } catch (error) {
      throw new Error(`There was an error deleting the list: ${error.message}`);
    }
  }

  async list() {
    try {
      const lists = await this.listRepository.find();
      return lists;
    } catch (error) {
      throw new Error(`There was a problem listing lists: ${error}`);
    }
  }

  /**
   *
   * @param {ListAddContactParams} params - The parameters for adding a contact to a list.
   * @returns {Promise<List>}
   * @throws {Error} - Will throw an error if the contact doesn't exist, the list doesn't exist or there was adding a contact to list.
   */
  async addContact(params: ListAddContactParams): Promise<any> {
    const { contactId, listId } = params;
    const contact = await this.contactRepository.findOne({
      where: { id: contactId },
      relations: ["lists"],
    });
    if (!contact) throw new Error(`Contact with id ${contactId} not found`);

    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) throw new Error(`List with id ${listId} not found`);

    try {
      if (contact.lists.some((existingList) => existingList.id === list.id)) {
        // If contact is already assigned to list, there's no need to make any changes
        return;
      }
      contact.lists.push(list);
      await this.contactRepository.save(contact);
      return list;
    } catch (error) {
      throw new Error(`There was an error adding the contact to the list`);
    }
  }

  /**
   * @async
   * @function removeContact
   * @param {ListRemoveContactParams} params - Params for removing contact from list.
   * @throws Will throw an error if the contact does not exist
   * @throws Will throw an error if the list does not exist
   * @throws Will throw an error if the contact is not assigned to the list
   * @returns {Promise} Resolves when contact is successfully removed
   */
  async removeContact(params: ListRemoveContactParams): Promise<any> {
    try {
      const { contactId, listId } = params;
      const contact = await this.contactRepository.findOne({
        where: { id: contactId },
        relations: ["lists"],
      });

      if (!contact) {
        throw new Error(`Contact with id ${contactId} not found`);
      }

      const list = await this.listRepository.findOne({
        where: { id: listId },
      });

      if (!list) {
        throw new Error(`List with id ${listId} not found`);
      }

      if (contact.lists.some((existingList) => existingList.id == list.id)) {
        contact.lists = contact.lists.filter(
          (listItem) => listItem.id != list.id
        );
        await this.contactRepository.save(contact);
        return list;
      } else {
        throw new Error(
          `Contact with id ${contactId} removed from list with id ${listId}`
        );
      }
    } catch (error) {
      throw new Error(
        `There was an error removing contact from list: ${error.message}`
      );
    }
  }
}
