import express, { Request, Response, NextFunction } from 'express';
import * as collectionsRepo from '../repositories/collections.repository'

const router = express.Router();

//Отримати всі колекції --
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const collections = await collectionsRepo.getCollections();
    res.json({ collections });
  } catch (e) {
    next(e);
  }
});

//Створити колекцію
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'name is required' });
    }
    const collection = await collectionsRepo.createCollection(name);
    res.status(201).json({ collection });
  } catch (e) {
    next(e);
  }
});

//Відправити пост в дефолтну колекцію (Збережене) --
router.post('/default/posts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, sample_url, file_url, video_duration } = req.body;
    if (!id || !sample_url || !file_url) {
      return res.status(400).json({ error: 'id, sample_url and file_url are required' });
    }

    const def = await collectionsRepo.getDefaultCollection();
    const updated = await collectionsRepo.addPostToCollection(def.id, { id, sample_url, file_url, video_duration });
    res.json({ updated });
  } catch (e) {
    next(e);
  }
});

//Відправка поста в колекцію(за id, id саме колекції передається)
router.post('/:id/posts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, sample_url, file_url, video_duration } = req.body;
    if (!id || !sample_url || !file_url) {
      return res.status(400).json({ error: 'id, sample_url and file_url are required' });
    }

    const collectionId = String(req.params.id);
    const collection = await collectionsRepo.addPostToCollection(collectionId, { id, sample_url, file_url, video_duration });
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json({ collection });
  } catch (e) {
    next(e);
  }
});


//Видалити з колекції(за id), пост (за postId) --
router.delete('/:id/posts/:postId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const postId = String(req.params.postId);
    const collection = await collectionsRepo.removePostFromCollection(id, postId);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json({ collection });
  } catch (e) {
    next(e);
  }
});

// Видалити колекцію
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const deleted = await collectionsRepo.deleteCollection(id);
    if (!deleted) return res.status(404).json({ error: 'Collection not found' });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;