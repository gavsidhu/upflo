import { DataSource, Repository, UpdateResult, DeleteResult } from "typeorm";
import { mock, MockProxy } from "jest-mock-extended";
import { Notes } from "../../../src/services/Contacts/Notes";
import { Contact } from "../../../src/entity/Contacts/Contact.entity";
import { Note } from "../../../src/entity/Contacts/Note.entity";

describe("Notes", () => {
  let notes: Notes;
  let mockDataSource: MockProxy<DataSource>;
  let mockNotesRepository: MockProxy<Repository<Note>>;
  let mockContactRepository: MockProxy<Repository<Contact>>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    mockNotesRepository = mock<Repository<Note>>();
    mockContactRepository = mock<Repository<Contact>>();
    mockDataSource = mock<DataSource>();
    mockDataSource.getRepository.mockImplementation((entity) => {
      if ((entity as Function).name === "Note") {
        return mockNotesRepository as any;
      } else if ((entity as Function).name === "Contact") {
        return mockContactRepository as any;
      }
    });

    notes = new Notes(mockDataSource);
  });

  it("should retrieve a note by id", async () => {
    const noteId = "1";
    const fakeNote = new Note();
    fakeNote.id = "1";

    mockNotesRepository.findOne.mockResolvedValueOnce(fakeNote);

    const result = await notes.retrieve(noteId);

    expect(result).toEqual(fakeNote);
    expect(mockNotesRepository.findOne).toBeCalledWith({ where: { id: "1" } });
  });

  it("should create a note", async () => {
    const noteData = {
      title: "Note",
      content: "A note for a a contact",
      contactEmail: "test@email.com",
    };
    const contact = new Contact();
    contact.email = "test@email.com";

    const savedNote = new Note();
    savedNote.id = "1";
    savedNote.title = "Note";
    savedNote.content = "A note for a a contact";
    savedNote.contact = contact;

    mockContactRepository.findOne.mockResolvedValue(contact);

    mockNotesRepository.create.mockReturnValue(savedNote);
    mockNotesRepository.save.mockResolvedValue(savedNote);

    const result = await notes.create(noteData);
    expect(result).toEqual(savedNote);
    expect(mockNotesRepository.create).toHaveBeenCalledWith({
      contact: contact,
      title: noteData.title,
      content: noteData.content,
    });
    expect(mockNotesRepository.save).toHaveBeenCalledWith(savedNote);
    expect(mockContactRepository.findOne).toBeCalledWith({
      where: { email: noteData.contactEmail },
      relations: ["notes"],
    });
  });

  it("should update a note", async () => {
    const noteId = "1";

    const noteData = {
      title: "Note Updated",
      content: "A note for a a contact",
      contactEmail: "test@email.com",
    };

    const contact = new Contact();
    contact.email = "test@email.com";

    const existingNote = new Note();
    existingNote.id = "1";
    existingNote.title = "Note";
    existingNote.content = "A note for a a contact";
    existingNote.contact = contact;

    const updatedNote = new Note();
    updatedNote.id = "1";
    updatedNote.title = "Note Updated";
    updatedNote.content = "A note for a a contact";
    updatedNote.contact = contact;

    mockContactRepository.findOne.mockResolvedValue(contact);

    mockNotesRepository.findOne
      .mockResolvedValueOnce(existingNote)
      .mockResolvedValueOnce(updatedNote);
    mockNotesRepository.update.mockResolvedValue({} as UpdateResult);

    const result = await notes.update(noteId, noteData);

    expect(result).toEqual(updatedNote);
    expect(mockNotesRepository.findOne).toHaveBeenCalledWith({
      where: { id: "1" },
      relations: ["notes"],
    });
    expect(mockNotesRepository.update).toHaveBeenCalledWith(noteId, {
      contact: contact,
      title: noteData.title,
      content: noteData.content,
    });
  });

  it("should delete a note", async () => {
    const noteId = "1";

    mockNotesRepository.delete.mockResolvedValue({
      affected: 1,
    } as DeleteResult);

    await notes.delete(noteId);

    expect(mockNotesRepository.delete).toHaveBeenCalledWith({ id: noteId });
  });

  it("should throw an error if note not found", async () => {
    const noteId = "1";

    mockNotesRepository.delete.mockResolvedValue({
      affected: 0,
    } as DeleteResult);

    await expect(notes.delete(noteId)).rejects.toThrow(`Note not found`);

    expect(mockNotesRepository.delete).toHaveBeenCalledWith({ id: noteId });
  });

  it("should list all notes", async () => {
    const fakeNotes = [
      {
        id: "1",
        title: "Note 1",
        content: "Description 1",
        contact: new Contact(),
      },
      {
        id: "2",
        title: "Note 2",
        content: "Description 2",
        contact: new Contact(),
      },
      {
        id: "3",
        title: "Note 3",
        content: "Description 3",
        contact: new Contact(),
      },
    ].map((data) => {
      const note = new Note();
      note.id = data.id;
      note.title = data.title;
      note.contact = data.contact;
      return note;
    });

    mockNotesRepository.find.mockResolvedValue(fakeNotes);

    const result = await notes.list();

    expect(result).toEqual(fakeNotes);
    expect(mockNotesRepository.find).toBeCalledTimes(1);
  });
});
