import { z } from "zod";

export const createTestimonialSchema = z.object({
  image: z.string().url().optional().or(z.literal("")),  
  name: z.string().min(2).max(100),
  stay: z.string().min(2).max(100),
  testimonial: z.string().min(5).max(1000),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();
