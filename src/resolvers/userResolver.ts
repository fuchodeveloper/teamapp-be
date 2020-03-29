import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server';

import { UserInterface } from 'src/interfaces/user';
import { environment } from 'src/environment';

export default {
  Query: {
    user: async (parent: any, { id }: { id: string }, { models: { User }, authUser }: any) => {
      if (!authUser) {
        throw new AuthenticationError('You are not authenticated');
      }
      const user = await User.findOne({ _id: id });
      return user;
    },
    login: async (_: any, { email, password }: { email: String; password: String }, { models: { User } }: any) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }
      const matchPasswords = bcrypt.compareSync(password, user.password);
      if (!matchPasswords) {
        throw new AuthenticationError('Invalid credentials');
      }
      const token = jwt.sign({ id: user.id }, environment.authKey, { expiresIn: '7d' });
      return {
        token,
      };
    },
  },

  Mutation: {
    createUsers: async (_: object, args: { users: Array<UserInterface> }, { models: { User } }: any) => {
      // Hydrate request body with modified data to generate username
      const modifiedRequestBody = args.users.map((user: UserInterface) => {
        const hashedPassword = bcrypt.hashSync(user.password, 12);
        return {
          firstName: user.firstName,
          lastName: user.lastName,
          username: `${user.firstName.slice(0, 1)}${user.lastName}`,
          password: hashedPassword,
          team: user.team,
          role: user.role,
          email: user.email,
        };
      });

      return await User.insertMany(modifiedRequestBody);
    },
  },
};
