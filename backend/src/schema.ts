import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import path from "path";

// Load schema from .graphql file
export const typeDefs = loadSchemaSync(path.join(__dirname, "schema.graphql"), {
  loaders: [new GraphQLFileLoader()],
});

// Mock data for demonstration
const mockCreditSummary = {
  totalCredit: 10000.0,
  availableCredit: 7500.0,
  usedCredit: 2500.0,
  creditLimit: 10000.0,
  lastUpdated: new Date().toISOString(),
};

export const resolvers = {
  Query: {
    creditSummary: () => mockCreditSummary,
  },
};
