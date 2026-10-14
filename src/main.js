import "./style.css";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildWorld, HALL, OFFICE_SPAWN } from "./world.js";
import { moveWithCollisions, deadzone, localToWorld } from "./physics.js";

const $ = (selector) => document.querySelector(selector);
const canvas = $("#world");
function showRenderFailure() {
  $("#loading").hidden = true;
  $("#joystick").hidden = true;
  $("#retry").hidden = false;
}
$("#retry").addEventListener("click", () => location.reload());
try { start(); } catch (error) { console.error(error); showRenderFailure(); }

function start() {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#c9e1ed");
  scene.fog = new THREE.Fog("#c9e1ed", 80, 210);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(environment, 0.04);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.38;
  environment.dispose();
  pmrem.dispose();
  const sky = new THREE.HemisphereLight("#f2f4eb", "#768b7a", 1.9);
  scene.add(sky);
  const sun = new THREE.DirectionalLight("#fff1d6", 3.5);
  sun.position.set(-20, 18, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -25;
  sun.shadow.camera.right = 25;
  sun.shadow.camera.top = 25;
  sun.shadow.camera.bottom = -25;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 130;
  sun.shadow.normalBias = 0.035;
  sun.shadow.bias = -0.0002;
  sun.shadow.intensity = 0.55;
  scene.add(sun);
  const fill = new THREE.DirectionalLight("#d4e5ee", 0.9);
  fill.position.set(25, 15, -12);
  scene.add(fill);
  const world = buildWorld(scene);
  const camera = new THREE.PerspectiveCamera(
    64,
    innerWidth / innerHeight,
    0.08,
    220,
  );
  const spawn = OFFICE_SPAWN;
  let player = { ...spawn };
  const speed = 2.8, sensitivity = 1;
  let lastTime = performance.now();
  const keys = new Set();
  const joystick = { x: 0, z: 0, id: null };
  const look = { id: null, x: 0, y: 0 };
  let gamepadConnected = false;

  function applyPlayer() {
    camera.position.set(player.x, player.y, player.z);
    camera.rotation.set(player.pitch, player.yaw, 0, "YXZ");
  }
  applyPlayer();
  function clearJoystick() {
    joystick.id = null;
    joystick.x = joystick.z = 0;
    $("#stick").style.transform = "translate(0,0)";
  }
  function clearInput() {
    keys.clear();
    clearJoystick();
    look.id = null;
  }
  function resetPosition() {
    player = { ...spawn };
    clearInput();
    applyPlayer();
  }

  // Cada dedo controla uma coisa: dá para andar no joystick e olhar em volta ao mesmo tempo.
  const stickArea = $("#joystick");
  function moveStick(event) {
    const bounds = stickArea.getBoundingClientRect(),
      range = bounds.width * 0.3;
    let x = event.clientX - bounds.left - bounds.width / 2,
      z = event.clientY - bounds.top - bounds.height / 2;
    const length = Math.hypot(x, z);
    if (length > range) {
      x *= range / length;
      z *= range / length;
    }
    joystick.x = x / range;
    joystick.z = z / range;
    $("#stick").style.transform = `translate(${x}px,${z}px)`;
  }
  stickArea.addEventListener("pointerdown", (event) => {
    if (joystick.id !== null || event.button !== 0) return;
    event.preventDefault();
    joystick.id = event.pointerId;
    stickArea.setPointerCapture(event.pointerId);
    moveStick(event);
  });
  stickArea.addEventListener("pointermove", (event) => {
    if (event.pointerId === joystick.id) moveStick(event);
  });
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
    stickArea.addEventListener(name, (event) => {
      if (event.pointerId === joystick.id) clearJoystick();
    });
  canvas.addEventListener("pointerdown", (event) => {
    if (
      event.button !== 0 ||
      look.id !== null ||
      document.pointerLockElement === canvas
    )
      return;
    look.id = event.pointerId;
    look.x = event.clientX;
    look.y = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });
  function rotate(dx, dy) {
    player.yaw -= dx * 0.003 * sensitivity;
    player.pitch = THREE.MathUtils.clamp(
      player.pitch - dy * 0.0025 * sensitivity,
      -1.25,
      1.25,
    );
  }
  canvas.addEventListener("pointermove", (event) => {
    if (
      document.pointerLockElement === canvas
    )
      return;
    if (look.id === event.pointerId) {
      rotate(event.clientX - look.x, event.clientY - look.y);
      look.x = event.clientX;
      look.y = event.clientY;
    }
  });
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
    canvas.addEventListener(name, (event) => {
      if (look.id === event.pointerId) look.id = null;
    });
  canvas.addEventListener("dblclick", async () => {
    if (
      !matchMedia("(pointer:fine)").matches
    )
      return;
    try {
      await canvas.requestPointerLock();
    } catch {
      // Se o navegador não prender o mouse, ainda dá para olhar arrastando a cena.
    }
  });
  document.addEventListener("mousemove", (event) => {
    if (
      document.pointerLockElement === canvas
    )
      rotate(event.movementX, event.movementY);
  });
  document.addEventListener("pointerlockchange", clearInput);
  window.addEventListener("keydown", (event) => {
    if (
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      ["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)
    )
      return;
    if (
      [
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ShiftLeft",
        "ShiftRight",
      ].includes(event.code)
    ) {
      event.preventDefault();
      keys.add(event.code);
    }
    if (event.repeat) return;
    if (event.code === "KeyR") resetPosition();
  });
  window.addEventListener("keyup", (event) => keys.delete(event.code));
  window.addEventListener("blur", clearInput);
  document.addEventListener("visibilitychange", () => {
    clearInput();
    lastTime = performance.now();
  });
  window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    renderer.setAnimationLoop(null);
    clearInput();
    showRenderFailure();
  });

  renderer.setAnimationLoop((now) => {
    const frameSeconds = Math.max((now - lastTime) / 1000, 0);
    const dt = Math.min(frameSeconds, 0.05);
    lastTime = now;
    if (document.hidden) return;
    world.update(player, dt);
    let gamepad = null;
    if (navigator.getGamepads)
      gamepad = Array.from(navigator.getGamepads()).find(
        (p) => p?.connected && p.mapping === "standard",
      );
    gamepadConnected = !!gamepad;
    {
      const gx = gamepad ? deadzone(gamepad.axes[0] ?? 0) : 0,
        gz = gamepad ? deadzone(gamepad.axes[1] ?? 0) : 0;
      const x =
        joystick.x + Number(keys.has("KeyD")) - Number(keys.has("KeyA")) + gx;
      const z =
        joystick.z +
        Number(keys.has("KeyS") || keys.has("ArrowDown")) -
        Number(keys.has("KeyW") || keys.has("ArrowUp")) +
        gz;
      const turn =
        Number(keys.has("ArrowLeft")) - Number(keys.has("ArrowRight"));
      player.yaw += turn * dt * 1.5;
      if (gamepad) {
        player.yaw -= deadzone(gamepad.axes[2] ?? 0) * dt * 2 * sensitivity;
        player.pitch = THREE.MathUtils.clamp(
          player.pitch -
            deadzone(gamepad.axes[3] ?? 0) * dt * 1.6 * sensitivity,
          -1.25,
          1.25,
        );
      }
      const direction = localToWorld(x, z, player.yaw);
      const running =
        keys.has("ShiftLeft") ||
        keys.has("ShiftRight") ||
        (gamepad?.buttons[7]?.value ?? 0) > 0.5;
      const velocity = speed * (running ? 1.75 : 1) * dt;
      const next = moveWithCollisions(
        player,
        direction.x * velocity,
        direction.z * velocity,
        world.colliders,
        HALL,
      );
      player.x = next.x;
      player.z = next.z;
      applyPlayer();
    }
    renderer.render(scene, camera);
  });
  renderer.render(scene, camera);
  $("#loading").hidden = true;
  // Estes dados ajudam a conferir a navegação durante o desenvolvimento e não aparecem na tela.
  if (import.meta.env.DEV)
    Object.defineProperty(window, "__patio", {
      value: Object.freeze({
        get state() {
          return {
            player: { ...player },
            joystick: { ...joystick },
            gamepadConnected,
            speed,
            sensitivity,
            drawCalls: renderer.info.render.calls,
            triangles: renderer.info.render.triangles,
          };
        },
        get colliders() {
          return world.colliders.map((c) => ({ ...c }));
        },
      }),
    });
}
