interface Users {
  id: String;
  firstName: String
  lastName: String
  userName: String
  team: String
  role: String
}

export interface Team  {
  id: String;
  name: String;
  lead?: String;
}
