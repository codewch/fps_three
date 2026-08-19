import * as THREE from 'three';
import { WeaponBase } from './WeaponBase.js';

export class Pistol extends WeaponBase {
  constructor(camera, enemies) {
    super({ magazineSize: 12, reserveAmmo: 72, fireRate: 360, reloadTime: 1.35, damage: 34 });
    this.camera = camera;
    this.enemies = enemies;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 80;
    this.onHit = null;
    this.model = this.#createModel();
    camera.add(this.model);
  }

  #createModel() {
    const group = new THREE.Group();
    const dark = new THREE.MeshStandardMaterial({ color: 0x15191d, roughness: 0.35, metalness: 0.75 });
    const accent = new THREE.MeshStandardMaterial({ color: 0xc58a25, roughness: 0.45, metalness: 0.55 });
    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.16, 0.55), dark);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.34, 0.18), accent);
    grip.position.set(0, -0.19, 0.12);
    grip.rotation.x = -0.17;
    group.add(slide, grip);
    group.position.set(0.32, -0.28, -0.56);
    group.rotation.set(-0.08, Math.PI, 0);
    return group;
  }

  shoot(now = performance.now()) {
    if (!this.beginShot(now)) {
      if (this.ammo === 0) this.reload();
      return;
    }
    this.model.position.z += 0.07;
    this.model.rotation.x -= 0.09;
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const targets = this.enemies.filter((e) => e.alive).map((e) => e.mesh);
    const hit = this.raycaster.intersectObjects(targets, true)[0];
    if (hit) {
      const hitZone = hit.object.userData.hitZone ?? 'body';
      const multiplier = hitZone === 'head' ? 2 : 1;
      const damage = Math.round(this.damage * multiplier);
      let target = hit.object;
      while (target && !target.userData.enemy) target = target.parent;
      if (target?.userData.enemy) {
        target.userData.enemy.takeDamage(damage);
        this.onHit?.({ damage, hitZone, point: hit.point });
      }
    }
  }

  update(delta) {
    this.model.position.z += (-0.56 - this.model.position.z) * Math.min(1, delta * 18);
    this.model.rotation.x += (-0.08 - this.model.rotation.x) * Math.min(1, delta * 18);
  }
}
