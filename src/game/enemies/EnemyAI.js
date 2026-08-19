import * as THREE from 'three';

export class EnemyAI {
  constructor({ scene, physics, player, position, onKilled }) {
    this.scene = scene;
    this.physics = physics;
    this.player = player;
    this.spawnPosition = position;
    this.onKilled = onKilled;
    this.health = 100;
    this.alive = true;
    this.state = 'patrol';
    this.attackTimer = 0;
    this.patrolAngle = Math.random() * Math.PI * 2;
    this.body = physics.addSphere({ position, radius: 0.55, mass: 4 });
    this.body.linearDamping = 0.4;
    // AI 会直接驱动刚体速度，休眠会阻止巡逻和追踪移动。
    this.body.allowSleep = false;
    this.mesh = this.#createMesh();
    this.mesh.userData.enemy = this;
    scene.add(this.mesh);
  }

  #createMesh() {
    const group = new THREE.Group();
    const armor = new THREE.MeshStandardMaterial({ color: 0x7e2024, roughness: 0.75, metalness: 0.15 });
    const black = new THREE.MeshStandardMaterial({ color: 0x151a1e, roughness: 0.9 });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.7, 5, 8), armor);
    body.position.y = 0.58;
    body.castShadow = true;
    body.userData.hitZone = 'body';
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), black);
    head.position.y = 1.35;
    head.castShadow = true;
    head.userData.hitZone = 'head';
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.08), new THREE.MeshBasicMaterial({ color: 0xff4b2e }));
    visor.position.set(0, 1.38, -0.25);
    visor.userData.hitZone = 'head';
    group.add(body, head, visor);
    return group;
  }

  update(delta) {
    if (!this.alive || !this.player.alive) return;
    const dx = this.player.body.position.x - this.body.position.x;
    const dz = this.player.body.position.z - this.body.position.z;
    const distance = Math.hypot(dx, dz);
    this.state = distance < 3.2 ? 'attack' : distance < 18 ? 'chase' : 'patrol';

    if (this.state === 'chase') {
      this.body.velocity.x = (dx / distance) * 3.1;
      this.body.velocity.z = (dz / distance) * 3.1;
    } else if (this.state === 'patrol') {
      this.patrolAngle += delta * 0.45;
      this.body.velocity.x = Math.cos(this.patrolAngle) * 1.1;
      this.body.velocity.z = Math.sin(this.patrolAngle) * 1.1;
    } else {
      this.body.velocity.x *= 0.2;
      this.body.velocity.z *= 0.2;
      this.attackTimer -= delta;
      if (this.attackTimer <= 0) {
        this.player.takeDamage(12);
        this.attackTimer = 0.85;
      }
    }
    this.mesh.position.copy(this.body.position);
    this.mesh.position.y -= 0.52;
    this.mesh.rotation.y = Math.atan2(dx, dz) + Math.PI;
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) this.die();
  }

  die() {
    this.alive = false;
    this.scene.remove(this.mesh);
    this.physics.removeBody(this.body);
    this.onKilled?.(this);
  }
}
