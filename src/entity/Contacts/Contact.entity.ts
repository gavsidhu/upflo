import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Note } from "./Note.entity";
import { Tag } from "./Tag.entity";
import { Ticket } from "../HelpDesk/Ticket.entity";
import { List } from "./List.entity";
import { EmailEvents } from "../Workflow/EmailEvents.entity";

@Entity()
export class Contact {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ type: "json", nullable: true })
  customAttributes: any;

  @Column({ nullable: true })
  leadSource: string;

  @Column({ nullable: true })
  leadStatus: string;

  @OneToMany(() => Note, (note) => note.contact)
  notes: Note[];

  @OneToMany(() => Ticket, (ticket) => ticket.contact)
  tickets: Ticket[];

  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Tag[];

  @ManyToMany(() => List)
  @JoinTable()
  lists: List[];

  @OneToMany(() => EmailEvents, (event) => event.contact)
  emailEvents: EmailEvents[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
