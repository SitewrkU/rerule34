import express, {Request, Response, NextFunction} from 'express'
import rateLimit from 'express-rate-limit';
import { getDuration, durationCache, isVideoUrl } from '../utils/getPostDuration';
import {autocompleteTags} from "../services/rule34";
import {callApi, getComments} from "../services/rule34";
const router = express.Router();

// Лімітер для запитів на r34. Жорстко: 60
const ApiLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// Для отримання довжини відео
const durationLimiter = rateLimit({
  windowMs: 60_000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});


router.get('/', ApiLimiter ,async (req: Request, res: Response, next) => {
  try {
    const params = req.query;
    const data = await callApi(params);

    const finalData = data.map((post: any) => ({
      ...post,
      duration: isVideoUrl(post.file_url)
        ? (durationCache.get(String(post.id))?.duration ?? null)
        : null,
    }));

    res.status(200).json(finalData);
  } catch (e) {
    next(e);
  }
})


router.get('/:id/duration', durationLimiter, async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { file_url } = req.query;

  if (typeof file_url !== 'string' || !isVideoUrl(file_url)) {
    return res.status(200).json({ duration: null });
  }

  const duration = await getDuration(id, file_url);
  res.status(200).json({ duration });
});



router.get('/:id/comments', ApiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const comments = await getComments(id);
    res.status(200).json(comments);
  } catch (e) {
    next(e);
  }
});


router.get('/tags/autocomplete', ApiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    if (typeof q !== 'string' || !q) {
      return res.status(400).json({ error: 'query param "q" is required' });
    }
    const results = await autocompleteTags(q);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

export default router;