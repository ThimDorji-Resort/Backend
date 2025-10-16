import {
  listReceptionistsService,
  getReceptionistByIdService,
  createReceptionistService,
  updateReceptionistService,
  deleteReceptionistService,
} from "../services/ReceptionistService.js";

// List all receptionists
export const listReceptionists = async (req, res, next) => {
  try {
    const items = await listReceptionistsService();
    res.json(items);
  } catch (e) { next(e); }
};

// Get single receptionist
export const getReceptionist = async (req, res, next) => {
  try {
    const item = await getReceptionistByIdService(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (e) { next(e); }
};

// Create receptionist
export const createReceptionist = async (req, res, next) => {
  try {
    const item = await createReceptionistService(req.body);
    res.status(201).json(item);
  } catch (e) { next(e); }
};

// Update receptionist
export const updateReceptionist = async (req, res, next) => {
  try {
    const item = await updateReceptionistService(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (e) { next(e); }
};

// Delete receptionist
export const deleteReceptionist = async (req, res, next) => {
  try {
    const item = await deleteReceptionistService(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
};
