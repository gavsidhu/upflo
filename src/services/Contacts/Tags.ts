import { DataSource, Repository } from "typeorm";
import { Tag } from "../../entity/Contacts/Tag.entity";
import {
  TagAssignParams,
  TagCreateParams,
  TagRemoveParams,
  TagRetrieveParams,
  TagUpdateParams,
} from "../../../types/Contacts/Tag";
import { Contact } from "../../entity/Contacts/Contact.entity";

export class Tags {
  private connection: DataSource;
  private tagRepository: Repository<Tag>;
  private contactRepository: Repository<Contact>;

  constructor(connection: DataSource) {
    this.connection = connection;
    this.tagRepository = this.connection.getRepository(Tag);
    this.contactRepository = this.connection.getRepository(Contact);
  }

  async retrieve(identifier: string): Promise<Tag> {
    try {
      // Try to find the tag by id first
      let tag = await this.tagRepository.findOne({ where: { id: identifier } });
      if (!tag) {
        // If not found by id then try to find tag by name
        tag = await this.tagRepository.findOne({ where: { name: identifier } });
      }
      if (!tag) {
        throw new Error("Tag not found");
      }

      return tag;
    } catch (error) {
      throw new Error(`Error retrieving tag: ${error.message}`);
    }
  }

  async create(tagData: TagCreateParams) {
    if (!tagData) throw new Error("No tag data provided");
    try {
      const newTag = this.tagRepository.create(tagData);
      await this.tagRepository.save(newTag);
      return newTag;
    } catch (error) {
      throw new Error(`There was an error creating a tag: ${error.message}`);
    }
  }

  async update(tagId: string, tagData: TagUpdateParams) {
    try {
      const tag = await this.tagRepository.findOne({ where: { id: tagId } });
      if (!tag) {
        throw new Error("Tag not found");
      }

      await this.tagRepository.update(tagId, tagData);
      const updatedTag = await this.tagRepository.findOne({
        where: { id: tagId },
      });
      return updatedTag;
    } catch (error) {
      throw new Error(
        `There was an error update tag ${tagId}: ${error.message}`
      );
    }
  }

  async delete(tagId: string) {
    try {
      const deleteResult = await this.tagRepository.delete({
        id: tagId,
      });

      if (deleteResult.affected === 0) {
        throw new Error(`Tag not found`);
      }
    } catch (error) {
      throw new Error(`There was an error deleting the tag: ${error.message}`);
    }
  }
  async list() {
    try {
      const tags = await this.tagRepository.find();
      return tags;
    } catch (error) {
      throw new Error(`There was an error listing tags: ${error.message}`);
    }
  }

  async assign(params: TagAssignParams): Promise<Tag> {
    try {
      const { contactId, tagName } = params;

      const tag = await this.tagRepository.findOne({
        where: { name: tagName },
      });

      if (!tag) {
        throw new Error(`Tag with title ${tagName} not found`);
      }

      const contact = await this.contactRepository.findOne({
        where: { id: contactId },
        relations: ["tags"],
      });

      if (!contact) {
        throw new Error(`Contact with id ${contactId} not found`);
      }

      if (
        contact.tags &&
        contact.tags.some((existingTag) => existingTag.id === tag.id)
      ) {
        // If the tag is already assigned, there's no need to make any changes.
        return;
      }

      contact.tags.push(tag);
      await this.contactRepository.save(contact);

      return tag;
    } catch (error) {
      throw new Error(
        `There was an error assigning tag ${params.tagName} to contact ${params.contactId}: ${error.message}`
      );
    }
  }

  async removeTag(params: TagRemoveParams): Promise<any> {
    try {
      const { contactId, tagName } = params;
      const contact = await this.contactRepository.findOne({
        where: { id: contactId },
        relations: ["tags"],
      });

      if (!contact) {
        throw new Error(`Contact with id ${contactId} not found`);
      }

      const tag = await this.tagRepository.findOne({
        where: { name: tagName },
      });

      if (!tag) {
        throw new Error(`Tag with title ${tagName} not found`);
      }

      if (contact.tags.some((existingTag) => existingTag.id == tag.id)) {
        contact.tags = contact.tags.filter((tagItem) => tagItem.id != tag.id);
        await this.contactRepository.save(contact);
        return contact;
      } else {
        throw new Error(
          `Tag with title ${tagName} isn't assigned to the Contact`
        );
      }
    } catch (error) {
      throw new Error(`There was an error removing tag: ${error.message}`);
    }
  }
}
