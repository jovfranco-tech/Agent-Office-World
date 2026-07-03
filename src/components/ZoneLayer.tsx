/**
 * ZoneLayer — thin wrapper exposing zone logic for the rest of the UI.
 *
 * The actual zone floor rendering lives in OfficeFloor (so floor + zones share
 * the same coordinate pass). This module re-exports zone helpers and provides
 * a small presentational badge used by the legend / inspectors.
 */
import type { OfficeZone } from "../types";

export function ZoneBadge({ zone }: { zone: OfficeZone }) {
  return (
    <span
      className="chip"
      style={{ borderColor: `${zone.color}aa`, background: `${zone.color}33` }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 2,
          background: zone.color,
          display: "inline-block",
        }}
      />
      {zone.name}
    </span>
  );
}

export default ZoneBadge;
