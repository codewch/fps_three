import * as CANNON from 'cannon-es';

export class PhysicsWorld {
  constructor() {
    this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, -22, 0) });
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
    this.material = new CANNON.Material('world');
    this.world.defaultContactMaterial.friction = 0.05;
    this.world.defaultContactMaterial.restitution = 0;
  }

  addBox({ position, halfExtents, mass = 0, material = this.material }) {
    const body = new CANNON.Body({ mass, material, position: new CANNON.Vec3(...position) });
    body.addShape(new CANNON.Box(new CANNON.Vec3(...halfExtents)));
    this.world.addBody(body);
    return body;
  }

  addSphere({ position, radius, mass = 1 }) {
    const body = new CANNON.Body({ mass, material: this.material, position: new CANNON.Vec3(...position) });
    body.addShape(new CANNON.Sphere(radius));
    body.linearDamping = 0.1;
    body.fixedRotation = true;
    body.updateMassProperties();
    this.world.addBody(body);
    return body;
  }

  step(delta) { this.world.step(1 / 60, delta, 4); }
  removeBody(body) { this.world.removeBody(body); }
}
