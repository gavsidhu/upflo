import { List } from "../../src/entity/Contacts/List.entity";
import { Tag } from "../../src/entity/Contacts/Tag.entity";
import { Note } from "../../src/entity/Contacts/Note.entity";
import { Ticket } from "../../src/entity/HelpDesk/Ticket.entity";
export interface ContactRetrieveParams {
  contactId: string;
}

export interface ContactCreateParams {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  customAttributes?: any;
  leadSource?: string;
  leadStatus?: string;
  tags?: Tag[];
  lists?: List[];
  notes?: Note[];
  tickets?: Ticket[];
}

export interface ContactUpdateParams {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  customAttributes?: any;
  leadSource?: string;
  leadStatus?: string;
  tags?: Tag[];
  lists?: List[];
  notes?: Note[];
  tickets?: Ticket[];
}

export interface ContactDeleteParams {}
