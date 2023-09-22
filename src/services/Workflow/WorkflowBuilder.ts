import { EmailEvent, WorkflowConfig } from "../../../types/Workflow";

export default class WorkflowBuilder {
  private workflow: WorkflowConfig;
  constructor() {
    this.workflow = {
      name: "",
      description: "",
      emailEvents: [],
    };
  }

  setName(name: string): WorkflowBuilder {
    this.workflow.name = name;
    return this;
  }

  setDescription(description: string): WorkflowBuilder {
    this.workflow.description = description;
    return this;
  }

  addEmailEvent(action: EmailEvent): WorkflowBuilder {
    this.workflow.emailEvents.push(action);
    return this;
  }

  build(): WorkflowConfig {
    if (!this.workflow.name || this.workflow.emailEvents.length === 0) {
      throw new Error("Incomplete Workflow Configuration");
    }
    return this.workflow;
  }
}
