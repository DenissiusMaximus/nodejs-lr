import express, { Request, Response } from 'express';
import cors from 'cors'; 
import mongoose from 'mongoose';
import { createCategoryRouter } from './routes/category.routes';
import { errorHandler } from './middleware/errorHandler';
import { MongoCategoryRepository } from './storage/rerpositories/MongoCategoryRepository';
import { CategoryService } from './storage/services/CategoryService';

const app = express();

app.get('/health', (req: Request, res: Response) => {
	const state = mongoose.connection.readyState;
	if (state === 1) {
		res.status(200).json({ status: 'ok', mongoState: state });
	} else {
		res.status(503).json({ status: 'unavailable', mongoState: state });
	}
});

app.use(cors());
app.use(express.json());

export const repository = new MongoCategoryRepository();
export const service = new CategoryService(repository);    
export const categoryRouter = createCategoryRouter(service);

app.use('/categories', categoryRouter);

app.use(errorHandler);

export default app;
