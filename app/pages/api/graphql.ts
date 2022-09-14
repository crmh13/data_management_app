import { ApolloServer, gql } from "apollo-server-micro";
import type { NextApiRequest, NextApiResponse } from "next";
import { management_data, PrismaClient } from "@prisma/client";
import { GraphQLScalarType, Kind } from "graphql";

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value: any) {
    return value.getTime(); // Convert outgoing Date to integer for JSON
  },
  parseValue(value: any) {
    return new Date(value); // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
    }
    return null; // Invalid hard-coded value (not an integer)
  },
});

const prisma = new PrismaClient();

const typeDefs = gql`
  scalar Date
 
  type Type {
    id: Int!
    type_name: String!
    management: [ManagementData]
  }

  type ManagementData {
    id: Int!
    type_id: Int!
    data_name: String!
    current_num: Int!
    data_history: [DataHistory]
  }

  type DataHistory {
    id: Int!
    management_id: Int!
    change_num: Int!
    change_reason: String!
    comment: String
    change_date: Date
  }

  type Query {
    types: [Type]
    managementData(type_id: Int!): [ManagementData]
  }

  type Mutation {
    createType(type_name: String!): Type
    createData(management_data: DataInput!): ManagementData
  }

  input DataInput {
    type_id: Int!
    data_name: String!
  }
`;

interface Context {
  prisma: PrismaClient;
}

const resolvers = {
  Date: dateScalar,
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
    },
    managementData: async (parent: undefined, args: {type_id: number}, context: Context) => {
      return await context.prisma.management_data.findMany({
        where: {
          AND: [
            {
              type_id: args.type_id,
            },
            {
              delete_flg: false
            }
          ]
        },
        include: {
          data_history: true,
        }
      })
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
    },
    createData: async (parent: undefined, args: {management_data: management_data}, context: Context) => {
      return await context.prisma.management_data.create({
        data: {
          type_id: args.management_data.type_id,
          data_name: args.management_data.data_name,
          delete_flg: false,
          current_num: 0,
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
