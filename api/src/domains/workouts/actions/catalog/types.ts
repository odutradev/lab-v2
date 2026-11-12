import type { workoutCatalogResponseSchema } from './schemas'
import type { z } from 'zod'

export type WorkoutCatalogResponse = z.infer<typeof workoutCatalogResponseSchema>
