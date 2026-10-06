import { Router, Request, Response } from 'express';
import { Item } from '../models/item.model';

const router = Router();

// GET all items
router.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch items', error });
  }
});

// POST create item
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!title || typeof title !== 'string') {
      res.status(400).json({ success: false, message: 'Field "title" is required' });
      return;
    }

    const newItem = await Item.create({ title, description });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create item', error });
  }
});

// DELETE item
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Item.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete item', error });
  }
});

export default router;
