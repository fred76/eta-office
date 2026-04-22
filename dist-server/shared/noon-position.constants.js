"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOORED_OPERATIONS = exports.VESSEL_STATUSES = exports.VOYAGE_CONDITIONS = exports.SEA_STATES = exports.WIND_DIRECTIONS = void 0;
exports.WIND_DIRECTIONS = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];
exports.SEA_STATES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
exports.VOYAGE_CONDITIONS = ['LADEN', 'BALLAST'];
exports.VESSEL_STATUSES = ['AT_SEA', 'AT_ANCHOR', 'IN_PORT', 'CANAL_TRANSIT'];
exports.MOORED_OPERATIONS = ['LOADING', 'DISCHARGING', 'IDLE', 'BUNKERING', 'OTHER'];
