import { generate } from 'shortid';

import { Team } from './models/Team';
import { TeamLead } from './models/TeamLead';
import { User } from './models/User';
import { UserInterface } from './interfaces/user';
import { TeamInterface } from './interfaces/team';
import { TeamLeadInterface } from './interfaces/teamLead';

export default {
  // field level resolvers
  Team: {
    lead: async (team: { uniqueId: String; creator: String }, __: object) => {
      // type team gets resolved before lead
      const teamLead = await TeamLead.findOne({ teamUniqueId: team.uniqueId, creator: team.creator });
      return teamLead;
    },
  },

  // resolver queries
  Query: {
    team: async (parent: object, args: { id: any }, context: object, info: object) => {
      const team: any = await Team.findOne({ uniqueId: args.id });
      console.log('team', team);
      return team;
    },
    getTeamLead: (_: object, { input: { id, creator } }: TeamLeadInterface) => {
      return TeamLead.findOne({ _id: id, creator });
    },
  },

  // resolver mutations
  Mutation: {
    createTeam: async (_: any, { team: { name, duties, creator } }: TeamInterface) => {
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

    createTeamLead: async (_: object, { input: { teamUniqueId, creator, start, stop } }: TeamLeadInterface) => {
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

    updateTeamLead: async (_: object, { input: { id, teamUniqueId, creator, start, stop } }: TeamLeadInterface) => {
      // updates team lead manually or auto-triggered by date stop event
      return await TeamLead.findOneAndUpdate({ _id: id, teamUniqueId, creator }, { start, stop }, { new: true });
    },

    createUsers: async (_: any, args: { users: Array<UserInterface> }) => {
      // Hydrate request body with modified data to generate username
      const modifiedRequestBody = args.users.map((user: UserInterface) => ({
        firstName: user.firstName,
        lastName: user.lastName,
        username: `${user.firstName.slice(0, 1)}${user.lastName}`,
        team: user.team,
        role: user.role,
        email: user.email,
      }));
      const user = await User.insertMany(modifiedRequestBody);
      return user;
    },
  },
};
