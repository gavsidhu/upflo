import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { EmailEvent } from "../../../types/Workflow";

@Entity("workflows")
export class Workflow {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column()
  description: string;

  @Column("text")
  emailEvents: EmailEvent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
