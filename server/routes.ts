import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAdminRoutes } from "./admin-routes";

// Mock presenters for development
const mockPresenters = [
  {
    id: '1',
    name: 'dan',
    displayName: 'Dan Westwood',
    profileImageUrl: '/images/profiles/Dan Westwood.png',
    bannerImageUrl: '/images/presenters/Dan Westwood.png',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'craig',
    displayName: 'Craig Dane',
    profileImageUrl: '/images/profiles/Craig Dane.png',
    bannerImageUrl: '/images/presenters/Craig Dane.png',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'russ',
    displayName: 'Russ Dyer',
    profileImageUrl: '/images/profiles/Russ Dyer.png',
    bannerImageUrl: '/images/presenters/Russ Dyer.png',
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'daz',
    displayName: 'Daz Stokes',
    profileImageUrl: '/images/profiles/Daz Stokes.png',
    bannerImageUrl: '/images/presenters/Daz Stokes.png',
    isActive: true,
    sortOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function registerRoutes(app: Express): Promise<Server> {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Development mode: Use mock data only
  if (isDevelopment) {
    console.log('Development mode: Using mock presenter data');
    
    // Presenters API routes for development
    app.get('/api/presenters', async (req, res) => {
      try {
        const activePresenters = mockPresenters.filter(p => p.isActive);
        res.json(activePresenters);
      } catch (error) {
        console.error('Error fetching active presenters:', error);
        res.status(500).json({ message: 'Failed to fetch presenters' });
      }
    });

    app.get('/api/admin/presenters', async (req, res) => {
      try {
        res.json(mockPresenters);
      } catch (error) {
        console.error('Error fetching all presenters:', error);
        res.status(500).json({ message: 'Failed to fetch presenters' });
      }
    });

    // Add mock routes for admin functionality
    app.post('/api/admin/presenters', async (req, res) => {
      try {
        // In development, just return success
        res.status(201).json({ message: 'Presenter would be added in production' });
      } catch (error) {
        res.status(500).json({ message: 'Failed to add presenter' });
      }
    });

    app.patch('/api/admin/presenters/:id', async (req, res) => {
      try {
        // In development, just return success  
        res.json({ message: 'Presenter would be updated in production' });
      } catch (error) {
        res.status(500).json({ message: 'Failed to update presenter' });
      }
    });

    app.delete('/api/admin/presenters/:id', async (req, res) => {
      try {
        // In development, just return success
        res.json({ message: 'Presenter would be deleted in production' });
      } catch (error) {
        res.status(500).json({ message: 'Failed to delete presenter' });
      }
    });
  } else {
    // Production mode: Use database routes
    try {
      await setupAdminRoutes(app);
    } catch (error) {
      console.warn('Database admin routes unavailable:', error.message);
    }
  }

  const httpServer = createServer(app);

  return httpServer;
}
