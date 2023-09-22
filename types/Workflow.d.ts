export interface EmailEvent {
  sendDelay: number;
  subject: string;
  body: string;
  sendFrom: string;
}

export interface WorkflowConfig {
  name: string;
  description: string;
  emailEvents: EmailEvent[];
}
