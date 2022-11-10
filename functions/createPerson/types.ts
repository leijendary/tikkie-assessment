export type Person = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: Address;
}

export type Address = {
  street: string;
  houseNumber: string;
  postCode: string;
  city: string;
  country: string;
}

export type Errors = {
  [key: string]: string
}