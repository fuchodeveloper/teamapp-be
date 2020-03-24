import { gql } from 'apollo-server';

export default gql`
  type Team {
    id: ID!
    name: String!
    uniqueId: String
    duties: String
    lead: String
    creator: String
  }

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    username: String
    team: String
    role: String
    email: String
  }

  type TeamLead {
    teamUniqueId: String!
    creator: String!
    start: String!
    stop: String
  }

  input UserInput {
    firstName: String!
    lastName: String!
    username: String
    team: String
    role: String
    email: String
  }

  input CreateTeamInput {
    name: String!
    duties: String
    lead: String
    creator: String!
  }

  input CreateTeamLeadInput {
    teamUniqueId: String!
    creator: String!
    start: String!
    stop: String
  }

  type Query {
    team(id: ID!): Team
  }

  type Mutation {
    createCat(name: String!): Cat!
    createUsers(users: [UserInput]): [User]
    createTeam(team: CreateTeamInput): Team!
    createTeamLead(teamLead: CreateTeamLeadInput!): TeamLead!
  }
`;
