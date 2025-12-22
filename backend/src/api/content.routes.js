import { Router } from 'express';

const router = Router();

// GET /api/content/resources
router.get('/resources', (req, res) => {
  // Get mental health resources
  res.json({ message: 'Content resources endpoint' });
});

export default router;