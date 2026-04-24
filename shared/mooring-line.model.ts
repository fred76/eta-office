export type FunctionalPosition =
  | "BOW"
  | "STERN"
  | "BREAST_FWD"
  | "BREAST_AFT"
  | "SPRING_FWD"
  | "SPRING_AFT"
  | "FLYING_ROPE"
  | "SPARE_ROPE";
export type LineMaterial = "POLYPROPYLENE" | "POLYESTER" | "NYLON" | "HMPE" | "WIRE_ROPE";
export type LineStatus = "IN_SERVICE" | "STANDBY" | "OUT_OF_SERVICE" | "RETIRED";
export type ReceptionCondition = "GOOD" | "RESERVED" | "DAMAGED";
export type InspectionType = "ROUTINE" | "FORMAL" | "POST_INCIDENT";
export type OverallCondition = "GOOD" | "MARGINAL" | "RETIRE";
export type WearZoneStatus = "OK" | "MONITOR" | "CRITICAL";
export type ActionRequired = "NONE" | "MONITOR" | "EARLY_REINSPECTION" | "RETIRE";
export type DisposalMethod = "SCRAP" | "REPURPOSE" | "RETURN_TO_MAKER";
export type TrafficLightColor = "GREEN" | "AMBER" | "RED" | "GREY";

export {
  FUNCTIONAL_POSITIONS,
  LINE_MATERIALS,
  INSPECTION_TYPES,
  OVERALL_CONDITIONS,
  WEAR_ZONE_STATUSES,
  ACTIONS_REQUIRED,
  DISPOSAL_METHODS,
} from './mooring-line.constants';

export interface DamageFlags {
  coreTension: boolean;
  externalAbrasion: boolean;
  kinks: boolean;
  chemicalDamage: boolean;
  heatDamage: boolean;
}

export interface InspectionEntry {
  id: string;
  date: string;
  type: InspectionType;
  overallCondition: OverallCondition;
  wearZoneStatus: WearZoneStatus;
  degradationPct: number;
  actionRequired: ActionRequired;
  damage: DamageFlags;
  notes?: string;
}

export interface EndForEndEntry {
  id: string;
  date: string;
  port: string;
  officer: string;
  hoursAtTime: number;
  opsAtTime: number;
  notes?: string;
}

export interface WllExceedanceEntry {
  id: string;
  date: string;
  port: string;
  cause: string;
  estimatedLoadKn?: number;
  metersCut?: number;
  postInspection: boolean;
  postInspectionOk?: boolean;
  notes?: string;
}

export interface RetirementData {
  retirementDate: string;
  retirementReason: string;
  retirementAuthBy: string;
  disposalMethod: DisposalMethod;
}

export interface LocationEntry {
  id: string;
  date: string;
  fromItemId: number | null; // null = received from external supplier
  toItemId: number;
  officer: string;
  notes?: string;
}

export interface MooringLine {
  id: string;
  label: string;
  functionalPosition: FunctionalPosition;
  material: LineMaterial;
  diameterMm: number;
  lengthM: number;
  ldbfKn: number;
  wllKn: number;
  receivedDate: string;
  receptionCondition: ReceptionCondition;
  hasCertPdf: boolean;
  status: LineStatus;
  firstUseDate?: string;
  totalServiceHours: number;
  totalOperations: number;
  maxServiceHours?: number;
  inspections: InspectionEntry[];
  endForEndHistory: EndForEndEntry[];
  wllExceedances: WllExceedanceEntry[];
  retirement?: RetirementData;
  locationHistory: LocationEntry[];
}

export interface TrafficLightResult {
  color: TrafficLightColor;
  reasons: string[];
}

export type CanvasSection = "bow" | "deck" | "aft";

export interface MooringItem {
  id: number;
  type: "winch" | "basket" | "spare-rope";
  x: number;
  y: number;
  rotation: number;
  lineIds: string[]; // basket: 0..N, winch: 0..1, spare-rope: 0..1
  canvasSection: CanvasSection;
  identification?: string;
}

