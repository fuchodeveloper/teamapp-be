import { ObjectID } from 'mongodb';

export interface TeamLeadInterface {
  input: TeamLead;
}

interface TeamLead {
  id: string;
  teamUniqueId: String;
  creator: ObjectID;
  start: String;
  stop: String;
  userId: String;
}
