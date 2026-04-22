export interface RotationModel {
  initialDate?: Date;
  initialUtc?: number;
  initialFORob?: number;
  initialDORob?: number;

  ports: PortDataModel[];
}

export interface PortDataModel {
  idOrder?: number;
  port: string;
  utc: number;
  voyageNumber?: string;
  activities: ActivityModel[];
  agencies?: Agency[];
}

export interface ActivityModel {
  idOrder?: number;
  activityType?:
    | "Sea Passage"
    | "Pilotage Inbound"
    | "Pilotage Outbound"
    | "Loading"
    | "Discharging"
    | "Cleaning"
    | "Shifting"
    | "Layby Berth"
    | "Bunkering"
    | "Anchoring"
    | "Drifting"
    | "Canal Transit"
    | string;
  icon?:
    | "sailing"
    | "compare_arrows"
    | "file_download"
    | "file_upload"
    | "cyclone"
    | "repeat"
    | "hourglass_empty"
    | "local_gas_station"
    | "anchor"
    | "anchor"
    | "alt_route"
    | string;
  laddenCondition?: 0 | 0.25 | 0.5 | 0.75 | 1 | number;
  distance?: number;
  speedKts?: number;
  isEcaArea?: "Inside ECA Area" | "Outside ECA Area" | string;
  isEosp?: "EoSP" | "Not EoSP";
  foConsumptionForTransit?: number;
  doConsumptionForTransit?: number;
  toBerth?: string;
  foRestock?: number;
  doRestock?: number;
  timeNeededForOperation?: number;
  notes?: string;
  ETX?: "ETA" | "ETB" | "ETC" | "ETS" | "SoSP" | string;
  mainEngine?: MachineryConsumption;
  boilers?: MachineryConsumption[];
  ddggs?: MachineryConsumption[];
  others?: MachineryConsumption[];
  totalDeltaFO_Derived?: number;
  totalDeltaDO_Derived?: number;
  robFO_Derived?: number;
  robDO_Derived?: number;
  mainEngineFODelta_Derived?: number;
  mainEngineDODelta_Derived?: number;
  ddggFODelta_Derived?: number;
  ddggDODelta_Derived?: number;
  boilerFODelta_Derived?: number;
  boilerDODelta_Derived?: number;
  otherFODelta_Derived?: number;
  otherDODelta_Derived?: number;
  description_Derived?: string;
  date_Derived?: string;
  option_Derived?: string;
  agency?: Agency;
}

export interface MachineryModel {
  cruiseSpeed?: CruiseSpeedModel;
  speed80?: Speed80Model;
  speed60?: Speed60Model;
  speed40?: Speed40Model;
  ddggConsumption?: number;
  boilerMaxConsumption?: number;
  extraMachinery?: ExtraMachinery[];
}

export interface CruiseSpeedModel {
  speed: number;
  consBallast: number;
  consLadden: number;
}

export interface Speed80Model {
  speed: number;
  consBallast: number;
  consLadden: number;
}

export interface Speed60Model {
  speed: number;
  consBallast: number;
  consLadden: number;
}

export interface Speed40Model {
  speed: number;
  consBallast: number;
  consLadden: number;
}

export interface ExtraMachinery {
  machineryName?: string;
  machineryConsumption?: number;
}

export interface MachineryConsumption {
  fuel?: "OFF" | "FO" | "DO" | string;
  powerSetting?: 0 | 0.33 | 0.66 | 1 | number;
}

export interface Agency {
  agName?: string;
  agEmail?: string;
  agMobile?: string;
  agAddress?: string;
}
