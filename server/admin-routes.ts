import type { Express } from "express";
import { db } from "./db";
import { presenters, insertPresenterSchema, type Presenter } from "@shared/schema";
import { eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export async function setupAdminRoutes(app: Express) {
  // Ensure upload directories exist
  const uploadsDir = path.join(process.cwd(), 'client/public/images');
  const profilesDir = path.join(uploadsDir, 'profiles');
  const presentersDir = path.join(uploadsDir, 'presenters');
  
  await fs.mkdir(profilesDir, { recursive: true });
  await fs.mkdir(presentersDir, { recursive: true });

  // Get all presenters
  app.get('/api/admin/presenters', async (req, res) => {
    try {
      const allPresenters = await db.select().from(presenters).orderBy(presenters.sortOrder);
      res.json(allPresenters);
    } catch (error) {
      console.error('Error fetching presenters:', error);
      res.status(500).json({ message: 'Failed to fetch presenters' });
    }
  });

  // Add new presenter
  app.post('/api/admin/presenters', async (req, res) => {
    try {
      const validatedData = insertPresenterSchema.parse(req.body);
      const [newPresenter] = await db.insert(presenters).values(validatedData).returning();
      res.status(201).json(newPresenter);
    } catch (error) {
      console.error('Error adding presenter:', error);
      res.status(400).json({ message: 'Failed to add presenter' });
    }
  });

  // Update presenter
  app.patch('/api/admin/presenters/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const [updatedPresenter] = await db
        .update(presenters)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(presenters.id, id))
        .returning();
        
      if (!updatedPresenter) {
        return res.status(404).json({ message: 'Presenter not found' });
      }
      
      res.json(updatedPresenter);
    } catch (error) {
      console.error('Error updating presenter:', error);
      res.status(400).json({ message: 'Failed to update presenter' });
    }
  });

  // Delete presenter
  app.delete('/api/admin/presenters/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const [deletedPresenter] = await db
        .delete(presenters)
        .where(eq(presenters.id, id))
        .returning();
        
      if (!deletedPresenter) {
        return res.status(404).json({ message: 'Presenter not found' });
      }
      
      res.json({ message: 'Presenter deleted successfully' });
    } catch (error) {
      console.error('Error deleting presenter:', error);
      res.status(500).json({ message: 'Failed to delete presenter' });
    }
  });

  // Upload image
  app.post('/api/admin/upload', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { type } = req.body; // 'profile' or 'banner'
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const uploadPath = type === 'profile' ? profilesDir : presentersDir;
      const filePath = path.join(uploadPath, fileName);
      
      await fs.writeFile(filePath, req.file.buffer);
      
      const publicUrl = `/images/${type === 'profile' ? 'profiles' : 'presenters'}/${fileName}`;
      res.json({ url: publicUrl });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Failed to upload file' });
    }
  });

  // Get active presenters for the main app
  app.get('/api/presenters', async (req, res) => {
    try {
      const activePresenters = await db
        .select()
        .from(presenters)
        .where(eq(presenters.isActive, true))
        .orderBy(presenters.sortOrder);
      res.json(activePresenters);
    } catch (error) {
      console.error('Error fetching active presenters:', error);
      res.status(500).json({ message: 'Failed to fetch presenters' });
    }
  });
}