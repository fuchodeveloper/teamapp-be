export interface TeamInterface {
  team: Team
}

interface Team {
  name: String;
  lead?: String;
  uniqueId: String;
  duties?: String;
  creator: String;
};
