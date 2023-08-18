import { DataSource, Repository, UpdateResult, DeleteResult } from "typeorm";
import { mock, MockProxy } from "jest-mock-extended";
import { Tags } from "../../../src/services/Contacts/Tags";
import { Tag } from "../../../src/entity/Contacts/Tag.entity";
import { Contact } from "../../../src/entity/Contacts/Contact.entity";

describe("Tags", () => {
  let tags: Tags;
  let mockDataSource: MockProxy<DataSource>;
  let mockRepository: MockProxy<Repository<Tag>>;
  let mockContactRepository: MockProxy<Repository<Contact>>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    mockRepository = mock<Repository<Tag>>();
    mockContactRepository = mock<Repository<Contact>>();
    mockDataSource = mock<DataSource>();
    mockDataSource.getRepository.mockImplementation((entity) => {
      if ((entity as Function).name === "Tag") {
        return mockRepository as any;
      } else if ((entity as Function).name === "Contact") {
        return mockContactRepository as any;
      }
    });

    tags = new Tags(mockDataSource);
  });

  it("should retrieve a tag by name", async () => {
    const fakeTag = new Tag();
    fakeTag.name = "New";

    mockRepository.findOne
      .mockResolvedValueOnce(null) // First call of findOne check with id returns null
      .mockResolvedValueOnce(fakeTag); // Second call check with name and returns fakeTag

    const result = await tags.retrieve("New");

    expect(result).toEqual(fakeTag);
    expect(mockRepository.findOne).toBeCalledTimes(2);
  });

  it("should create a tag", async () => {
    const tagData = {
      name: "New tag",
    };

    const savedTag = new Tag();
    savedTag.name = tagData.name;

    mockRepository.create.mockReturnValue(savedTag);
    mockRepository.save.mockResolvedValue(savedTag);

    const result = await tags.create(tagData);
    expect(result).toEqual(savedTag);
    expect(mockRepository.create).toHaveBeenCalledWith(tagData);
    expect(mockRepository.save).toHaveBeenCalledWith(savedTag);
  });

  it("should update a tag", async () => {
    const tagId = "1";
    const tagData = {
      name: "New tag",
    };

    const existingTag = new Tag();
    existingTag.id = tagId;
    existingTag.name = "Old tag";

    const updatedTag = new Tag();
    updatedTag.id = tagId;
    updatedTag.name = tagData.name;

    mockRepository.findOne
      .mockResolvedValueOnce(existingTag)
      .mockResolvedValueOnce(updatedTag);
    mockRepository.update.mockResolvedValue({} as UpdateResult);
    const result = await tags.update(tagId, tagData);

    expect(result).toEqual(updatedTag);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: tagId },
    });
    expect(mockRepository.update).toHaveBeenCalledWith(tagId, tagData);
  });

  it("should delete a tag", async () => {
    const tagId = "1";

    mockRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

    await tags.delete(tagId);

    expect(mockRepository.delete).toHaveBeenCalledWith({ id: tagId });
  });

  it("should throw an error if contact not found", async () => {
    const tagId = "1";

    mockRepository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

    await expect(tags.delete(tagId)).rejects.toThrow(`Tag not found`);

    expect(mockRepository.delete).toHaveBeenCalledWith({ id: tagId });
  });

  it("should list all tags", async () => {
    const fakeTags = [
      { id: "1", name: "Tag 1" },
      { id: "2", name: "Tag 2" },
      { id: "3", name: "Tag 3" },
    ].map((data) => {
      const tag = new Tag();
      tag.id = data.id;
      tag.name = data.name;
      return tag;
    });

    mockRepository.find.mockResolvedValue(fakeTags);

    const result = await tags.list();

    expect(result).toEqual(fakeTags);
    expect(mockRepository.find).toBeCalledTimes(1);
  });

  it("should assign a tag to a contact", async () => {
    const contactId = "1";
    const contact = new Contact();
    contact.id = contactId;
    contact.tags = [];

    const tagName = "New customer";
    const tag = new Tag();
    tag.name = tagName;
    tag.id = "2";

    mockRepository.findOne.mockResolvedValue(tag);
    mockContactRepository.findOne.mockResolvedValue(contact);
    mockContactRepository.save.mockResolvedValue(contact);

    const result = await tags.assign({ contactId, tagName });

    expect(result).toEqual(tag);
    expect(contact.tags).toContain(tag);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { name: tagName },
    });
    expect(mockContactRepository.findOne).toHaveBeenCalledWith({
      where: { id: contactId },
      relations: ["tags"],
    });
    expect(mockContactRepository.save).toHaveBeenCalledWith(contact);
  });

  it("should not assign a tag to a contact if it is already assigned", async () => {
    const tagName = "Existing Tag";
    const tag = new Tag();
    tag.id = "1";
    tag.name = tagName;

    const contactId = "1";
    const contact = new Contact();
    contact.id = contactId;
    contact.tags = [tag]; // Existing tag assigned to contact

    mockRepository.findOne.mockResolvedValue(tag);
    mockContactRepository.findOne.mockResolvedValue(contact);

    const result = await tags.assign({ contactId, tagName });

    expect(result).toBeUndefined();
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { name: tagName },
    });
    expect(mockContactRepository.findOne).toHaveBeenCalledWith({
      where: { id: contactId },
      relations: ["tags"],
    });

    // Verify that contactRepository.save was not called
    expect(mockContactRepository.save).not.toHaveBeenCalled();
  });

  it("should remove a tag from a contact", async () => {
    const tagName = "New customer";
    const tag = new Tag();
    tag.name = tagName;
    tag.id = "2";

    const contactId = "1";
    const contact = new Contact();
    contact.id = contactId;
    contact.tags = [tag];

    const removedTagContact = new Contact();
    removedTagContact.id = contactId;
    removedTagContact.tags = [];

    mockContactRepository.findOne.mockResolvedValue(contact);
    mockRepository.findOne.mockResolvedValue(tag);
    mockContactRepository.save.mockResolvedValue(removedTagContact);

    const result = await tags.removeTag({ contactId, tagName });

    expect(result).toEqual(removedTagContact);
  });
});
