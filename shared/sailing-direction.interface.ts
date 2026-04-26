export type TugsRequired      = 'mandatory' | 'recommended' | 'not_required'
export type FreshwaterType    = 'ex_pipe' | 'via_barge' | 'both' | 'none'
export type GarbageDisposal   = 'yes' | 'no' | 'ashore' | 'barge'
export type MooringSide       = 'port' | 'starboard' | 'either'
export type CargoConnectionType = 'arm' | 'hose' | 'both'

export interface PortMaster {
  id:           number
  name:         string
  country?:     string
  unlocode?:    string
  notes?:       string
  sync_version: number
}

export interface BerthInfo {
  berthId:                 number
  receptionFacility?:      string
  garbageDisposal?:        GarbageDisposal
  preferredMooringSide?:   MooringSide
  tugsRequiredMooring?:    TugsRequired
  tugsRequiredUnmooring?:  TugsRequired
  tugsNotes?:              string
  freshwaterAvailable:     boolean
  freshwaterType?:         FreshwaterType
  bunkeringAvailable:      boolean
  bunkerTypes?:            string
  maxDraft?:               number
  maxLOA?:                 number
  craneMoveRate?:          number
  numberOfCranes?:         number
  reeferPlugsCount?:       number
  shorePowerAvailable?:    boolean
  shorePowerSpec?:         string
  maxLoadingRateMT?:       number
  maxDischargeRateMT?:     number
  shipGearAllowed?:        boolean
  grabAvailable?:          boolean
  conveyorAvailable?:      boolean
  dustSuppressionRequired?: boolean
  generalNotes?:           string
  lastUpdatedBy?:          string
  sync_version:            number
}

export interface BerthCargo {
  id:                     number
  berthId:                number
  cargoName:              string
  maxLoadingRateCbm?:     number
  maxDischargeRateCbm?:   number
  maxManifoldPressureBar?: number
  cargoConnectionType?:   CargoConnectionType
  hoseArmSizeInch?:       number
  shoreLineSizeInch?:     number
  shoreLineLengthM?:      number
  notes?:                 string
  sync_version:           number
}

export interface BerthMaster {
  id:           number
  portId:       number
  name:         string
  notes?:       string
  sync_version: number
  berthInfo?:   BerthInfo
  cargoes?:     BerthCargo[]
}

export interface PortWithBerths extends PortMaster {
  berths: BerthMaster[]
}