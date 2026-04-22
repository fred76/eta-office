"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFleetReport = getFleetReport;
const client_1 = require("../db/client");
async function getFleetReport() {
    const ships = await client_1.db.query.ships.findMany({
        with: {
            rotationLatest: true,
            mooringLatest: true,
            machineryLatest: true,
        },
        orderBy: (s, { asc }) => asc(s.name),
    });
    return ships.map(s => {
        const rotation = s.rotationLatest?.data;
        const mooring = s.mooringLatest;
        const lines = mooring?.lines ?? [];
        // Bunker consumption: sum foConsumptionForTransit across all activities
        let foConsumed = 0;
        let doConsumed = 0;
        let speeds = [];
        if (rotation?.ports) {
            for (const port of rotation.ports) {
                for (const act of port.activities ?? []) {
                    foConsumed += act.foConsumptionForTransit ?? 0;
                    doConsumed += act.doConsumptionForTransit ?? 0;
                    if (act.speedKts)
                        speeds.push(act.speedKts);
                }
            }
        }
        const avgSpeed = speeds.length
            ? Math.round((speeds.reduce((a, b) => a + b, 0) / speeds.length) * 10) / 10
            : null;
        const redCount = lines.filter((l) => computeTL(l) === 'RED').length;
        const amberCount = lines.filter((l) => computeTL(l) === 'AMBER').length;
        const greenCount = lines.filter((l) => computeTL(l) === 'GREEN').length;
        return {
            shipId: s.id,
            shipName: s.name,
            lastSyncAt: s.lastSyncAt,
            foConsumedMt: Math.round(foConsumed * 10) / 10,
            doConsumedMt: Math.round(doConsumed * 10) / 10,
            avgSpeedKts: avgSpeed,
            mooring: { red: redCount, amber: amberCount, green: greenCount, total: lines.length },
        };
    });
}
function computeTL(line) {
    if (line.status === 'RETIRED' || line.status === 'OUT_OF_SERVICE')
        return 'GREY';
    const last = line.inspections?.[line.inspections.length - 1];
    if (!last)
        return 'GREY';
    if (last.actionRequired === 'RETIRE' || last.overallCondition === 'RETIRE')
        return 'RED';
    if (last.actionRequired === 'EARLY_REINSPECTION' || last.wearZoneStatus === 'CRITICAL')
        return 'RED';
    if (last.actionRequired === 'MONITOR' || last.overallCondition === 'MARGINAL')
        return 'AMBER';
    if (last.wearZoneStatus === 'MONITOR')
        return 'AMBER';
    return 'GREEN';
}
