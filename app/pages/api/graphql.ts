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
    change_date: Date!
  }

  type Query {
    types: [Type]
    managementData(type_id: Int!): [ManagementData]
    managementDataAtId(data_id: Int!): ManagementData
  }

  type Mutation {
    createType(type_name: String!): Type
    createData(management_data: DataInput!): ManagementData
    addHistory(data_history: HistoryInput!): DataHistory
  }

  input DataInput {
    type_id: Int!
    data_name: String!
  }

  input HistoryInput {
    management_id: Int!
    change_date: Date!
    change_num: Int!
    change_reason: String!
    comment: String
    current_num: Int!
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
        select: {
          id: true,
          type_id: true,
          data_name: true,
          current_num: true,
          data_history: {
            where: { delete_flg: false }
          }
        }
      })
    },
    managementDataAtId: async (parent: undefined, args: {data_id: number}, context: Context) => {
      return await context.prisma.management_data.findUnique({
        where: { id: args.data_id },
        select: {
          id: true,
          type_id: true,
          data_name: true,
          current_num: true,
          data_history: {
            orderBy:[{ change_date: 'desc' }],
            where: { delete_flg: false }
          }
        },
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
    },
    addHistory: async (parent: undefined, args: {data_history: any}, context: Context) => {
      await context.prisma.data_history.create({
        data: {
          management_id: args.data_history.management_id,
          change_num: args.data_history.change_num,
          change_reason: args.data_history.change_reason,
          change_date: args.data_history.change_date,
          comment: args.data_history.comment,
        }
      });
      await context.prisma.management_data.update({
        where: { id: args.data_history.management_id },
        data: { current_num: args.data_history.current_num }
      });
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
