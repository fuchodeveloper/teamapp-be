import { gql } from 'apollo-server';

export default gql`
  type Cat {
    id: ID!
    name: String!
  }

  type Team {
    id: ID!
    name: String!
  }

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    userName: String
    team: String
    role: String
  }

  input UserInput {
    firstName: String!
    lastName: String!
    userName: String
    team: String
    role: String
  }

  type Query {
    hello: String!
    cat: [Cat!]!
    team(id: ID!): Team
  }

  type Mutation {
    createCat(name: String!): Cat!
    createTeamMembers(name: String!, lead: String, members: UserInput): [Team]
    createTeam(name: String!): Team!
  }
`;
