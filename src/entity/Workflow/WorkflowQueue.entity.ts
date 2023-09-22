import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { EmailEvents } from "./EmailEvents.entity";

@Entity("workflow_queue")
export class WorkFlowQueue {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("json")
  payload: EmailEvents;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// CREATE TABLE base_queue
// (
//    id           serial      NOT NULL,
//    status       integer     DEFAULT 0 NOT NULL,
//    try_count    integer        DEFAULT 0 NOT NULL,
//    max_tries    integer        DEFAULT 5 NOT NULL,
//    params       json,
//    create_time  timestamp   DEFAULT CURRENT_TIMESTAMP NOT NULL,
//    update_time  timestamp,
//    priority     integer     DEFAULT 0 NOT NULL
// )

// CREATE TABLE queue_table (
//     id int not null primary key generated always as identity,
//     queue_time	timestamptz default now(),
//     payload	text
// );
