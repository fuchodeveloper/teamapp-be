import { generate } from 'shortid';
import { AuthenticationError } from 'apollo-server';

import { TeamLeadInterface } from 'src/interfaces/teamLead';
import { TeamUsersInterface } from 'src/interfaces/teamUsers';
import { ITeamUser } from 'src/models/TeamUser';

export default {
  // field level resolvers
  Team: {
    lead: async (
      team: { uniqueId: String; creator: String },
      __: object,
      { models: { TeamLead } }: { models: any },
    ) => {
      // type team gets resolved before lead
      
      const teamLead = await TeamLead.findOne({ teamUniqueId: team.uniqueId, creator: team.creator });
      return teamLead;
    },
    members: async ({ id }: { id: string }, __: object, { models: { TeamUser } }: any) => {
      // check if member is regular or temp, then determine which db to query
      return await TeamUser.find({ team: id });
    },
  },

  // resolver queries
  Query: {
    team: async (parent: object, args: { id: string }, { models: { Team }, authUser }: any, info: object) => {
      return await Team.findOne({ uniqueId: args.id });
    },
    getTeamLead: async (
      _: object,
      { input: { id, creator } }: TeamLeadInterface,
      { models: { TeamLead } }: { models: any },
    ) => {
      
      const teamLead =  await TeamLead.findOne({ _id: id, creator });
      return teamLead;
    },
  },

  // resolver mutations
  Mutation: {
    createTeam: async (_: any, { team: { name, duties, creator } }: any, { models: { Team }, authUser }: any) => {
      if (!authUser) {
        throw new AuthenticationError('You are not authenticated');
      }

      const requestBody = {
        name,
        uniqueId: generate(),
        duties,
        creator,
      };
      const team = new Team(requestBody);
      await team.save();
      return team;
    },

    createTeamLead: async (
      _: object,
      { input: { teamUniqueId, creator, start, stop } }: TeamLeadInterface,
      { models: { TeamLead }, authUser }: any,
    ) => {
      if (!authUser) {
        throw new AuthenticationError('You are not authenticated');
      }
      const requestBody = {
        teamUniqueId,
        creator,
        start,
        stop,
      };

      const teamLead = new TeamLead(requestBody);
      await teamLead.save();
      return teamLead;
    },

    updateTeamLead: async (
      _: object,
      { input: { id, teamUniqueId, creator, start, stop } }: TeamLeadInterface,
      { models: { TeamLead }, authUser }: { models: any; authUser: object },
    ) => {
      // updates team lead manually or auto-triggered by date stop event
      if (!authUser) {
        throw new AuthenticationError('You are not authenticated');
      }
      return await TeamLead.findOneAndUpdate({ _id: id, teamUniqueId, creator }, { start, stop }, { new: true });
    },

    createTeamUsers: async (
      _: object,
      { input }: { input: Array<TeamUsersInterface> },
      { models: { TeamUser }, authUser }: { models: { TeamUser: ITeamUser }; authUser: object },
    ) => {
      if (!authUser) {
        throw new AuthenticationError('You are not authenticated');
      }

      return await TeamUser.insertMany(input);
    },
  },
};
