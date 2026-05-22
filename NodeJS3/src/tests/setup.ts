import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UserModel } from '../models/user.model';
import { CategoryModel } from '../models/category.model';

let mongoServer: MongoMemoryServer;

export const connectTestDB = async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    await Promise.all([UserModel.init(), CategoryModel.init()]);
};

export const closeTestDB = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
};

export const clearTestDB = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
};