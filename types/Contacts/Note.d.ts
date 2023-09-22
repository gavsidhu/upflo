import { Contact } from "../../src/entity/Contacts/Contact.entity";

export interface NoteRetrieveParams {}

export interface NoteCreateParams {
  title: string;
  content: string;
  contactEmail: string;
}

export interface NoteUpdateParams {
  content?: string;
  title?: string;
  contactEmail?: string;
}

export interface NoteDeleteParams {}

export interface NoteListParams {}
