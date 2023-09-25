import { DataSource, Repository } from "typeorm";
import {
  NoteCreateParams,
  NoteUpdateParams,
} from "../../../types/Contacts/Note";
import { Contact } from "../../entity/Contacts/Contact.entity";
import { Note } from "../../entity/Contacts/Note.entity";
import { EnsureConnection } from "../../decorators/ensureConnection";

export class Notes {
  private connection: DataSource;
  private notesRepository: Repository<Note>;
  private contactRepository: Repository<Contact>;

  constructor(connection: DataSource) {
    this.connection = connection;
    this.notesRepository = this.connection.getRepository(Note);
    this.contactRepository = this.connection.getRepository(Contact);
  }

  @EnsureConnection()
  async retrieve(id: string): Promise<Note> {
    try {
      const note = await this.notesRepository.findOne({
        where: { id: id },
      });

      if (!note) {
        throw new Error("Note not found");
      }

      return note;
    } catch (error) {
      throw new Error(`Error retrieving note: ${error.message}`);
    }
  }

  @EnsureConnection()
  async create(noteData: NoteCreateParams) {
    if (!noteData) throw new Error("No note data provided");

    const { contactEmail, content, title } = noteData;

    try {
      const contact = await this.contactRepository.findOne({
        where: { email: contactEmail },
        relations: ["notes"],
      });

      if (!contact) {
        throw new Error(`Contact with email: ${contactEmail} not found`);
      }

      const newNote = this.notesRepository.create({
        contact: contact,
        content,
        title,
      });
      await this.notesRepository.save(newNote);

      return newNote;
    } catch (error) {
      throw new Error(`There was an error creating a note: ${error.message}`);
    }
  }

  @EnsureConnection()
  async update(noteId: string, noteData: NoteUpdateParams) {
    try {
      const { contactEmail, content, title } = noteData;
      let contact: Contact;
      if (contactEmail) {
        contact = await this.contactRepository.findOne({
          where: { email: contactEmail },
          relations: ["notes"],
        });

        if (!contact) {
          throw new Error(`Contact with email: ${contactEmail} not found`);
        }
      }
      const note = await this.notesRepository.findOne({
        where: { id: noteId },
      });
      if (!note) {
        throw new Error("Note not found");
      }

      await this.notesRepository.update(noteId, {
        contact: contact,
        content,
        title,
      });

      const updatedNote = await this.notesRepository.findOne({
        where: { id: noteId },
        relations: ["notes"],
      });

      return updatedNote;
    } catch (error) {
      throw new Error(
        `There was an error update note ${noteId}: ${error.message}`
      );
    }
  }

  @EnsureConnection()
  async delete(noteId: string) {
    try {
      const deleteResult = await this.notesRepository.delete({
        id: noteId,
      });

      if (deleteResult.affected === 0) {
        throw new Error(`Note not found`);
      }
    } catch (error) {
      throw new Error(`There was an error deleting the note: ${error.message}`);
    }
  }

  @EnsureConnection()
  async list() {
    try {
      const notes = await this.notesRepository.find();

      return notes;
    } catch (error) {
      throw new Error(`There was an error listing notes: ${error.message}`);
    }
  }
}
