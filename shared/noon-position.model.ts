export type CustomFieldType = 'text' | 'datetime' | 'number';

export interface NoonCustomField {
  id: string;
  type: CustomFieldType;
  label: string;
  unit?: string;
  order: number;
}

export type WindDirection =
  | "N" | "NNE" | "NE" | "ENE"
  | "E" | "ESE" | "SE" | "SSE"
  | "S" | "SSW" | "SW" | "WSW"
  | "W" | "WNW" | "NW" | "NNW";

export type SeaState = number;
export type SwellDirection = WindDirection;

export {
  WIND_DIRECTIONS,
  SEA_STATES,
  VOYAGE_CONDITIONS,
  VESSEL_STATUSES,
  MOORED_OPERATIONS,
} from './noon-position.constants';

export type VoyageCondition = "LADEN" | "BALLAST";

export interface NoonPosition {
  id: string;

  // Header
  voyageNumber: string;
  condition: VoyageCondition;
  date: string;        // ISO date "YYYY-MM-DD"
  timeUtc: string;     // "HH:MM" — LOCAL time (field name is misleading)
  utcOffset: number;   // UTC offset in hours, e.g. +2 or -6
  portFrom: string;
  portTo: string;
  ssp: string;         // Start of Sea Passage (datetime-local)
  eosp: string;        // End of Sea Passage (datetime-local)

  // ETA
  etaDate: string;     // ISO date
  etaTimeUtc: string;  // "HH:MM"

  // Voyage distances
  totalVoyMls: number;

  // Position — DDM format e.g. "47°30,5'" + hemi
  lat: string;        // "DD°MM,D'"
  latHemi: "N" | "S";
  lon: string;        // "DDD°MM,D'"
  lonHemi: "E" | "W";

  // Distance noon-to-noon
  distanceSinceLastNoon: number;  // miles
  steamTimeNoonToNoon: number;    // hours
  avrSpdNoonToNoon: number;       // knots

  // Distance from departure
  distanceFromDeparture: number;  // miles
  steamTimeFromDeparture: number; // hours
  avrSpdFromDeparture: number;    // knots

  // Distance to go
  distanceToGo: number;           // miles

  // Present speed / course
  speedSog: number;    // knots
  courseTrue: number;  // degrees

  // Draft
  draftFwd: number;    // metres
  draftAft: number;    // metres

  // Weather
  windDirection: WindDirection;
  windBeaufort: number;        // 0-12
  seaState: SeaState;
  swellDirection: SwellDirection;
  swellHeightM: number;
  baroPressureHpa: number;
  airTempC: number;
  seaTempC: number;
  visibilityNm: number;

  // Machinery
  engineRpm: number;
  meLoadPct: number;   // Main Engine load %
  speedLog: number;    // knots logged
  courseMag: number;   // degrees magnetic

  // Bunkers ROB at noon
  foRobMt: number;
  doRobMt: number;
  loRobMt: number;

  // Bunkers consumed in 24 hrs
  foConsumedMt: number;
  doConsumedMt: number;
  loConsumedMt: number;

  // Bunkers consumed since departure
  foConsumedSinceDepMt: number;
  doConsumedSinceDepMt: number;
  loConsumedSinceDepMt: number;

  // Vessel status at noon
  vesselStatus: VesselStatus;
  statusPort: string;      // MOORED: port  /  MANOEUVRING: port
  statusChannel: string;   // MANOEUVRING: channel
  statusBerth: string;     // MOORED: berth
  statusOperation: MooredOperation | ""; // MOORED: activity

  locked: boolean;
  remarks?: string;
  customFields?: Record<string, string | number>;
}

export interface VoyageSummary {
  voyageNumber: string;
  portFrom: string;
  portTo: string;
  condition: string;
  entryCount: number;
  totalDistanceMls: number;
  seaHours: number | null;
  avgSpeedKts: number | null;
  foConsumedMt: number;
  doConsumedMt: number;
  sspFirst: string;
  eospLast: string;
  entries: NoonPosition[];
  allLocked: boolean;
}

export type VesselStatus = "SAILING" | "MANOEUVRING" | "MOORED";

export type MooredOperation =
  | "LOADING" | "DISCHARGING" | "IDLE" | "BUNKERING"
  | "LAYBY" | "DRYDOCK" | "REPAIRING" | "OTHER";
