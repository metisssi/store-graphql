import pkg from 'apollo-server-express';
const { ApolloServer } = pkg;

import { PubSub } from 'graphql-subscriptions';
import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pubsub = new PubSub();
const PORT = process.env.PORT || 5000;

// Создаем Express app
const app = express();
const httpServer = createServer(app);

// Создаем Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub }),
    introspection: true,
    plugins: [{
        async serverWillStart() {
            console.log('🚀 Apollo Server starting...');
        }
    }]
});

// Запускаем сервер
async function startServer() {
    await server.start();
    
    // Применяем GraphQL middleware
    server.applyMiddleware({ 
        app,
        path: '/graphql',
        cors: {
            origin: '*',
            credentials: true
        }
    });

    // 👇 ВАЖНО: Отдаем React build ТОЛЬКО в production
    if (process.env.NODE_ENV === 'production') {
        const clientBuildPath = path.join(__dirname, '../client/build');
        
        console.log('📁 Serving React from:', clientBuildPath); // 👈 Добавь для отладки
        
        // Отдаем статические файлы
        app.use(express.static(clientBuildPath));
        
        // Все остальные запросы (кроме /graphql) отправляем на React
        app.get('*', (req, res) => {
            res.sendFile(path.join(clientBuildPath, 'index.html'));
        });
    }

    // Подключаемся к MongoDB и запускаем сервер
    mongoose
        .connect(process.env.MONGODB)
        .then(() => {
            console.log('✅ MongoDB Connected');
            return httpServer.listen(PORT);
        })
        .then(() => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
        })
        .catch(err => {
            console.error('❌ Error:', err);
        });
}

startServer();