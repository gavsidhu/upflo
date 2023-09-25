import { DataSource, Repository } from "typeorm";
import { Tags } from "./Tags";
import { Lists } from "./Lists";
import { Contact } from "../../entity/Contacts/Contact.entity";
import {
  ContactCreateParams,
  ContactUpdateParams,
} from "../../../types/Contacts/Contact";
import { Notes } from "./Notes";
import { EnsureConnection } from "../../decorators/ensureConnection";

export class Contacts {
  private connection: DataSource;
  private contactRepository: Repository<Contact>;
  public tags: Tags;
  public lists: Lists;
  public notes: Notes;

  constructor(connection: DataSource) {
    this.connection = connection;
    this.contactRepository = this.connection.getRepository(Contact);
    this.tags = new Tags(connection);
    this.lists = new Lists(connection);
  }
  @EnsureConnection()
  async retrieve(contactId: string) {
    try {
      const contact = await this.contactRepository.findOne({
        where: { id: contactId },
      });
      if (!contact) throw new Error(`Contact with id ${contactId} not found`);

      return contact;
    } catch (error) {
      throw new Error("There was an error retrieving the contact");
    }
  }
  @EnsureConnection()
  async create(contactData: ContactCreateParams) {
    if (!contactData) throw new Error("No contact data provided");

    try {
      const newContact = this.contactRepository.create(contactData);
      await this.contactRepository.save(newContact);

      return newContact;
    } catch (error) {
      throw new Error(`Error creating contact: ${error.message}`);
    }
  }
  @EnsureConnection()
  async update(contactId: string, contactData: ContactUpdateParams) {
    if (!contactData) throw new Error("No contact data provided");

    try {
      const contact = await this.contactRepository.findOne({
        where: { id: contactId },
      });

      if (!contact) throw new Error(`Contact not found`);

      await this.contactRepository.update(contactId, contactData);
      const updatedContact = await this.contactRepository.findOne({
        where: { id: contactId },
      });

      return updatedContact;
    } catch (error) {
      throw new Error(`Error updating contact: ${error.message}`);
    }
  }
  @EnsureConnection()
  async delete(contactId: string) {
    try {
      const deleteResult = await this.contactRepository.delete({
        id: contactId,
      });

      if (deleteResult.affected === 0) {
        throw new Error(`Contact not found`);
      }
    } catch (error) {
      throw new Error(
        `There was an error deleting the contact: ${error.message}`
      );
    }
  }
  @EnsureConnection()
  async list() {
    try {
      const contacts = await this.contactRepository.find();

      return contacts;
    } catch (error) {
      throw new Error(`There was an error listing contacts: ${error.message}`);
    }
  }
}
