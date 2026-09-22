export const CIRCLE_STAGES = [6, 12, 24] as const;

export function polygonPoints(sides: number, radius = 42, cx = 60, cy = 60): string {
  if (!Number.isInteger(sides) || sides < 3 || sides > 96) throw new RangeError("Unsupported polygon");
  return Array.from({ length: sides }, (_, i) => {
    const angle = i * Math.PI * 2 / sides - Math.PI / 2;
    return `${(cx + radius * Math.cos(angle)).toFixed(6)},${(cy + radius * Math.sin(angle)).toFixed(6)}`;
  }).join(" ");
}

export function radialGap(sides: number, radius = 42): number {
  return radius * (1 - Math.cos(Math.PI / sides));
}
