/* eslint-disable no-console */
import express from 'express'
import http from 'http';
import swaggerUi from 'swagger-ui-express'
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { print } from 'graphql'
import { loadSchemaSync } from '@graphql-tools/load'
import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { openapiSpecification } from './swaggerDocOptions'
import path from 'path';
import { mainRouter } from './routes'
import cors from 'cors'

const app = express()
const port = process.env.PORT || 3000
const hostUrl = process.env.HOST_URL || `http://localhost:${port}`

// Enable CORS for all origins
app.use(cors())

app.use(mainRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

const loadedTypeDefs = loadSchemaSync(path.join(__dirname, './**/*.graphql'), { loaders: [new GraphQLFileLoader()] })
const loadedResolvers = loadFilesSync(path.join(__dirname, './**/*.resolver.{ts,js}'))

const typeDefs = mergeTypeDefs(loadedTypeDefs)

if (process.env.NODE_ENV === 'development') {
    console.log('\n=== GraphQL Schema Start ===\n')
    const printedTypeDefs = print(typeDefs)
    console.log(printedTypeDefs)
    console.log('\n=== GraphQL Schema End ===\n')
}

const resolvers = mergeResolvers(loadedResolvers)

const httpServer = http.createServer(app);

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// For Vercel deployment
if (process.env.NODE_ENV === 'production') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
} else {
    // For local development
    server.start().then(() => {
        server.applyMiddleware({ app });
        httpServer.listen(port, () => {
            console.log(`NseIndia App started in port ${port}`);
            console.log(`For API docs: ${hostUrl}/api-docs`);
            console.log(`Open ${hostUrl} in browser.`);
            console.log(`For graphql: ${hostUrl}${server.graphqlPath}`);
        });
    });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
