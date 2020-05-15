import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import Iron from '@hapi/iron';

import { Team } from 'src/models/Team';
import { TeamLead } from 'src/models/TeamLead';
import { User } from 'src/models/User';
import { TeamUser } from 'src/models/TeamUser';

import resolvers from 'src/resolvers/index';
import typeDefs from './typeDef';
import { environment } from './environment';

const getAuthUser = async (req: any) => {
  const token = req?.cookies?.token || '';
  const tokenPassword = process.env.TOKEN_PASSWORD || '';

  if (token) {
    try {
      const unsealedToken = await Iron.unseal(token, tokenPassword, Iron.defaults);
      return jwt.verify(unsealedToken, environment.authKey);
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
    context: async ({ req, res }) => {
      // console.log('req', req, 'res', res);
      
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
          req,
          res,
        };
      }
    },
  });

  const corsConfig =
    process.env.NODE_ENV === 'production'
      ? {
          origin: 'https://teamapp-fe.now.sh',
          credentials: true,
          exposedHeaders: ['Set-Cookie']
        }
      : {
          origin: 'http://localhost:3000',
          credentials: true,
        };

  const appurl = process.env.NODE_ENV === 'production' ? 'https://teamapp-fe.now.sh' : 'http://localhost:3000';
  const app = express();
  const corsOptions = {
    origin: 'https://teamapp-fe.now.sh',
    credentials: true,
  };

  app.options(appurl, cors(corsConfig)); // include before other routes
  // app.options('https://teamapp-fe.now.sh', cors(corsOptions)); // include before other routes
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
    res.header('Access-Control-Allow-Origin', 'https://teamapp-fe.now.sh');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.use(cors(corsConfig));
  // app.use(cors(corsOptions));
  app.use(cookieParser());

  server.applyMiddleware({
    app,
    path: '/',
    cors: false,
  });

  await mongoose.connect(environment.database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  app.listen({ port: process.env.PORT || environment.port });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => server.stop());
  }
};

startServer();
