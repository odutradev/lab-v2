import { WorkoutModalities, ExerciseLibrary, RoutineTemplates } from '@domains/workouts/utils/catalog'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import defineAction from '@factories/defineAction'
import { workoutCatalogResponseSchema } from './schemas'

import type { WorkoutCatalogResponse } from './types'

export const getWorkoutCatalogAction = defineAction(
  {
    method: 'get',
    path: '/workouts/catalog/details',
    summary: 'Lista modalidades, biblioteca de exercícios e modelos de rotina',
    tags: ['Workouts'],
    authenticate: true,
    responses: {
      200: {
        description: 'Catálogo de treinos',
        schema: workoutCatalogResponseSchema
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async (): Promise<WorkoutCatalogResponse> => {
    return {
      modalities: WorkoutModalities,
      exercises: ExerciseLibrary,
      templates: RoutineTemplates
    }
  }
)
