import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { loadFilesSync } from "@graphql-tools/load-files";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers } from "./resolvers/resolvers";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load GraphQL schema from file
const typeDefs = loadFilesSync(path.join(__dirname, "graphql"), {
  extensions: ["graphql"],
});

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create Apollo Server
const server = new ApolloServer({
  schema,
});

// Start the server
async function startServer() {
  await server.start();

  // Apply Apollo middleware
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        // You can add context here if needed
        return {};
      },
    })
  );

  // Basic health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(
      `GraphQL endpoint available at http://localhost:${port}/graphql`
    );
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
