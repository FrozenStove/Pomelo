import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./schema";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start the server
async function startServer() {
  await server.start();

  // Apply Apollo middleware
  app.use("/graphql", expressMiddleware(server));

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
