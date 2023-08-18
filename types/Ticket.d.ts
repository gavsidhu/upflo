export enum TicketStatus {
  OPEN = "open",
  PENDING = "pending",
  RESOLVED = "resolved",
  CLOSED = "closed",
  ON_HOLD = "on_hold",
}

export interface TicketRetrieveParams {}

export interface TicketCreateParams {
  subject: string;
  content: string;
  status: TicketStatus;
  contactId?: string;
}

export interface TicketUpdateParams {
  subject: string;
  content: string;
  status: TicketStatus;
}

export interface TicketDeleteParams {
  name: string;
  contact?: string;
}

export interface TicketListParams {
  status?: TicketStatus[];
}
