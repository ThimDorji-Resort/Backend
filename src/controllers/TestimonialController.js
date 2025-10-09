import {
  listTestimonialsService,
  getTestimonialByIdService,
  createTestimonialService,
  updateTestimonialService,
  deleteTestimonialService,
  archiveTestimonialService,
  unarchiveTestimonialService,
} from "../services/testimonialsService.js";

// List all (non-archived by default)
export const listTestimonials = async (req, res, next) => {
  try {
    const { q, showArchived } = req.query;
    const filter = q
      ? { $or: [{ name: new RegExp(q, "i") }, { testimonial: new RegExp(q, "i") }] }
      : {};
    const items = await listTestimonialsService(filter, showArchived === "true");
    res.json(items);
  } catch (e) {
    next(e);
  }
};


// Get single testimonial
export const getTestimonial = async (req, res, next) => {
  try {
    const item = await getTestimonialByIdService(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (e) {
    next(e);
  }
};

// Create testimonial
export const createTestimonial = async (req, res, next) => {
  try {
    console.log("createTestimonial body:", req.body);
    const item = await createTestimonialService(req.body);
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
};

// Update testimonial
export const updateTestimonial = async (req, res, next) => {
  try {
    const item = await updateTestimonialService(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (e) {
    next(e);
  }
};

// Delete testimonial
export const deleteTestimonial = async (req, res, next) => {
  try {
    const item = await deleteTestimonialService(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

// Archive testimonial
export const archiveTestimonial = async (req, res, next) => {
  try {
    const item = await archiveTestimonialService(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Testimonial archived", item });
  } catch (e) {
    next(e);
  }
};

// Unarchive testimonial
export const unarchiveTestimonial = async (req, res, next) => {
  try {
    const item = await unarchiveTestimonialService(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Testimonial unarchived", item });
  } catch (e) {
    next(e);
  }
};

