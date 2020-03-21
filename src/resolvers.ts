import { Cat } from "./models/Cat";
import { Team } from "./models/Team";

export default {
  Query: {
    hello: (): string => 'hey wassup mate',
    cat: () => Cat.find({}),
    team: (parent: object, args: { id: String; }, context: object, info: object) => Team.findOne({ id: "5e73055c8e2e730235522139" }),
  },

  Mutation: {
    createCat: async (_: any, { name }: { name: String }) => {
      const kitty = new Cat({ name });
      await kitty.save();
      return kitty;
    },

    createTeam: async (_: any, { name }: { name: String }) => {
      const team = new Team({ name });
      await team.save();
      return team;
    }
  }
};
