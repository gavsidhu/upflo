import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Contact } from "./Contact.entity";

@Entity()
export class Tag {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @ManyToMany(() => Contact, (contact) => contact.tags)
  contacts: Contact[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
