import app  from "./app";
import dotenv from 'dotenv';
import { connectDB } from "./config/database";
import mongoose from "mongoose";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`http://localhost:${PORT}`);
        });

        const gracefulShutdown = async (signal: string) => {
            console.log(`\n...`);
            
            await mongoose.connection.close();
            console.log('Closed.');
            
            server.close(() => {
                console.log('Stoped.');
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('DB error:', error);
        process.exit(1); 
    }
}

startServer();