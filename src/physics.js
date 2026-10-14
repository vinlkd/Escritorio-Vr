export const PLAYER_RADIUS = 0.38;
export function canOccupy(x, z, colliders, bounds, radius = PLAYER_RADIUS) {
  if (
    x - radius < bounds.minX ||
    x + radius > bounds.maxX ||
    z - radius < bounds.minZ ||
    z + radius > bounds.maxZ
  )
    return false;
  return !colliders.some((c) => {
    const nearX = Math.max(c.minX, Math.min(x, c.maxX));
    const nearZ = Math.max(c.minZ, Math.min(z, c.maxZ));
    return (x - nearX) ** 2 + (z - nearZ) ** 2 < radius ** 2;
  });
}
export function moveWithCollisions(
  position,
  dx,
  dz,
  colliders,
  bounds,
  radius = PLAYER_RADIUS,
) {
  // Divido o passo em trechos pequenos para ninguém atravessar um móvel quando a imagem engasga.
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / (radius * 0.5)));
  const result = { x: position.x, z: position.z };
  for (let i = 0; i < steps; i++) {
    if (canOccupy(result.x + dx / steps, result.z, colliders, bounds, radius))
      result.x += dx / steps;
    if (canOccupy(result.x, result.z + dz / steps, colliders, bounds, radius))
      result.z += dz / steps;
  }
  return result;
}
export function deadzone(value, threshold = 0.15) {
  return Math.abs(value) < threshold
    ? 0
    : (Math.sign(value) * (Math.abs(value) - threshold)) / (1 - threshold);
}
export function localToWorld(x, z, yaw) {
  const length = Math.hypot(x, z);
  if (length > 1) {
    x /= length;
    z /= length;
  }
  return {
    x: x * Math.cos(yaw) + z * Math.sin(yaw),
    z: z * Math.cos(yaw) - x * Math.sin(yaw),
  };
}
