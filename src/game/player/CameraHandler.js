export class CameraHandler {
  constructor(camera, element, onLockChange) {
    this.camera = camera;
    this.element = element;
    this.yaw = 0;
    this.pitch = 0;
    this.locked = false;

    element.addEventListener('click', () => {
      if (!this.locked) element.requestPointerLock();
    });
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === element;
      onLockChange?.(this.locked);
    });
    document.addEventListener('mousemove', (event) => {
      if (!this.locked) return;
      this.yaw -= event.movementX * 0.002;
      this.pitch -= event.movementY * 0.002;
      this.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.pitch));
      camera.rotation.set(this.pitch, this.yaw, 0);
    });
  }
}
