import { gql } from 'apollo-server';

export default gql`
  type Team {
    id: ID!
    name: String!
    uniqueId: String
    duties: String
    lead: TeamLead
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
    id: ID!
    teamUniqueId: String!
    creator: String!
    start: String!
    stop: String
    team: Team
    createdAt: String!
    updatedAt: String!
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

  input UpdateTeamLeadInput {
    id: ID!
    teamUniqueId: String!
    creator: String!
    start: String!
    stop: String
  }

  input GetTeamLeadInput {
    id: ID!
    creator: String
  }

  type Query {
    team(id: ID!): Team
    getTeamLead(input: GetTeamLeadInput!): TeamLead!
    lead: TeamLead!
  }

  type Mutation {
    createUsers(users: [UserInput]): [User]
    createTeam(team: CreateTeamInput): Team!
    createTeamLead(input: CreateTeamLeadInput!): TeamLead!
    updateTeamLead(input: UpdateTeamLeadInput!): TeamLead!
  }
`;
