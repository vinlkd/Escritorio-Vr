import test from "node:test";
import assert from "node:assert/strict";
import {
  canOccupy,
  moveWithCollisions,
  localToWorld,
  deadzone,
} from "../src/physics.js";

const bounds = { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };
const machine = [{ minX: 1, maxX: 3, minZ: -2, maxZ: 2 }];
test("a pessoa fica dentro do ambiente, considerando o espaço do corpo", () => {
  assert.equal(canOccupy(9.7, 0, [], bounds), false);
  const p = moveWithCollisions({ x: 0, z: 0 }, 20, 0, [], bounds);
  assert.ok(p.x <= 9.62 && p.x > 9.3);
});
test("um passo longo não atravessa os móveis", () => {
  const p = moveWithCollisions({ x: 0, z: 0 }, 8, 0, machine, bounds);
  assert.ok(p.x < 0.63);
  assert.equal(canOccupy(p.x, p.z, machine, bounds), true);
});
test("é possível contornar um móvel sem entrar nele", () => {
  const p = moveWithCollisions({ x: 0.6, z: 0 }, 1, 1, machine, bounds);
  assert.ok(p.x <= 0.62);
  assert.ok(p.z > 0.9);
});
test("andar na diagonal não aumenta a velocidade", () => {
  const p = localToWorld(1, -1, 0);
  assert.ok(Math.abs(Math.hypot(p.x, p.z) - 1) < 1e-10);
});
test("a caminhada acompanha a direção do olhar", () => {
  const p = localToWorld(0, -1, Math.PI / 2);
  assert.ok(Math.abs(p.x + 1) < 1e-10);
  assert.ok(Math.abs(p.z) < 1e-10);
});
test("a zona morta evita movimento involuntário do analógico", () => {
  assert.equal(deadzone(0.1), 0);
  assert.equal(deadzone(-0.1), 0);
  assert.equal(deadzone(1), 1);
  assert.equal(deadzone(-1), -1);
});
