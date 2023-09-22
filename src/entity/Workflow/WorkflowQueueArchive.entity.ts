import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { WorkFlowQueue } from "./WorkflowQueue.entity";

@Entity("workflow_queue_archive")
export class WorkflowQueueArchive {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("json", { name: "queue_data" })
  queueData: WorkFlowQueue;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
