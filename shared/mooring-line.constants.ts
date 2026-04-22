export const FUNCTIONAL_POSITIONS = [
  'BOW', 'STERN', 'BREAST_FWD', 'BREAST_AFT',
  'SPRING_FWD', 'SPRING_AFT', 'FLYING_ROPE', 'SPARE_ROPE',
] as const

export const LINE_MATERIALS = [
  'POLYPROPYLENE', 'POLYESTER', 'NYLON', 'HMPE', 'WIRE_ROPE',
] as const

export const INSPECTION_TYPES = ['ROUTINE', 'FORMAL', 'POST_INCIDENT'] as const

export const OVERALL_CONDITIONS = ['GOOD', 'MARGINAL', 'RETIRE'] as const

export const WEAR_ZONE_STATUSES = ['OK', 'MONITOR', 'CRITICAL'] as const

export const ACTIONS_REQUIRED = ['NONE', 'MONITOR', 'EARLY_REINSPECTION', 'RETIRE'] as const

export const DISPOSAL_METHODS = ['SCRAP', 'REPURPOSE', 'RETURN_TO_MAKER'] as const
