import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
} from "typeorm";
import { Contact } from "./Contact.entity";

@Entity()
export class List {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: false, unique: true })
  description: string;

  @ManyToMany(() => Contact, (contact) => contact.lists)
  @JoinTable()
  contacts: Contact[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
