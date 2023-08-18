export interface TagRetrieveParams {
  identfier: string;
}

export interface TagCreateParams {
  name: string;
  contact?: string;
}

export interface TagUpdateParams {
  contact?: string;
  name?: string;
}

export interface TagDeleteParams {}

export interface TagListParams {}

export interface TagAssignParams {
  contactId: string;
  tagName: string;
}

export interface TagRemoveParams {
  contactId: string;
  tagName: string;
}
