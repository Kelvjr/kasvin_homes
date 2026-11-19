import { Router } from 'express';
import type { AppConfig } from '../../config/env.js';
import { requireAdmin } from '../../middleware/admin.js';
import { ApartmentService } from './apartment.service.js';
import {
  assignAmenitiesSchema,
  createAmenitySchema,
  createApartmentSchema,
  createImageSchema,
  listAdminSchema,
  listPublicSchema,
  parseId,
  parseInput,
  parseSlug,
  statusSchema,
  updateAmenitySchema,
  updateApartmentSchema,
  updateImageSchema,
} from './apartment.validation.js';

export function apartmentRoutes(
  config: AppConfig,
  service: ApartmentService,
): Router {
  const router = Router();
  const admin = Router();

  router.get('/apartments', async (req, res) => {
    res.json(await service.listPublic(parseInput(listPublicSchema, req.query)));
  });

  admin.get('/apartments', async (req, res) => {
    res.json(await service.listAdmin(parseInput(listAdminSchema, req.query)));
  });
  admin.get('/apartments/:id', async (req, res) => {
    res.json(await service.getAdmin(parseId(req.params.id)));
  });
  admin.post('/apartments', async (req, res) => {
    res
      .status(201)
      .json(await service.create(parseInput(createApartmentSchema, req.body)));
  });
  admin.patch('/apartments/:id', async (req, res) => {
    res.json(
      await service.update(
        parseId(req.params.id),
        parseInput(updateApartmentSchema, req.body),
      ),
    );
  });
  admin.patch('/apartments/:id/status', async (req, res) => {
    res.json(
      await service.changeStatus(
        parseId(req.params.id),
        parseInput(statusSchema, req.body),
      ),
    );
  });
  admin.delete('/apartments/:id', async (req, res) => {
    res.json(await service.archive(parseId(req.params.id)));
  });

  admin.get('/amenities', async (_req, res) => {
    res.json(await service.listAmenities());
  });
  admin.post('/amenities', async (req, res) => {
    res
      .status(201)
      .json(
        await service.createAmenity(parseInput(createAmenitySchema, req.body)),
      );
  });
  admin.patch('/amenities/:id', async (req, res) => {
    res.json(
      await service.updateAmenity(
        parseId(req.params.id),
        parseInput(updateAmenitySchema, req.body),
      ),
    );
  });
  admin.put('/apartments/:id/amenities', async (req, res) => {
    const { amenityIds } = parseInput(assignAmenitiesSchema, req.body);
    res.json(await service.assignAmenities(parseId(req.params.id), amenityIds));
  });

  admin.post('/apartments/:id/images', async (req, res) => {
    res
      .status(201)
      .json(
        await service.addImage(
          parseId(req.params.id),
          parseInput(createImageSchema, req.body),
        ),
      );
  });
  admin.patch('/apartments/:id/images/:imageId', async (req, res) => {
    res.json(
      await service.updateImage(
        parseId(req.params.id),
        parseId(req.params.imageId),
        parseInput(updateImageSchema, req.body),
      ),
    );
  });
  admin.delete('/apartments/:id/images/:imageId', async (req, res) => {
    res.json(
      await service.removeImage(
        parseId(req.params.id),
        parseId(req.params.imageId),
      ),
    );
  });

  router.use('/admin', requireAdmin(config), admin);
  router.get('/apartments/:slug', async (req, res) => {
    res.json(await service.getPublic(parseSlug(req.params.slug)));
  });
  return router;
}
