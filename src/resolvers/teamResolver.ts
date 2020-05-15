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
    user: async ({ userId }: { userId: string }, args: any, { models: { User, TeamUser } }: { models: any }) => {
      // return user assigned as team lead

      const user = await User.findOne({ _id: userId });
      const teamUser = await TeamUser.findOne({ _id: userId });

      return user || teamUser;
    },
    duties: async (
      { teamUniqueId, creator }: { teamUniqueId: string; creator: string },
      args: any,
      { models: { Team } }: { models: any },
    ) => {
      try {
        // return duties assigned to team lead
        const response = await Team.findOne({ uniqueId: teamUniqueId, creator });
        const { duties } = response || {};

        return duties;
      } catch (error) {
        return new ApolloError('An unexpected error occurred. Try again!');
      }
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
    /**
     * Get the team lead for a team
     * Hydrate return value with data from different models
     */
    getTeamLead: async (
      _: object,
      { input: { teamUniqueId, creator } }: TeamLeadInterface,
      { models: { TeamLead } }: { models: any },
    ) => {
      try {
        const teamLead = await TeamLead.findOne({ teamUniqueId, creator });

        return teamLead;
      } catch (error) {
        return new ApolloError('An unexpected error occurred. Try again!');
      }
    },

    /**
     * Get all other teams a user belongs to
     */
    otherTeams: async (
      _: object,
      { firstName, email }: any,
      { models: { TeamUser } }: { models: { TeamUser: any } },
    ) => {

      try {
        const teamUsers = await TeamUser.find({ firstName, email });
        return teamUsers;
      } catch (error) {}
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
        return new ApolloError('An unexpected error occurred. Try again!');
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

    /**
     * Create or update the team lead for a given team
     * also update the `duties` for given team if required
     */
    createOrUpdateTeamLead: async (
      _: object,
      { input: { teamUniqueId, creator, start, stop, userId, duties } }: TeamLeadInterface,
      { models: { TeamLead, Team }, authUser }: any,
    ) => {
      if (!authUser) {
        throw new AuthenticationError('You are not authenticated');
      }
      let newDuties = '';

      const requestBody = {
        teamUniqueId,
        creator,
        start,
        stop,
        userId,
      };

      if (duties) {
        const response = await Team.findOne({ uniqueId: teamUniqueId, creator });
        response.duties = duties;
        const updatedDuties = await response.save();
        newDuties = updatedDuties?.duties;
      }

      /*
       update the team lead for a given team
       or create a new team lead if none exists
      */
      const existingTeamLead = await TeamLead.findOne({ teamUniqueId, creator });

      if (existingTeamLead) {
        existingTeamLead.start = start;
        existingTeamLead.stop = stop;
        existingTeamLead.userId = userId;

        const updatedTeamLead = await existingTeamLead.save();

        return updatedTeamLead;
      }

      const teamLead = new TeamLead(requestBody);
      const newTeamLead = await teamLead.save();

      return newTeamLead;
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

    /**
     * Team creator can delete their team
     * also delete users associated with the team, and teamlead if any
     */
    deleteTeam: async (
      parent: any,
      { uniqueId, creator }: { uniqueId: string; creator: string },
      { models: { Team, TeamUser, TeamLead, User }, authUser }: any,
    ) => {
      if (!authUser) {
        throw new AuthenticationError('You are not authenticated');
      }

      try {
        const deleteTeamResponse = await Team.deleteOne({ uniqueId, creator });
        /**
         * Delete team from related models
         */
        if (deleteTeamResponse.ok && deleteTeamResponse.deletedCount) {
          // find user and remove their team
          const user = await User.findOne({
            _id: creator,
            team: uniqueId,
          });

          user.team = '';

          await user.save();
          await TeamLead.deleteOne({
            teamUniqueId: uniqueId,
            creator,
          });

          await TeamUser.deleteMany({
            teamUniqueId: uniqueId,
          });

          return { success: true };
        }
      } catch (error) {
        return new ApolloError('An unexpected error occurred. Try again!');
      }
    },
  },
};
