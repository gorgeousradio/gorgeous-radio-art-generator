// Vercel serverless function entry point
import express from 'express';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema';
import multer from 'multer';

const app = express();

// Database connection
const connection = mysql.createPool(process.env.DATABASE_URL!);
const db = drizzle(connection, { schema, mode: 'default' });

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS headers for frontend requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Presenters API routes
app.get('/api/presenters', async (req, res) => {
  try {
    const activeP = await db.select().from(schema.presenters)
      .where(eq(schema.presenters.isActive, true))
      .orderBy(schema.presenters.sortOrder);
    res.json(activeP);
  } catch (error) {
    console.error('Error fetching active presenters:', error);
    res.status(500).json({ message: 'Failed to fetch presenters' });
  }
});

app.get('/api/admin/presenters', async (req, res) => {
  try {
    const allP = await db.select().from(schema.presenters)
      .orderBy(schema.presenters.sortOrder);
    res.json(allP);
  } catch (error) {
    console.error('Error fetching all presenters:', error);
    res.status(500).json({ message: 'Failed to fetch presenters' });
  }
});

app.post('/api/admin/presenters', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, displayName, isActive, sortOrder } = req.body;
    
    const result = await db.insert(schema.presenters).values({
      name,
      displayName,
      profileImageUrl: req.body.profileImageUrl || null,
      bannerImageUrl: req.body.bannerImageUrl || null,
      isActive: isActive === 'true',
      sortOrder: parseInt(sortOrder) || 0,
    });

    // Fetch the created presenter
    const created = await db.select().from(schema.presenters)
      .where(eq(schema.presenters.name, name))
      .limit(1);

    res.json(created[0]);
  } catch (error) {
    console.error('Error creating presenter:', error);
    res.status(500).json({ message: 'Failed to create presenter' });
  }
});

app.put('/api/admin/presenters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, displayName, profileImageUrl, bannerImageUrl, isActive, sortOrder } = req.body;
    
    await db.update(schema.presenters)
      .set({
        name,
        displayName,
        profileImageUrl,
        bannerImageUrl,
        isActive,
        sortOrder: parseInt(sortOrder) || 0,
        updatedAt: new Date(),
      })
      .where(eq(schema.presenters.id, id));

    // Fetch the updated presenter
    const updated = await db.select().from(schema.presenters)
      .where(eq(schema.presenters.id, id))
      .limit(1);

    if (updated.length === 0) {
      return res.status(404).json({ message: 'Presenter not found' });
    }

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating presenter:', error);
    res.status(500).json({ message: 'Failed to update presenter' });
  }
});

app.delete('/api/admin/presenters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if presenter exists first
    const existing = await db.select().from(schema.presenters)
      .where(eq(schema.presenters.id, id))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Presenter not found' });
    }

    await db.delete(schema.presenters)
      .where(eq(schema.presenters.id, id));

    res.json({ message: 'Presenter deleted successfully' });
  } catch (error) {
    console.error('Error deleting presenter:', error);
    res.status(500).json({ message: 'Failed to delete presenter' });
  }
});

// Seed presenters if none exist
app.post('/api/admin/seed', async (req, res) => {
  try {
    const existing = await db.select().from(schema.presenters);
    if (existing.length > 0) {
      return res.json({ message: 'Presenters already exist' });
    }

    const presenters = [
      {
        name: 'dan',
        displayName: 'Dan Westwood',
        profileImageUrl: '/images/Dan Westwood.png',
        bannerImageUrl: '/images/Dan Westwood.png',
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'craig',
        displayName: 'Craig Dane',
        profileImageUrl: '/images/Craig Dane.png',
        bannerImageUrl: '/images/Craig Dane.png',
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'russ',
        displayName: 'Russ Dyer',
        profileImageUrl: '/images/Russ Dyer.png',
        bannerImageUrl: '/images/Russ Dyer.png',
        isActive: true,
        sortOrder: 3,
      },
      {
        name: 'daz',
        displayName: 'Daz Stokes',
        profileImageUrl: '/images/Daz Stokes.png',
        bannerImageUrl: '/images/Daz Stokes.png',
        isActive: true,
        sortOrder: 4,
      },
    ];

    await db.insert(schema.presenters).values(presenters);
    
    // Fetch the seeded presenters
    const seeded = await db.select().from(schema.presenters)
      .orderBy(schema.presenters.sortOrder);
    
    res.json({ message: 'Presenters seeded successfully', presenters: seeded });
  } catch (error) {
    console.error('Error seeding presenters:', error);
    res.status(500).json({ message: 'Failed to seed presenters' });
  }
});

export default app;