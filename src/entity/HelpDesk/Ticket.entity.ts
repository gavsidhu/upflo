import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Contact } from "../Contacts/Contact.entity";

export enum TicketStatus {
  OPEN = "open",
  PENDING = "pending",
  RESOLVED = "resolved",
  CLOSED = "closed",
  ON_HOLD = "on_hold",
}

@Entity("ticket")
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  subject: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  content: string;

  @Column({
    type: "text",
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: string;

  @ManyToOne(() => Contact, (contact) => contact.tickets, { nullable: true })
  @JoinColumn({ name: "contact_id" })
  contact: Contact;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
