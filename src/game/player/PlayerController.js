export class PlayerController {
  constructor(physics, camera, cameraHandler) {
    this.physics = physics;
    this.camera = camera;
    this.cameraHandler = cameraHandler;
    this.body = physics.addSphere({ position: [0, 1.05, 12], radius: 0.52, mass: 7 });
    this.body.linearDamping = 0.18;
    // 玩家由输入持续控制，不能让 Cannon 在开始界面期间将其休眠。
    this.body.allowSleep = false;
    this.keys = new Set();
    this.health = 100;
    this.alive = true;
    this.onDamage = null;
    this.onDeath = null;

    addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (this.#isMovementKey(e.code)) {
        e.preventDefault();
        this.body.wakeUp();
      }
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
  }

  update() {
    if (!this.alive) return;
    const forward = Number(this.keys.has('KeyW')) - Number(this.keys.has('KeyS'));
    const strafe = Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA'));
    const length = Math.hypot(forward, strafe) || 1;
    const yaw = this.cameraHandler.yaw;
    const speed = this.keys.has('ShiftLeft') ? 9.2 : 6.5;
    if (forward !== 0 || strafe !== 0) this.body.wakeUp();
    this.body.velocity.x = ((Math.sin(yaw) * -forward + Math.cos(yaw) * strafe) / length) * speed;
    this.body.velocity.z = ((Math.cos(yaw) * -forward - Math.sin(yaw) * strafe) / length) * speed;

    const grounded = this.body.position.y <= 0.58 && Math.abs(this.body.velocity.y) < 1.2;
    if (this.keys.has('Space') && grounded) this.body.velocity.y = 8.2;

    this.camera.position.set(this.body.position.x, this.body.position.y + 0.62, this.body.position.z);
    if (this.body.position.y < -8) this.respawn();
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.health = Math.max(0, this.health - amount);
    this.onDamage?.(this.health);
    if (this.health === 0) {
      this.alive = false;
      this.onDeath?.();
    }
  }

  respawn() {
    this.body.position.set(0, 1.05, 12);
    this.body.velocity.setZero();
    this.health = 100;
    this.alive = true;
  }

  clearInput() {
    this.keys.clear();
    this.body.velocity.x = 0;
    this.body.velocity.z = 0;
  }

  #isMovementKey(code) {
    return ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft'].includes(code);
  }
}
