import { gql } from 'apollo-server';

export default gql`
  type Team {
    id: ID!
    name: String!
    uniqueId: String
    duties: String
    lead: TeamLead
    creator: String
    members: [TeamUsers]
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

  type TeamUsers {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    team: String!
  }

  type TeamLead {
    id: ID!
    teamUniqueId: String!
    creator: String!
    start: String!
    stop: String
  }

  type Token {
    token: String!
  }

  input UserInput {
    firstName: String!
    lastName: String!
    password: String!
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

  input CreateTeamUsersInput {
    firstName: String!
    lastName: String!
    email: String!
    team: String!
  }

  type Query {
    team(id: ID!): Team
    getTeamLead(input: GetTeamLeadInput!): TeamLead!
    lead: TeamLead!
    user(id: ID!): User!
    login(email: String!, password: String!): Token!
    members: [TeamUsers]
  }

  type Mutation {
    createUsers(users: [UserInput]): [User]!
    createTeam(team: CreateTeamInput): Team!
    createTeamLead(input: CreateTeamLeadInput!): TeamLead!
    updateTeamLead(input: UpdateTeamLeadInput!): TeamLead!
    createTeamUsers(input: [CreateTeamUsersInput]): [TeamUsers]
  }
`;
