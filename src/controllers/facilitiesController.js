import {
  listFacilitiesService,
  getFacilityByIdService,
  createFacilityService,
  updateFacilityService,
  deleteFacilityService,
} from "../services/facilitiesService.js";

export const listFacilities = async (req, res, next) => {
  try {
    const { q } = req.query;
    const filter = q
      ? { $or: [{ title: new RegExp(q, "i") }, { description: new RegExp(q, "i") }] }
      : {};
    const items = await listFacilitiesService(filter);
    res.json(items);
  } catch (e) { next(e); }
};

export const getFacility = async (req, res, next) => {
  try {
    const item = await getFacilityByIdService(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (e) { next(e); }
};

export const createFacility = async (req, res, next) => {
  try {
    console.log("createFacility body:", req.body);
    const item = await createFacilityService(req.body);
    res.status(201).json(item);
  } catch (e) { next(e); }
};

export const updateFacility = async (req, res, next) => {
  try {
    const item = await updateFacilityService(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (e) { next(e); }
};

export const deleteFacility = async (req, res, next) => {
  try {
    const item = await deleteFacilityService(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
};
