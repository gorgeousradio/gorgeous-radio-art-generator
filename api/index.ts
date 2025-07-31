import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';

// Mock presenters data for Vercel deployment
const mockPresenters = [
  {
    id: '1',
    name: 'dan',
    displayName: 'Dan Westwood',
    profileImageUrl: '/images/profiles/Dan Westwood.png',
    bannerImageUrl: '/images/presenters/Dan Westwood.png',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'craig',
    displayName: 'Craig Dane',
    profileImageUrl: '/images/profiles/Craig Dane.png',
    bannerImageUrl: '/images/presenters/Craig Dane.png',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'russ',
    displayName: 'Russ Dyer',
    profileImageUrl: '/images/profiles/Russ Dyer.png',
    bannerImageUrl: '/images/presenters/Russ Dyer.png',
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'daz',
    displayName: 'Daz Stokes',
    profileImageUrl: '/images/profiles/Daz Stokes.png',
    bannerImageUrl: '/images/presenters/Daz Stokes.png',
    isActive: true,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const app = express();

app.use(cors());
app.use(express.json());

// Presenters API routes
app.get('/api/presenters', (req, res) => {
  try {
    const activePresenters = mockPresenters.filter(p => p.isActive);
    res.json(activePresenters);
  } catch (error) {
    console.error('Error fetching active presenters:', error);
    res.status(500).json({ message: 'Failed to fetch presenters' });
  }
});

// Admin routes
app.get('/api/admin/presenters', (req, res) => {
  try {
    res.json(mockPresenters);
  } catch (error) {
    console.error('Error fetching admin presenters:', error);
    res.status(500).json({ message: 'Failed to fetch presenters' });
  }
});

app.post('/api/admin/presenters', (req, res) => {
  try {
    const newPresenter = {
      ...req.body,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // In a real app, save to database
    res.status(201).json(newPresenter);
  } catch (error) {
    console.error('Error creating presenter:', error);
    res.status(500).json({ message: 'Failed to create presenter' });
  }
});

app.put('/api/admin/presenters/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedPresenter = {
      ...req.body,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    // In a real app, update in database
    res.json(updatedPresenter);
  } catch (error) {
    console.error('Error updating presenter:', error);
    res.status(500).json({ message: 'Failed to update presenter' });
  }
});

app.delete('/api/admin/presenters/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, delete from database
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting presenter:', error);
    res.status(500).json({ message: 'Failed to delete presenter' });
  }
});

app.post('/api/admin/upload', (req, res) => {
  try {
    // Mock upload response
    const mockUrl = `/images/${req.body.type || 'profiles'}/uploaded-${Date.now()}.png`;
    res.json({ url: mockUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Export the Express app as a Vercel serverless function
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};