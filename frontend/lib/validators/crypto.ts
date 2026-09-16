import { z } from 'zod'

/**
 * Zod schema for the crypto recommendation form.
 * Mirrors exactly the backend validation rules in crypto_routes.py.
 *
 * IMPORTANT: The backend uses investment_horizon + max_drawdown,
 * NOT a simple risk field. The UI must collect these two separate fields.
 */
export const cryptoFormSchema = z.object({
  amount: z
    .number({ required_error: 'Investment amount is required' })
    .min(1000, 'Minimum investment is ₹1,000')
    .refine((v) => v % 100 === 0, 'Amount must be in multiples of ₹100'),

  investment_horizon: z.enum(['short-term', 'medium-term', 'long-term'], {
    required_error: 'Please select an investment horizon',
  }),

  max_drawdown: z.union([z.literal(20), z.literal(50), z.literal(80)], {
    required_error: 'Please select a risk tolerance',
  }),
})

export type CryptoFormValues = z.infer<typeof cryptoFormSchema>
