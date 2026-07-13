import express, {Request, Response, NextFunction} from 'express'
import { getDuration, durationCache, isVideoUrl } from '../utils/getPostDuration';
import {autocompleteTags} from "../services/rule34";
import {callApi} from "../services/rule34";
const router = express.Router();



router.get('/', async (req: Request, res: Response) => {
  try {
    const params = req.query;
    const data = await callApi(params);

    const finalData = data.map((post: any) => ({
      ...post,
      duration: isVideoUrl(post.file_url) ? (durationCache.get(post.id) ?? null) : null,
    }));

    res.status(200).json({ data: finalData });
  } catch (e) {
    res.status(500).json({error: e});
    console.log(e)
  }
})


router.get('/:id/duration', async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { file_url } = req.query; // передаємо file_url з фронту, щоб не ходити повторно в rule34 api за постом

  if (typeof file_url !== 'string' || !isVideoUrl(file_url)) {
    return res.status(200).json({ duration: null });
  }

  if (durationCache.has(id)) {
    return res.status(200).json({ duration: durationCache.get(id) });
  }

  const duration = await getDuration(file_url);
  durationCache.set(id, duration);
  const currentDate = new Date();
  console.log(duration, currentDate);
  res.status(200).json({ duration });
});


router.get('/tags/autocomplete', async (req: Request, res: Response, next: NextFunction) => {
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