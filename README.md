# Upflo

Upflo is a versatile backend library, developed in TypeScript. It offers functionalities that simplify and automate many common and repeatable tasks, including managing HelpDesk tickets, managing contacts, and email sending. This allows developers to focus on creating solutions that deliver outstanding customer experiences and improve marketing efficiency.

## Features:

1. **Contacts**: Provides functionality to manipulate contact data in your database such as creating, updating, retrieving, and deleting contacts.
2. **Help Desk**: Provides a simple and efficient mechanism to manage helpdesk tickets ranging from creating, updating, deleting, to comprehensive listing functionalities.
3. **Email**: Helps you to integrate with email provider Mailgun for seamless transmission of information to your contact list.

## How to install:

```bash
$ npm install upflo
```

## How to use:

```javascript
import { Upflo, MailgunProvider } from "upflo";
import { DataSourceOptions } from "typeorm";


const options: DataSourceOptions = {
 /* Your database options */
    database: "mydb.sql",
    type: "sqlite",
};

const emailProvider = new MailgunProvider({
    username: 'api',
    key: "api-key"
    domain: "your_domain"
});

const upflo = new Upflo(options);

upflo.connect(emailProvider).then(()=>{
    console.log("Connected")
});
```

## Documentation:

### Contacts

The `Contacts` class within the Upflo library provides methods for managing contacts. It includes functionalities such as retrieving, creating, updating, and deleting contacts.

```typescript
// Retrieve a contact
const contact = await upflo.contacts.retrieve(contactId);

// Create a contact
const newContact = await upflo.contacts.create(contactData);

// Update a contact
const updatedContact = await upflo.contacts.update(contactId, contactData);

// Delete a contact
await upflo.contacts.delete(contactId);
```

### Lists

The `Lists` class within the Upflo library provides methods for managing lists. It includes functionalities such as retrieving, creating, updating, deleting lists, and managing contacts within a list.

```typescript
// Retrieve a list
const list = await upflo.contacts.lists.retrieve(listId);

// Create a list
const newList = await upflo.contacts.lists.create(listData);

// Update a list
const updatedList = await upflo.contacts.lists.update(listId, listData);

// Delete a list
await upflo.contacts.lists.delete(listId);

// List all lists
const lists = await upflo.contacts.lists.list();

// Add a contact to a list
const modifiedList = await upflo.contacts.lists.addContact(
  listAddContactParams
);

// Remove a contact from a list
await upflo.contacts.lists.removeContact(listRemoveContactParams);
```

### Tags

The `Tags` class within the Upflo library provides methods for managing tags. It includes functionalities such as retrieving, creating, updating, deleting tags, and assigning/removing tags to/from contacts.

```typescript
// Retrieve a tag
const tag = await upflo.contacts.tags.retrieve(tagIdentifier);

// Create a tag
const newTag = await upflo.contacts.tags.create(tagData);

// Update a tag
const updatedTag = await upflo.contacts.tags.update(tagId, tagData);

// Delete a tag
await upflo.contacts.tags.delete(tagId);

// List all tags
const tags = await upflo.contacts.tags.list();

// Assign a tag to a contact
const modifiedTag = await upflo.contacts.tags.assign(tagAssignParams);

// Remove a tag from a contact
await upflo.contacts.tags.removeTag(tagRemoveParams);
```

### HelpDesk

The `HelpDesk` class within the Upflo library is responsible for managing helpdesk tickets. It provides functionality to retrieve, create, update, and delete tickets.

```typescript
// Retrieve a ticket
const ticket = await upflo.helpdesk.tickets.retrieve(ticketId);

// Create a ticket
const newTicket = await upflo.helpdesk.tickets.create(ticketData);

// Update a ticket
const updatedTicket = await upflo.helpdesk.tickets.update(ticketId, ticketData);

// Delete a ticket
await upflo.helpdesk.tickets.delete(ticketId);
```

### Email

The `Email` class within the Upflo library allows the sending of emails. It requires an existing database connection and an `EmailProvider` to send the email through the specified email provider.

```typescript
// Send an email
await upflo.email.sendEmail(to, subject, body);
```

## Getting Help:

If you have questions or need further guidance on using this library, please file an issue on the [GitHub repository](https://github.com/gavsidhu/upflo/issues).

## License:

Upflo is provided under the MIT License
