import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  BeforeInsert,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Contact } from "../Contacts/Contact.entity";

@Entity("email_events")
export class EmailEvents {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  sendFrom: string;

  @Column()
  sendTo: string;

  @Column()
  sendAt: string;

  @Column()
  subject: string;

  @Column()
  body: string;

  @Column({ type: "boolean", default: false, nullable: false })
  sent: boolean;

  @ManyToOne(() => Contact, (contact) => contact.emailEvents)
  contact: Contact;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
