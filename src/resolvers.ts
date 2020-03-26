import { generate } from 'shortid';

import { Team } from "./models/Team";
import { TeamLead } from "./models/TeamLead";
import { User } from './models/User';
import { UserInterface } from './interfaces/user';
import { TeamInterface } from './interfaces/team';
import { TeamLeadInterface } from './interfaces/teamLead';

export default {
  Query: {
    team: (parent: object, args: { id: String }, context: object, info: object) => Team.findOne({ uniqueId: args.id }),
    getTeamLead: (_: object, { input: { id, creator } }: TeamLeadInterface ) => {
      return TeamLead.findOne({ _id: id, creator })
    }
  },

  Mutation: {
    createTeam: async (_: any, { team: { name, duties, creator } }: TeamInterface) => {
      const requestBody = {
        name,
        uniqueId: generate(),
        duties,
        creator
      };
      const team = new Team(requestBody);
      await team.save();
      return team;
    },

    createTeamLead: async (_: any, { input: { teamUniqueId, creator, start, stop } } : TeamLeadInterface) => {
      const requestBody = {
        teamUniqueId,
        creator, 
        start, 
        stop,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const teamLead = new TeamLead(requestBody);
      await teamLead.save();
      return teamLead;
    },

    updateTeamLead: async () => {
      // updates team lead manually or auto-triggered by date stop event
      
    },

    createUsers: async (_: any, args: { users: Array<UserInterface> } ) => {
      // Hyderate request body with modified data to generate username
      const modifiedRequestBody = args.users.map((user: UserInterface) => ({
        firstName: user.firstName,
        lastName: user.lastName,
        username: `${user.firstName.slice(0, 1)}${user.lastName}`,
        team: user.team,
        role: user.role,
        email: user.email
      }));
      const user = await User.insertMany(modifiedRequestBody);
      return user;
    }
  }
};
