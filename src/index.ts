import { ApolloServer, AuthenticationError } from 'apollo-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import { Team } from 'src/models/Team';
import { TeamLead } from 'src/models/TeamLead';
import { User } from 'src/models/User';
import { TeamUser } from 'src/models/TeamUser';

import resolvers from 'src/resolvers/index';
import typeDefs from './typeDef';
import { environment } from './environment';

const getAuthUser = async (req: any) => {
  const token = req.headers['token'] || '';

  if (token) {
    try {
      return jwt.verify(token, environment.authKey);
    } catch (e) {
      throw new AuthenticationError('Your session expired. Sign in again.');
    }
  }
};

const startServer = async () => {
  const server = new ApolloServer({
    resolvers,
    typeDefs,
    introspection: environment.apollo.introspection,
    playground: environment.apollo.playground,
    context: async ({ req }) => {
      if (req) {
        const authUser = await getAuthUser(req);

        return {
          authUser,
          models: {
            Team,
            TeamLead,
            User,
            TeamUser,
          },
        };
      }
    },
  });

  await mongoose.connect(environment.database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  server.listen(environment.port).then(({ url }) => console.log(`server ready at ${url}`));

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => server.stop());
  }
};

startServer();
