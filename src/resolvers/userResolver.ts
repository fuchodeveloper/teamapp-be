import { ApolloError, AuthenticationError } from 'apollo-server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { environment } from 'src/environment';
import { UserInterface } from 'src/interfaces/user';

export default {
  Query: {
    user: async (parent: any, { id }: { id: string }, { models: { User }, authUser }: any) => {
      if (!authUser) {
        throw new AuthenticationError('You are not authenticated');
      }
      const user = await User.findOne({ _id: id });
      return user;
    },
    login: async (_: any, { email, password }: { email: String; password: String }, { models: { User }, res }: any) => {
      let user;

      try {
        user = await User.findOne({ email });

        if (!user) {
          throw new ApolloError('User not found.', 'NO_USER');
        }

        if (user) {
          const matchPasswords = bcrypt.compareSync(password, user.password);
          if (!matchPasswords) {
            throw new AuthenticationError('Invalid credentials');
          }

          const generateToken = async (user: { id: string, email: string }) => {
            return jwt.sign({ id: user.id, email: user.email }, environment.authKey, { expiresIn: '7d' });
          };
          const token = await generateToken(user);

          let isProd = process.env.NODE_ENV === 'production' ? true : false;

          res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            // domain: '', // set by default on the browser
            sameSite: 'none',
          });

          return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            team: user?.team,
          };
        }
      } catch (error) {
        if (error?.extensions?.code === 'UNAUTHENTICATED') {
          return new ApolloError('Invalid credentials', 'INVALID_CREDENTIAL');
        }

        if (error?.extensions?.code === 'NO_USER') {
          return new ApolloError('User not found.', 'NO_USER');
        }

        return new ApolloError('An unexpected error occurred. Try again!', 'INTERNAL_SERVER_ERROR');
      }
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

      try {
        return await User.insertMany(modifiedRequestBody);
      } catch (error) {
        if (error.code === 11000) {
          return new ApolloError('Email already exists', 'DUPLICATE_EMAIL');
        }

        return new ApolloError('An unexpected error occurred. Try again!', 'SERVER_ERROR');
      }
    },
    logout: async (_: any, __: any, { res }: any) => {
      try {
        await res.clearCookie('token');
        return { success: true };
      } catch (error) {
        return new ApolloError('An unexpected error occurred. Try again!', 'INTERNAL_SERVER_ERROR');
      }
    },
  },
};
