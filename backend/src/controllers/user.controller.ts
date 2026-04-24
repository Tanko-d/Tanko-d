import { Request, Response } from 'express';
import { userRepository, CreateUserDTO, UpdateUserDTO, UserRole } from '../repositories/user.repository.js';
import { userService } from '../services/user.service.js';

export class UserController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const role = req.query.role as UserRole | undefined;
      const users = role
        ? await userRepository.findByRole(role)
        : await userRepository.findAll();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = await userRepository.findById(req.params.id);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user',
      });
    }
  }

  async getByStellarPubKey(req: Request, res: Response): Promise<void> {
    try {
      const user = await userRepository.findByStellarPubKey(req.params.publicKey);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateUserDTO = req.body;
      const user = await userRepository.create(data);
      res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(400).json({ success: false, error: 'Email already exists' });
        return;
      }
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const data: UpdateUserDTO = req.body;
      const user = await userRepository.update(req.params.id, data);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }
      if (error.code === 'P2002') {
        res.status(400).json({ success: false, error: 'Email already exists' });
        return;
      }
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await userRepository.delete(req.params.id);
      res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user',
      });
    }
  }

  async getDriversWithStats(req: Request, res: Response): Promise<void> {
    try {
      const managerPubKey = req.query.managerPubKey as string;
      if (!managerPubKey) {
        res.status(400).json({ success: false, error: 'managerPubKey is required' });
        return;
      }
      const drivers = await userRepository.getDriversWithStats(managerPubKey);
      res.status(200).json({ success: true, data: drivers });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch drivers',
      });
    }
  }

  /**
   * POST /api/v1/users/register-driver
   * Registers a new CONDUCTOR under the requesting JEFE manager.
   * Expects header: x-stellar-pubkey (manager's public key)
   * Body: { name: string, stellarPubKey: string }
   */
  async registerDriver(req: Request, res: Response): Promise<void> {
    try {
      const managerPubKey = req.headers['x-stellar-pubkey'] as string;
      if (!managerPubKey) {
        res.status(400).json({
          success: false,
          error: 'x-stellar-pubkey header is required',
        });
        return;
      }

      const driver = await userService.registerDriver(managerPubKey, req.body);
      res.status(201).json({ success: true, data: driver });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to register driver',
      });
    }
  }
}

export const userController = new UserController();

