import type { WorkoutModality, LibraryExercise, RoutineTemplate } from './types'

export const WorkoutModalities: WorkoutModality[] = [
  { id: 'weightTraining', name: 'Musculação', kind: 'strength', met: 5 },
  { id: 'running', name: 'Corrida', kind: 'cardio', met: 9.8 },
  { id: 'walking', name: 'Caminhada', kind: 'cardio', met: 3.5 },
  { id: 'cycling', name: 'Ciclismo', kind: 'cardio', met: 7.5 },
  { id: 'swimming', name: 'Natação', kind: 'cardio', met: 7 },
  { id: 'dancing', name: 'Dança / Forró', kind: 'sport', met: 5.5 },
  { id: 'football', name: 'Futebol', kind: 'sport', met: 7 },
  { id: 'martialArts', name: 'Lutas', kind: 'sport', met: 7.5 },
  { id: 'functional', name: 'Funcional / CrossFit', kind: 'cardio', met: 8 },
  { id: 'yoga', name: 'Yoga / Pilates', kind: 'sport', met: 3 },
  { id: 'other', name: 'Outro', kind: 'sport', met: 4 }
]

export const ExerciseLibrary: LibraryExercise[] = [
  { id: 'benchPress', name: 'Supino reto com barra', muscleGroup: 'chest' },
  { id: 'inclineDumbbellPress', name: 'Supino inclinado com halteres', muscleGroup: 'chest' },
  { id: 'declineBenchPress', name: 'Supino declinado', muscleGroup: 'chest' },
  { id: 'dumbbellFly', name: 'Crucifixo com halteres', muscleGroup: 'chest' },
  { id: 'cableCrossover', name: 'Crossover', muscleGroup: 'chest' },
  { id: 'pushUp', name: 'Flexão de braço', muscleGroup: 'chest' },
  { id: 'chestPressMachine', name: 'Supino máquina', muscleGroup: 'chest' },
  { id: 'pullUp', name: 'Barra fixa', muscleGroup: 'back' },
  { id: 'latPulldown', name: 'Puxada frontal', muscleGroup: 'back' },
  { id: 'barbellRow', name: 'Remada curvada', muscleGroup: 'back' },
  { id: 'seatedCableRow', name: 'Remada baixa', muscleGroup: 'back' },
  { id: 'oneArmDumbbellRow', name: 'Remada unilateral (serrote)', muscleGroup: 'back' },
  { id: 'deadlift', name: 'Levantamento terra', muscleGroup: 'back' },
  { id: 'straightArmPulldown', name: 'Pulldown braços estendidos', muscleGroup: 'back' },
  { id: 'overheadPress', name: 'Desenvolvimento com barra', muscleGroup: 'shoulders' },
  { id: 'dumbbellShoulderPress', name: 'Desenvolvimento com halteres', muscleGroup: 'shoulders' },
  { id: 'lateralRaise', name: 'Elevação lateral', muscleGroup: 'shoulders' },
  { id: 'frontRaise', name: 'Elevação frontal', muscleGroup: 'shoulders' },
  { id: 'reverseFly', name: 'Crucifixo inverso', muscleGroup: 'shoulders' },
  { id: 'facePull', name: 'Face pull', muscleGroup: 'shoulders' },
  { id: 'shrug', name: 'Encolhimento', muscleGroup: 'shoulders' },
  { id: 'barbellCurl', name: 'Rosca direta', muscleGroup: 'biceps' },
  { id: 'alternatingDumbbellCurl', name: 'Rosca alternada', muscleGroup: 'biceps' },
  { id: 'hammerCurl', name: 'Rosca martelo', muscleGroup: 'biceps' },
  { id: 'scottCurl', name: 'Rosca Scott', muscleGroup: 'biceps' },
  { id: 'concentrationCurl', name: 'Rosca concentrada', muscleGroup: 'biceps' },
  { id: 'tricepsPushdown', name: 'Tríceps na polia', muscleGroup: 'triceps' },
  { id: 'skullCrusher', name: 'Tríceps testa', muscleGroup: 'triceps' },
  { id: 'overheadTricepsExtension', name: 'Tríceps francês', muscleGroup: 'triceps' },
  { id: 'benchDip', name: 'Mergulho no banco', muscleGroup: 'triceps' },
  { id: 'closeGripBenchPress', name: 'Supino fechado', muscleGroup: 'triceps' },
  { id: 'backSquat', name: 'Agachamento livre', muscleGroup: 'legs' },
  { id: 'legPress', name: 'Leg press 45°', muscleGroup: 'legs' },
  { id: 'hackSquat', name: 'Agachamento hack', muscleGroup: 'legs' },
  { id: 'legExtension', name: 'Cadeira extensora', muscleGroup: 'legs' },
  { id: 'lyingLegCurl', name: 'Mesa flexora', muscleGroup: 'legs' },
  { id: 'seatedLegCurl', name: 'Cadeira flexora', muscleGroup: 'legs' },
  { id: 'romanianDeadlift', name: 'Stiff', muscleGroup: 'legs' },
  { id: 'lunge', name: 'Afundo', muscleGroup: 'legs' },
  { id: 'bulgarianSplitSquat', name: 'Agachamento búlgaro', muscleGroup: 'legs' },
  { id: 'hipThrust', name: 'Elevação pélvica', muscleGroup: 'glutes' },
  { id: 'hipAbduction', name: 'Cadeira abdutora', muscleGroup: 'glutes' },
  { id: 'hipAdduction', name: 'Cadeira adutora', muscleGroup: 'legs' },
  { id: 'cableKickback', name: 'Glúteo na polia', muscleGroup: 'glutes' },
  { id: 'standingCalfRaise', name: 'Panturrilha em pé', muscleGroup: 'calves' },
  { id: 'seatedCalfRaise', name: 'Panturrilha sentado', muscleGroup: 'calves' },
  { id: 'crunch', name: 'Abdominal supra', muscleGroup: 'core' },
  { id: 'plank', name: 'Prancha', muscleGroup: 'core' },
  { id: 'hangingLegRaise', name: 'Elevação de pernas', muscleGroup: 'core' },
  { id: 'cableCrunch', name: 'Abdominal na polia', muscleGroup: 'core' },
  { id: 'russianTwist', name: 'Giro russo', muscleGroup: 'core' }
]

export const RoutineTemplates: RoutineTemplate[] = [
  {
    id: 'fullBody',
    name: 'Full body (3x por semana)',
    routines: [
      {
        name: 'Full body',
        weekDays: [1, 3, 5],
        exercises: [
          { exerciseId: 'backSquat', sets: 3, reps: '8-12' },
          { exerciseId: 'benchPress', sets: 3, reps: '8-12' },
          { exerciseId: 'barbellRow', sets: 3, reps: '8-12' },
          { exerciseId: 'dumbbellShoulderPress', sets: 3, reps: '10-12' },
          { exerciseId: 'romanianDeadlift', sets: 3, reps: '10-12' },
          { exerciseId: 'plank', sets: 3, reps: '30-45s' }
        ]
      }
    ]
  },
  {
    id: 'ab',
    name: 'AB (superiores e inferiores)',
    routines: [
      {
        name: 'Treino A - Superiores',
        weekDays: [1, 4],
        exercises: [
          { exerciseId: 'benchPress', sets: 4, reps: '8-10' },
          { exerciseId: 'latPulldown', sets: 4, reps: '8-10' },
          { exerciseId: 'dumbbellShoulderPress', sets: 3, reps: '10-12' },
          { exerciseId: 'seatedCableRow', sets: 3, reps: '10-12' },
          { exerciseId: 'barbellCurl', sets: 3, reps: '10-12' },
          { exerciseId: 'tricepsPushdown', sets: 3, reps: '10-12' }
        ]
      },
      {
        name: 'Treino B - Inferiores',
        weekDays: [2, 5],
        exercises: [
          { exerciseId: 'backSquat', sets: 4, reps: '8-10' },
          { exerciseId: 'legPress', sets: 3, reps: '10-12' },
          { exerciseId: 'romanianDeadlift', sets: 3, reps: '10-12' },
          { exerciseId: 'lyingLegCurl', sets: 3, reps: '10-12' },
          { exerciseId: 'standingCalfRaise', sets: 4, reps: '12-15' },
          { exerciseId: 'crunch', sets: 3, reps: '15-20' }
        ]
      }
    ]
  },
  {
    id: 'abc',
    name: 'ABC (peito/tríceps, costas/bíceps, pernas/ombros)',
    routines: [
      {
        name: 'Treino A - Peito e tríceps',
        weekDays: [1, 4],
        exercises: [
          { exerciseId: 'benchPress', sets: 4, reps: '8-10' },
          { exerciseId: 'inclineDumbbellPress', sets: 3, reps: '10-12' },
          { exerciseId: 'dumbbellFly', sets: 3, reps: '12-15' },
          { exerciseId: 'tricepsPushdown', sets: 3, reps: '10-12' },
          { exerciseId: 'skullCrusher', sets: 3, reps: '10-12' }
        ]
      },
      {
        name: 'Treino B - Costas e bíceps',
        weekDays: [2, 5],
        exercises: [
          { exerciseId: 'latPulldown', sets: 4, reps: '8-10' },
          { exerciseId: 'barbellRow', sets: 3, reps: '8-10' },
          { exerciseId: 'oneArmDumbbellRow', sets: 3, reps: '10-12' },
          { exerciseId: 'barbellCurl', sets: 3, reps: '10-12' },
          { exerciseId: 'hammerCurl', sets: 3, reps: '10-12' }
        ]
      },
      {
        name: 'Treino C - Pernas e ombros',
        weekDays: [3, 6],
        exercises: [
          { exerciseId: 'backSquat', sets: 4, reps: '8-10' },
          { exerciseId: 'legPress', sets: 3, reps: '10-12' },
          { exerciseId: 'lyingLegCurl', sets: 3, reps: '10-12' },
          { exerciseId: 'overheadPress', sets: 3, reps: '8-10' },
          { exerciseId: 'lateralRaise', sets: 3, reps: '12-15' },
          { exerciseId: 'standingCalfRaise', sets: 4, reps: '12-15' }
        ]
      }
    ]
  },
  {
    id: 'pushPullLegs',
    name: 'Push / Pull / Legs',
    routines: [
      {
        name: 'Push - Empurrar',
        weekDays: [1, 4],
        exercises: [
          { exerciseId: 'benchPress', sets: 4, reps: '6-10' },
          { exerciseId: 'overheadPress', sets: 3, reps: '8-10' },
          { exerciseId: 'inclineDumbbellPress', sets: 3, reps: '10-12' },
          { exerciseId: 'lateralRaise', sets: 3, reps: '12-15' },
          { exerciseId: 'tricepsPushdown', sets: 3, reps: '10-12' }
        ]
      },
      {
        name: 'Pull - Puxar',
        weekDays: [2, 5],
        exercises: [
          { exerciseId: 'deadlift', sets: 3, reps: '5-8' },
          { exerciseId: 'pullUp', sets: 3, reps: '6-10' },
          { exerciseId: 'seatedCableRow', sets: 3, reps: '10-12' },
          { exerciseId: 'facePull', sets: 3, reps: '12-15' },
          { exerciseId: 'barbellCurl', sets: 3, reps: '10-12' }
        ]
      },
      {
        name: 'Legs - Pernas',
        weekDays: [3, 6],
        exercises: [
          { exerciseId: 'backSquat', sets: 4, reps: '6-10' },
          { exerciseId: 'romanianDeadlift', sets: 3, reps: '8-10' },
          { exerciseId: 'legPress', sets: 3, reps: '10-12' },
          { exerciseId: 'seatedLegCurl', sets: 3, reps: '10-12' },
          { exerciseId: 'standingCalfRaise', sets: 4, reps: '12-15' }
        ]
      }
    ]
  },
  {
    id: 'upperLower',
    name: 'Upper / Lower (4x por semana)',
    routines: [
      {
        name: 'Upper - Superiores',
        weekDays: [1, 4],
        exercises: [
          { exerciseId: 'benchPress', sets: 4, reps: '6-10' },
          { exerciseId: 'barbellRow', sets: 4, reps: '6-10' },
          { exerciseId: 'dumbbellShoulderPress', sets: 3, reps: '8-12' },
          { exerciseId: 'latPulldown', sets: 3, reps: '8-12' },
          { exerciseId: 'alternatingDumbbellCurl', sets: 2, reps: '10-12' },
          { exerciseId: 'overheadTricepsExtension', sets: 2, reps: '10-12' }
        ]
      },
      {
        name: 'Lower - Inferiores',
        weekDays: [2, 5],
        exercises: [
          { exerciseId: 'backSquat', sets: 4, reps: '6-10' },
          { exerciseId: 'romanianDeadlift', sets: 3, reps: '8-10' },
          { exerciseId: 'bulgarianSplitSquat', sets: 3, reps: '10-12' },
          { exerciseId: 'hipThrust', sets: 3, reps: '10-12' },
          { exerciseId: 'seatedCalfRaise', sets: 4, reps: '12-15' }
        ]
      }
    ]
  }
]
