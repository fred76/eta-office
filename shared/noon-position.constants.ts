export const WIND_DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
] as const

export const SEA_STATES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export const VOYAGE_CONDITIONS = ['LADEN', 'BALLAST'] as const

export const VESSEL_STATUSES = ['AT_SEA', 'AT_ANCHOR', 'IN_PORT', 'CANAL_TRANSIT'] as const

export const MOORED_OPERATIONS = ['LOADING', 'DISCHARGING', 'IDLE', 'BUNKERING', 'OTHER'] as const
