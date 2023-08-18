import { DataSource, Repository, UpdateResult, DeleteResult } from "typeorm";
import { mock, MockProxy } from "jest-mock-extended";
import { Contacts } from "../../../src/services/Contacts/Contacts";
import { Contact } from "../../../src/entity/Contacts/Contact.entity";

describe("Contacts", () => {
  let contacts: Contacts;
  let mockDataSource: MockProxy<DataSource>;
  let mockRepository: MockProxy<Repository<Contact>>;

  beforeAll(() => {
    mockRepository = mock<Repository<Contact>>();
    mockDataSource = mock<DataSource>();
    mockDataSource.getRepository.mockReturnValue(mockRepository as any);
    contacts = new Contacts(mockDataSource);
  });

  it("should retrieve a contact", async () => {
    const fakeContact = new Contact();
    fakeContact.id = "1";

    mockRepository.findOne.mockResolvedValue(fakeContact);

    const result = await contacts.retrieve("1");

    expect(result).toEqual(fakeContact);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: "1" },
    });
  });

  it("should create a contact", async () => {
    const contactData = {
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@email.com",
      phone: "4084020182",
      company: "Acme Inc.",
      jobTitle: "Software Engineer",
      customAttributes: {
        favoriteFood: "Cheeseburger",
        demo: false,
      },
    };
    const savedContact = new Contact();
    savedContact.firstName = contactData.firstName;
    savedContact.lastName = contactData.lastName;
    savedContact.email = contactData.email;
    savedContact.phone = contactData.phone;
    savedContact.company = contactData.company;
    savedContact.jobTitle = contactData.jobTitle;
    savedContact.customAttributes = contactData.customAttributes;

    mockRepository.create.mockReturnValue(savedContact);
    mockRepository.save.mockResolvedValue(savedContact);

    const result = await contacts.create(contactData);
    expect(result).toEqual(savedContact);
    expect(mockRepository.create).toHaveBeenCalledWith(contactData);
    expect(mockRepository.save).toHaveBeenCalledWith(savedContact);
  });

  it("should update a contact", async () => {
    const contactId = "1";
    const contactData = {
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@email.com",
      phone: "4084020182",
      company: "Acme Inc.",
      jobTitle: "Senior Software Engineer", // updated
      customAttributes: {
        favoriteFood: "Yogurt", // updated
        demo: true, // updated
      },
    };

    const existingContact = new Contact();
    existingContact.id = contactId;
    existingContact.firstName = contactData.firstName;
    existingContact.lastName = contactData.lastName;
    existingContact.email = contactData.email;
    existingContact.phone = contactData.phone;
    existingContact.company = contactData.company;
    existingContact.jobTitle = "Software Engineer";
    existingContact.customAttributes = {
      favoriteFood: "Cheeseburger",
      demo: false,
    };

    const updatedContact = new Contact();
    updatedContact.id = contactId;
    updatedContact.firstName = contactData.firstName;
    updatedContact.lastName = contactData.lastName;
    updatedContact.email = contactData.email;
    updatedContact.phone = contactData.phone;
    updatedContact.company = contactData.company;
    updatedContact.jobTitle = contactData.jobTitle;
    updatedContact.customAttributes = {
      favoriteFood: "Yogurt",
      demo: true,
    };

    mockRepository.findOne
      .mockResolvedValueOnce(existingContact) // First findOne call to find the existing contact
      .mockResolvedValueOnce(updatedContact); // Second findOne call to return the newly updated contact
    mockRepository.update.mockResolvedValue({} as UpdateResult); // update method doesn't return anything useful

    const result = await contacts.update(contactId, contactData);

    expect(result).toEqual(updatedContact);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: contactId },
    });
    expect(mockRepository.update).toHaveBeenCalledWith(contactId, contactData);
  });

  it("should delete a contact", async () => {
    const contactId = "1";

    mockRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

    await contacts.delete(contactId);

    expect(mockRepository.delete).toHaveBeenCalledWith({ id: contactId });
  });

  it("should throw an error if contact not found", async () => {
    const contactId = "1";

    mockRepository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

    await expect(contacts.delete(contactId)).rejects.toThrow(
      `Contact not found`
    );

    expect(mockRepository.delete).toHaveBeenCalledWith({ id: contactId });
  });

  it("should list all contacts", async () => {
    const fakeContacts = [
      { id: "1", firstName: "Contact 1" },
      { id: "2", firstName: "Contact 2" },
      { id: "3", firstName: "Contact 3" },
    ].map((data) => {
      const contact = new Contact();
      contact.id = data.id;
      contact.firstName = data.firstName;
      return contact;
    });

    mockRepository.find.mockResolvedValue(fakeContacts);

    const result = await contacts.list();

    expect(result).toEqual(fakeContacts);
    expect(mockRepository.find).toBeCalledTimes(1);
  });
});
