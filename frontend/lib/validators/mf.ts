import { z } from 'zod'

/**
 * Zod schema for the MF recommendation form.
 * Mirrors exactly the backend validation rules in mf_routes.py.
 */
export const mfFormSchema = z.object({
  age: z
    .number({ required_error: 'Age is required' })
    .int('Age must be a whole number')
    .min(1, 'Age must be greater than 0')
    .max(100, 'Please enter a valid age'),

  amount: z
    .number({ required_error: 'Investment amount is required' })
    .min(1000, 'Minimum investment is ₹1,000')
    .refine((v) => v % 100 === 0, 'Amount must be in multiples of ₹100'),

  risk: z.enum(['low', 'medium', 'high'], {
    required_error: 'Please select a risk level',
  }),

  duration_years: z
    .number({ required_error: 'Investment duration is required' })
    .int('Duration must be a whole number')
    .min(1, 'Minimum duration is 1 year')
    .max(40, 'Maximum duration is 40 years'),
})

export type MFFormValues = z.infer<typeof mfFormSchema>
