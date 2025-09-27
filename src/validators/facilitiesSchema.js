import { z } from "zod";

export const createFacilitySchema = z.object({
  image: z.string().url().optional().or(z.literal("")),
  title: z.string().min(2).max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
});

export const updateFacilitySchema = createFacilitySchema.partial();
