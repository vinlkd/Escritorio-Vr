import test from "node:test";
import assert from "node:assert/strict";
import { Scene } from "three";
import { buildWorld, HALL, OFFICE_SPAWN } from "../src/world.js";
import { canOccupy, moveWithCollisions } from "../src/physics.js";

const world = buildWorld(new Scene());
const { colliders } = world;

test("a posição inicial fica em um ponto livre do escritório", () => {
  assert.equal(canOccupy(OFFICE_SPAWN.x, OFFICE_SPAWN.z, colliders, HALL), true);
});

test("o corredor central continua livre até as janelas", () => {
  const end = moveWithCollisions(OFFICE_SPAWN, 0, -22, colliders, HALL);
  assert.ok(Math.abs(end.z - (OFFICE_SPAWN.z - 22)) < 1e-8);
});

test("as cabines maiores deixam uma passagem livre ao lado das janelas", () => {
  const fim=moveWithCollisions({x:-11.2,z:9},0,-22,colliders,HALL);
  assert.ok(Math.abs(fim.z+13)<1e-8);
});

test("há espaço para atravessar entre as duas fileiras da direita", () => {
  const fim=moveWithCollisions({x:0,z:1.2},11,0,colliders,HALL);
  assert.ok(Math.abs(fim.x-11)<1e-8);
});

test("a bancada recuada mantém a passagem em frente à sala de reunião", () => {
  const fim=moveWithCollisions({x:0,z:-6.8},11,0,colliders,HALL);
  assert.ok(Math.abs(fim.x-11)<1e-8);
});

test("a entrada da reunião fica livre e as divisórias de vidro bloqueiam a passagem", () => {
  assert.equal(canOccupy(10, -7.8, colliders, HALL), true);
  assert.equal(canOccupy(7.4, -7.8, colliders, HALL), false);
  assert.equal(canOccupy(5.8, -11.15, colliders, HALL), false);
  assert.equal(canOccupy(4.6, -10, colliders, HALL), true);
});

test("mesas, cadeiras, sofás e bancada do café têm colisão", () => {
  for (const [x,z] of [[-7,-2.5],[-8.55,-.05],[9.5,13.4],[-9.5,13.8]]) {
    assert.equal(canOccupy(x,z,colliders,HALL), false);
  }
});

test("os cantos de café e sofás têm paredes, com entrada livre pela lateral", () => {
  assert.equal(canOccupy(-7,10.4,colliders,HALL), false);
  assert.equal(canOccupy(10,8.65,colliders,HALL), false);
  const cafe=moveWithCollisions({x:0,z:12},-7,0,colliders,HALL);
  const sofas=moveWithCollisions({x:0,z:10},6,0,colliders,HALL);
  assert.ok(Math.abs(cafe.x+7)<1e-8);
  assert.ok(Math.abs(sofas.x-6)<1e-8);
});

test("a porta abre dos dois lados e permite entrar no vestíbulo", () => {
  assert.equal(canOccupy(0,15,colliders,HALL), false);
  world.update({x:0,z:13},1);
  assert.equal(canOccupy(0,15,colliders,HALL), true);
  const end=moveWithCollisions({x:0,z:13},0,4,colliders,HALL);
  assert.ok(Math.abs(end.z-17)<1e-8);
  world.update({x:0,z:9},2);
  assert.equal(canOccupy(0,15,colliders,HALL), false);
  world.update({x:0,z:17},1);
  assert.equal(canOccupy(0,15,colliders,HALL), true);
});

test("as paredes da entrada e do vestíbulo não podem ser atravessadas", () => {
  assert.equal(canOccupy(5,15,colliders,HALL), false);
  assert.equal(canOccupy(5,17,colliders,HALL), false);
  assert.equal(canOccupy(0,18,colliders,HALL), true);
});
