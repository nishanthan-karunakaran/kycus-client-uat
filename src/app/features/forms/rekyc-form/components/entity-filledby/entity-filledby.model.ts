export interface EntityFilledBy {
  ausId: string;
  email?: string;
  type?: string;
}

export interface AusDropDownList {
  id: string;
  label: string;
  value: string;
  email: string;
}

export interface Aus {
  ausId: string;
  email: string;
  name: string;
}

export interface AusListDropDownResponse {
  status: string;
  message: string;
  data: {
    entityName: string;
    entityId: string;
    email: string;
    authorizedSignatories: Aus[];
  };
}
