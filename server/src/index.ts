import express, {NextFunction, Request, Response} from 'express'
import cors from 'cors'
import { errorHandler } from '../middlewares/errorHandler'
import { PORT } from '../config/env'
import {initDb} from "../db/db";

import postsRouter from '../routes/posts'
import collectionsRouter from '../routes/collections'

const app = express();

app.use(cors())
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send({message: 'API is running lol'});
})

app.use('/posts', postsRouter);
app.use('/collections', collectionsRouter);

app.use(errorHandler)


async function run() {
  await initDb();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server working at http://localhost:${PORT}`)
  });
}

run()