import { ApolloServer, gql } from "apollo-server-micro";
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const typeDefs = gql`
  type Type {
    id: ID!
    type_name: String!
    management: [ManagementData]
  }

  type ManagementData {
    id: ID!
    type_id: ID!
    data_name: String!
    current_num: Int!
    data_history: [DataHistory]
  }

  type DataHistory {
    id: ID!
    management_id: ID!
    change_num: Int!
    change_reason: String!
    comment: String
    change_date: String!
  }

  type Query {
    types: [Type]
  }

  type Mutation {
    createType(type_name: String!): Type
  }

  input TypeInput {
    type_name: String!
  }
`;

interface Context {
  prisma: PrismaClient;
}

const resolvers = {
  Query: {
    types: async (parent: undefined, args: {}, context: Context) => {
      return await context.prisma.type_mst.findMany({
        where: { delete_flg: false },
        select: {
          id: true,
          type_name: true,
          management: {
            where: { delete_flg: false }
          }
        }
      });
    }
  },
  Mutation: {
    createType: async (parent: undefined, args: {type_name: string}, context: Context) => {
      return await context.prisma.type_mst.create({
        data: {
          type_name: args.type_name,
          delete_flg: false,
        }
      })
    }
  }
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: {
    prisma,
  },
});

const startServer = apolloServer.start();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://studio.apollographql.com'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  if (req.method === 'OPTIONS') {
    res.end();
    return false;
  }

  await startServer;
  await apolloServer.createHandler({
    path: '/api/graphql',
  })(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
