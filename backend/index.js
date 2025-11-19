import pkg from 'apollo-server';
const { ApolloServer } = pkg;

import { PubSub } from 'graphql-subscriptions';


import mongoose from 'mongoose';
import dotenv from 'dotenv';

import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers/index.js';

dotenv.config();

const pubsub = new PubSub();

const PORT = process.env.PORT || 5000;

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub }),
    introspection: true,
    playground: true,
    cors: {
        origin: process.env.CLIENT_URL || '*',
        credentials: true
    }
});

mongoose
    .connect(process.env.MONGODB)
    .then(() => {
        console.log('✅ MongoDB Connected');
        return server.listen({ port: PORT });
    })
    .then(res => {
        console.log(`🚀 Server running at ${res.url}`);
    })
    .catch(err => {
        console.error('❌ Error:', err);
    });