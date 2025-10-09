// import Testimonial from "../models/TestimonialModel.js";

// export const listTestimonialsService = (filter = {}) => {
//   return Testimonial.find(filter).sort({ createdAt: -1 });
// };

// export const getTestimonialByIdService = (id) => {
//   return Testimonial.findById(id);
// };

// export const createTestimonialService = (data) => {
//   const testimonial = new Testimonial(data);
//   return testimonial.save();
// };

// export const updateTestimonialService = (id, data) => {
//   return Testimonial.findByIdAndUpdate(id, data, { new: true });
// };

// export const deleteTestimonialService = (id) => {
//   return Testimonial.findByIdAndDelete(id);
// };
import Testimonial from "../models/TestimonialModel.js";

export const listTestimonialsService = (filter = {}, showArchived = false) => {
  // if showArchived is true, return all; else only non-archived
  const query = showArchived ? filter : { ...filter, archived: false };
  return Testimonial.find(query).sort({ createdAt: -1 });
};

// Get single testimonial by ID
export const getTestimonialByIdService = (id) => {
  return Testimonial.findById(id);
};

// Create a new testimonial
export const createTestimonialService = (data) => {
  const testimonial = new Testimonial(data);
  return testimonial.save();
};

// Update testimonial
export const updateTestimonialService = (id, data) => {
  return Testimonial.findByIdAndUpdate(id, data, { new: true });
};

// Delete testimonial
export const deleteTestimonialService = (id) => {
  return Testimonial.findByIdAndDelete(id);
};

// Archive testimonial
export const archiveTestimonialService = (id) => {
  return Testimonial.findByIdAndUpdate(id, { archived: true }, { new: true });
};

// Unarchive testimonial (optional)
export const unarchiveTestimonialService = (id) => {
  return Testimonial.findByIdAndUpdate(id, { archived: false }, { new: true });
};
