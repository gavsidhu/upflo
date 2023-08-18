import { DataSource, Repository, UpdateResult, DeleteResult } from "typeorm";
import { mock, MockProxy } from "jest-mock-extended";
import { Lists } from "../../../src/services/Contacts/Lists";
import { List } from "../../../src/entity/Contacts/List.entity";
import { Contact } from "../../../src/entity/Contacts/Contact.entity";

describe("Lists", () => {
  let lists: Lists;
  let mockDataSource: MockProxy<DataSource>;
  let mockRepository: MockProxy<Repository<List>>;
  let mockContactRepository: MockProxy<Repository<Contact>>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    mockRepository = mock<Repository<List>>();
    mockContactRepository = mock<Repository<Contact>>();
    mockDataSource = mock<DataSource>();
    mockDataSource.getRepository.mockImplementation((entity) => {
      if ((entity as Function).name === "List") {
        return mockRepository as any;
      } else if ((entity as Function).name === "Contact") {
        return mockContactRepository as any;
      }
    });

    lists = new Lists(mockDataSource);
  });

  it("should retrieve a list by id", async () => {
    const listId = "1";
    const fakeList = new List();
    fakeList.id = "1";

    mockRepository.findOne.mockResolvedValueOnce(fakeList); // Second call check with name and returns fakeList

    const result = await lists.retrieve(listId);

    expect(result).toEqual(fakeList);
    expect(mockRepository.findOne).toBeCalledWith({ where: { id: "1" } });
  });

  it("should create a list", async () => {
    const listData = {
      name: "New subscribers",
      description: "A list of new subscribers",
    };
    const savedList = new List();
    savedList.id = "1";
    savedList.name = "New subscribers";

    mockRepository.create.mockReturnValue(savedList);
    mockRepository.save.mockResolvedValue(savedList);

    const result = await lists.create(listData);
    expect(result).toEqual(savedList);
    expect(mockRepository.create).toHaveBeenCalledWith(listData);
    expect(mockRepository.save).toHaveBeenCalledWith(savedList);
  });

  it("should update a list", async () => {
    const listId = "1";
    const listData = {
      name: "Old subscribers",
      description: "A list of old subscribers",
    };

    const existingLists = new List();
    existingLists.id = listId;
    existingLists.name = "New subscribers";
    existingLists.description = "A list of new subscribers";

    const updatedList = new List();
    updatedList.id = listId;
    updatedList.name = listData.name;
    updatedList.description = listData.description;

    mockRepository.findOne
      .mockResolvedValueOnce(existingLists)
      .mockResolvedValueOnce(updatedList);
    mockRepository.update.mockResolvedValue({} as UpdateResult);

    const result = await lists.update(listId, listData);

    expect(result).toEqual(updatedList);
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(mockRepository.update).toHaveBeenCalledWith(listId, listData);
  });

  it("should delete a list", async () => {
    const listId = "1";

    mockRepository.delete.mockResolvedValue({
      affected: 1,
    } as DeleteResult);

    await lists.delete(listId);

    expect(mockRepository.delete).toHaveBeenCalledWith({ id: listId });
  });

  it("should throw an error if list not found", async () => {
    const listId = "1";

    mockRepository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

    await expect(lists.delete(listId)).rejects.toThrow(`List not found`);

    expect(mockRepository.delete).toHaveBeenCalledWith({ id: listId });
  });

  it("should list all lists", async () => {
    const fakeLists = [
      { id: "1", name: "List 1", description: "Description 1" },
      { id: "2", name: "List 2", description: "Description 2" },
      { id: "3", name: "List 3", description: "Description 3" },
    ].map((data) => {
      const list = new List();
      list.id = data.id;
      list.name = data.name;
      return list;
    });

    mockRepository.find.mockResolvedValue(fakeLists);

    const result = await lists.list();

    expect(result).toEqual(fakeLists);
    expect(mockRepository.find).toBeCalledTimes(1);
  });

  it("should add a contact to a list", async () => {
    const listId = "1";
    const list = new List();
    list.id = listId;
    list.name = "New subscribers";
    list.description = "A list of new subscribers";
    const existingLists = new List();
    existingLists.id = listId;
    existingLists.name = "New subscribers";
    existingLists.description = "A list of new subscribers";

    const contactId = "1";
    const contact = new Contact();
    contact.id = contactId;
    contact.lists = [];

    mockRepository.findOne.mockResolvedValue(list);
    mockContactRepository.findOne.mockResolvedValue(contact);
    mockContactRepository.save.mockResolvedValue(contact);

    const result = await lists.addContact({ contactId, listId });

    expect(result).toEqual(list);
    expect(contact.lists).toContain(list);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: listId },
    });
    expect(mockContactRepository.findOne).toHaveBeenCalledWith({
      where: { id: contactId },
      relations: ["lists"],
    });
    expect(mockContactRepository.save).toHaveBeenCalledWith(contact);
  });

  it("should remove a contact from a list", async () => {
    const listId = "2";
    const list = new List();
    list.name = listId;
    list.description = "description";
    list.id = listId;

    const contactId = "1";
    const contact = new Contact();
    contact.id = contactId;
    contact.lists = [list];

    const removedContact = new Contact();
    removedContact.id = contactId;
    removedContact.lists = [];

    mockContactRepository.findOne.mockResolvedValue(contact);
    mockRepository.findOne.mockResolvedValue(list);
    mockContactRepository.save.mockResolvedValue(removedContact);

    // Call the removeTag method with the right parameters
    const result = await lists.removeContact({ contactId, listId });

    // Check the result
    expect(result).toEqual(list);
  });
});
