export interface ListRetrieveParams {
  listId: string;
}

export interface ListCreateParams {
  name: string;
  description: string;
}

export interface ListUpdateParams {
  name?: string;
  description?: string;
}

export interface ListDeleteParams {}

export interface ListListParams {}

export interface ListAddContactParams {
  contactId: string;
  listId: string;
}

export interface ListRemoveContactParams {
  contactId: string;
  listId: string;
}
