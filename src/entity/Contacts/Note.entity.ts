import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Contact } from "./Contact.entity";

@Entity("notes")
export class Note {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  content: string;

  // @ManyToOne(() => Contact, (contact) => contact.notes)
  // contact: Contact;
}
