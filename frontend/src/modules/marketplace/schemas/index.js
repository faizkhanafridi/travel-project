import { z } from 'zod';

export const filterSchema = z.object({
  q: z.string().max(150).optional().or(z.literal('')),
  category_id: z.number().int().optional(),
  subcategory_id: z.number().int().optional(),
  destination_country: z.string().max(80).optional().or(z.literal('')),
  destination_city: z.string().max(80).optional().or(z.literal('')),
  price_min: z.string().optional().or(z.literal('')),
  price_max: z.string().optional().or(z.literal('')),
  duration_min: z.string().optional().or(z.literal('')),
  duration_max: z.string().optional().or(z.literal('')),
  duration_unit: z.string().max(20).optional().or(z.literal('')),
  sort: z
    .enum(['recommended', 'newest', 'lowest_price', 'highest_price'])
    .optional(),
});