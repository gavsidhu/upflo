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
  constructor(connection: DataSource) {
    this.connection = connection;
    this.listRepository = this.connection.getRepository(List);
    this.contactRepository = this.connection.getRepository(Contact);
  }

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
