import express, {Request, Response} from 'express'
import cors from 'cors'
import { PORT } from '../config/env'
import { errorHandler } from '../middlewares/errorHandler'
import postsRouter from '../routes/posts'

const app = express();

app.use(cors())
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send({message: 'API is running lol'});
})

app.use('/posts', postsRouter);

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server working at http://localhost:${PORT}`)
});