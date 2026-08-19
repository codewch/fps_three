import * as THREE from 'three';
import './style.css';
import { SceneManager } from './game/core/SceneManager.js';
import { GameLoop } from './game/core/GameLoop.js';
import { PhysicsWorld } from './game/physics/PhysicsWorld.js';
import { CameraHandler } from './game/player/CameraHandler.js';
import { PlayerController } from './game/player/PlayerController.js';
import { Pistol } from './game/weapons/Pistol.js';
import { EnemyAI } from './game/enemies/EnemyAI.js';
import { HUD } from './game/ui/HUD.js';

const app = document.querySelector('#app');
const sceneManager = new SceneManager(app);
const physics = new PhysicsWorld();
const hud = new HUD(app);
const gameState = { started: false, paused: true, resuming: false, gameOver: false };
let resumeTimer = null;
const cameraHandler = new CameraHandler(sceneManager.camera, sceneManager.renderer.domElement, handlePointerLock);
const player = new PlayerController(physics, sceneManager.camera, cameraHandler);
const enemies = [];
let kills = 0;
let spawnTimer = 0;

sceneManager.scene.add(sceneManager.camera);
createArena();

const pistol = new Pistol(sceneManager.camera, enemies);
pistol.onAmmoChange = (ammo, reserve, reloading) => hud.setAmmo(ammo, reserve, reloading);
pistol.onHit = ({ damage, hitZone }) => {
  hud.flashHit();
  hud.showDamage(damage, hitZone);
};
player.onDamage = (health) => { hud.setHealth(health); hud.flashDamage(); };
player.onDeath = () => {
  gameState.gameOver = true;
  gameState.paused = true;
  hud.gameOver();
};
hud.overlay.addEventListener('click', () => {
  if (gameState.gameOver || gameState.resuming) return;
  if (!gameState.started) {
    gameState.started = true;
    gameState.paused = false;
    hud.setRunning();
    sceneManager.renderer.domElement.requestPointerLock();
  } else if (gameState.paused) {
    beginResume();
  }
});
hud.pauseButton.addEventListener('click', (event) => {
  event.stopPropagation();
  if (!gameState.started || gameState.gameOver || gameState.resuming) return;
  if (gameState.paused) beginResume();
  else pauseGame();
});

for (const position of [[-9, 1, -8], [8, 1, -14], [0, 1, -22], [14, 1, 1]]) spawnEnemy(position);

addEventListener('mousedown', (event) => {
  if (event.button === 0 && cameraHandler.locked && player.alive && !gameState.paused) pistol.shoot();
});
addEventListener('keydown', (event) => {
  if (event.code === 'KeyR' && !gameState.paused) pistol.reload();
  if (event.code === 'KeyP' && gameState.started && !gameState.gameOver && !event.repeat) {
    if (gameState.resuming) return;
    if (gameState.paused) beginResume();
    else pauseGame();
  }
});

function handlePointerLock(locked) {
  if (!locked && gameState.started && !gameState.gameOver && !gameState.resuming) pauseGame(false);
}

function pauseGame(releasePointer = true) {
  if (gameState.gameOver) return;
  gameState.paused = true;
  gameState.resuming = false;
  clearInterval(resumeTimer);
  player.clearInput();
  hud.showPause();
  if (releasePointer && cameraHandler.locked) document.exitPointerLock();
}

function beginResume() {
  gameState.resuming = true;
  let seconds = 3;
  hud.showCountdown(seconds);
  sceneManager.renderer.domElement.requestPointerLock();
  clearInterval(resumeTimer);
  resumeTimer = setInterval(() => {
    seconds--;
    if (seconds > 0) {
      hud.showCountdown(seconds);
      return;
    }
    clearInterval(resumeTimer);
    gameState.resuming = false;
    if (!cameraHandler.locked) {
      gameState.paused = true;
      hud.showPause('鼠标锁定未成功，请再次点击继续任务。');
      return;
    }
    gameState.paused = false;
    hud.setRunning();
  }, 1000);
}

function createArena() {
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x26333a, roughness: 0.92, metalness: 0.08 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(56, 56), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  sceneManager.scene.add(floor);
  physics.addBox({ position: [0, -0.25, 0], halfExtents: [28, 0.25, 28] });

  const grid = new THREE.GridHelper(56, 28, 0x4b5c63, 0x303c42);
  grid.position.y = 0.012;
  sceneManager.scene.add(grid);
  const blocks = [
    [[0, 2, -28], [28, 2, 0.5]], [[0, 2, 28], [28, 2, 0.5]],
    [[-28, 2, 0], [0.5, 2, 28]], [[28, 2, 0], [0.5, 2, 28]],
    [[-7, 1.5, -5], [2.5, 1.5, 1]], [[9, 1.2, -9], [1.4, 1.2, 3]],
    [[2, 1, 5], [3, 1, 1.3]], [[-13, 1.25, 10], [1.5, 1.25, 3]]
  ];
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x34424a, roughness: 0.78, metalness: 0.25 });
  for (const [position, half] of blocks) {
    physics.addBox({ position, halfExtents: half });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(half[0] * 2, half[1] * 2, half[2] * 2), wallMaterial);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    sceneManager.scene.add(mesh);
  }

  for (let i = 0; i < 8; i++) {
    const light = new THREE.PointLight(0xf3a52e, 8, 8, 2);
    light.position.set(-21 + (i % 4) * 14, 3, i < 4 ? -20 : 20);
    sceneManager.scene.add(light);
  }
}

function spawnEnemy(position) {
  const enemy = new EnemyAI({
    scene: sceneManager.scene, physics, player, position,
    onKilled: () => {
      kills++;
      hud.setKills(kills);
      hud.message('目标清除');
    }
  });
  enemies.push(enemy);
}

function update(delta) {
  if (gameState.paused) return;
  physics.step(delta);
  player.update(delta);
  pistol.update(delta);
  for (const enemy of enemies) enemy.update(delta);
  hud.updateMinimap(player.body.position, enemies, cameraHandler.yaw);
  spawnTimer += delta;
  if (spawnTimer > 8 && enemies.filter((enemy) => enemy.alive).length < 8) {
    const angle = Math.random() * Math.PI * 2;
    spawnEnemy([Math.cos(angle) * 22, 1, Math.sin(angle) * 22]);
    spawnTimer = 0;
    hud.message('侦测到敌方增援');
  }
}

new GameLoop(update, () => sceneManager.render()).start();
