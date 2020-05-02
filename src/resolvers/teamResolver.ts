import { ApolloError, AuthenticationError } from 'apollo-server';
import { generate } from 'shortid';
import { TeamLeadInterface } from 'src/interfaces/teamLead';
import { TeamUsersInterface } from 'src/interfaces/teamUsers';
import { ITeamUser } from 'src/models/TeamUser';

export default {
  // field level resolvers
  Team: {
    teamLead: async (
      team: { uniqueId: String; creator: String },
      __: object,
      { models: { TeamLead, TeamUser } }: { models: any },
    ) => {
      // type team gets resolved before lead
      // find team lead
      const teamLead = await TeamLead.findOne({ teamUniqueId: team.uniqueId, creator: team.creator });

      // find associated team user or registered user
      const user = await TeamUser.findOne({ _id: teamLead?.userId });

      return {
        lead: teamLead,
        user,
      };
    },
    members: async ({ uniqueId }: { uniqueId: string }, __: object, { models: { TeamUser } }: any) => {
      return await TeamUser.find({ teamUniqueId: uniqueId });
    },
  },

  TeamLead: {
    userId: async ({ id }: { id: string }, args: any, { models: { TeamUser } }: { models: any }) => {
      // return user assigned as team lead

      return await TeamUser.findOne({ _id: id });
    },
  },

  // resolver queries
  Query: {
    team: async (_parent: object, args: any, { models: { Team, TeamUser, User }, authUser }: any, info: object) => {
      if (!authUser) {
        throw new AuthenticationError('You are not authenticated');
      }

      try {
        // check if request is from team creator or user in the team

        // use id to get email from User
        const user = await User.findOne({ _id: args.id });

        // check if email is in TeamUser for that specific teamUniqueId
        const teamUser = await TeamUser.findOne({ $and: [{ email: user?.email }, { teamUniqueId: args?.uniqueId }] });

        // check if `uniqueId` and `creator` ids of the auth user match the team viewed
        // or Team:uniqueId and TeamUsers:teamUniqueId are equal for that team
        let uniqueIdResult = args?.uniqueId === teamUser?.teamUniqueId ? args?.uniqueId : '';
        const team = await Team.findOne({
          $or: [
            { $and: [{ uniqueId: args.uniqueId }, { creator: args.id }] },
            { $and: [{ uniqueId: uniqueIdResult }] },
          ],
        });

        return team;
      } catch (error) {
        return new ApolloError('An unexpected error occurred. Try again!');
      }
    },
    getTeamLead: async (
      _: object,
      { input: { id, creator } }: TeamLeadInterface,
      { models: { TeamLead } }: { models: any },
    ) => {
      const teamLead = await TeamLead.findOne({ _id: id, creator });
      return teamLead;
    },
  },

  // resolver mutations
  Mutation: {
    createTeam: async (_: any, { team: { name, duties, creator } }: any, { models: { Team, User }, authUser }: any) => {
      if (!authUser) {
        throw new AuthenticationError('You are not authenticated');
      }

      try {
        const requestBody = {
          name,
          uniqueId: generate(),
          duties,
          creator,
        };
        const teamRequest = new Team(requestBody);
        const teamData = await teamRequest.save();

        /**
         * update user team value
         */
        const updatedUser = await User.findOneAndUpdate({ _id: creator }, { team: teamData?.uniqueId }, { new: true });
        const updatedTeam = updatedUser?.team;

        teamData.team = updatedTeam;

        return teamData;
      } catch (error) {
        console.log('createTeam:error', error);
      }
    },

    updateTeam: async (
      _: any,
      { team: { id, name, duties, lead, creator, members } }: any,
      { models: { Team }, authUser }: any,
    ) => {
      if (!authUser) {
        throw new AuthenticationError('You are not authenticated');
      }

      const requestBody = {
        name,
        uniqueId: generate(), // TODO: double check if I should remove
        duties,
        creator,
      };
      const team = new Team(requestBody);
      await team.save();
      return team;
    },

    createTeamLead: async (
      _: object,
      { input: { teamUniqueId, creator, start, stop, userId } }: TeamLeadInterface,
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
        userId,
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

      /**
       * Before creating team user, run a background check to see if
       * any of the emails supplied exists, return error with the duplicate emails
       */
      const getEmails = async () => {
        const emailPromise: any = input.map(async (item: any) => {
          return await TeamUser.find().where({ email: item.email, teamUniqueId: item.teamUniqueId }).exec();
        });

        return Promise.all(emailPromise);
      };

      const res: Array<any> = await getEmails();
      const flattenArrs = res.flat();

      if (flattenArrs.length) {
        const emails = flattenArrs.map((i: { email: string }) => i.email);
        return new ApolloError('Duplicate user', 'DUPLICATE_USER', { emails });
      }

      try {
        const teamUsers = await TeamUser.insertMany(input);

        return teamUsers;
      } catch (error) {
        if (error?.code === 11000) {
          const existingEmail = error?.op?.email || '';
          return new ApolloError(`${existingEmail} exits in team`, 'DUPLICATE_USER', { email: existingEmail });
        }

        return new ApolloError('An unexpected error occurred. Try again!');
      }
    },
  },
};
