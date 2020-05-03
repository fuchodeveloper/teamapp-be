import { gql } from 'apollo-server';

export default gql`
  type Team {
    id: ID!
    name: String!
    uniqueId: String
    duties: String
    teamLead: TeamLeadDetails
    creator: ID!
    members: [TeamUsers]
    team: String
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
    teamUniqueId: String!
  }

  type TeamLead {
    id: ID!
    teamUniqueId: String!
    creator: ID!
    start: String!
    stop: String
    userId: String
    user: User
    duties: String
  }

  type TeamLeadDetails {
    lead: TeamLead
    user: TeamUsers
  }

  type LoginData {
    id: ID!
    firstName: String
    lastName: String
    team: String
  }

  type authData {
    success: Boolean!
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
    creator: String!
  }

  input UpdateTeamInput {
    name: String!
    duties: String
    teamLead: String
    creator: String!
    members: [UpdateTeamUsersInput]
  }

  input TeamLeadInput {
    teamUniqueId: String!
    creator: String!
    start: String!
    stop: String
    userId: String!
  }

  input CreateOrUpdateTeamLeadInput {
    teamUniqueId: String!
    creator: String!
    start: String!
    stop: String
    userId: String!
    duties: String!
  }

  input UpdateTeamLeadInput {
    teamUniqueId: String!
    creator: String!
    start: String!
    stop: String
    userId: String!
  }

  input GetTeamLeadInput {
    teamUniqueId: String!
    creator: String
  }

  input CreateTeamUsersInput {
    firstName: String!
    lastName: String!
    email: String!
    teamUniqueId: String!
  }

  input UpdateTeamUsersInput {
    firstName: String!
    lastName: String!
    email: String!
    teamUniqueId: String!
  }

  type Query {
    team(id: ID!, uniqueId: String!): Team
    getTeamLead(input: GetTeamLeadInput!): TeamLead
    teamLead: TeamLead!
    user(id: ID!): User!
    login(email: String!, password: String!): LoginData!
    members: [TeamUsers]
    userId: TeamUsers
  }

  type Mutation {
    createUsers(users: [UserInput]): [User]!
    createTeam(team: CreateTeamInput): Team!
    updateTeam(team: UpdateTeamInput): Team!
    createOrUpdateTeamLead(input: CreateOrUpdateTeamLeadInput!): TeamLead!
    updateTeamLead(input: UpdateTeamLeadInput!): TeamLead!
    createTeamUsers(input: [CreateTeamUsersInput]): [TeamUsers]
    logout: authData!
  }
`;
