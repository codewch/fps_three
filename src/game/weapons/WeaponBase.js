export class WeaponBase {
  constructor({ magazineSize, reserveAmmo, fireRate, reloadTime, damage }) {
    this.magazineSize = magazineSize;
    this.ammo = magazineSize;
    this.reserveAmmo = reserveAmmo;
    this.fireRate = fireRate;
    this.reloadTime = reloadTime;
    this.damage = damage;
    this.lastShot = -Infinity;
    this.reloading = false;
    this.onAmmoChange = null;
  }

  canShoot(now) {
    return !this.reloading && this.ammo > 0 && now - this.lastShot >= 1000 / this.fireRate;
  }

  beginShot(now) {
    if (!this.canShoot(now)) return false;
    this.lastShot = now;
    this.ammo--;
    this.onAmmoChange?.(this.ammo, this.reserveAmmo);
    return true;
  }

  reload() {
    if (this.reloading || this.ammo === this.magazineSize || this.reserveAmmo === 0) return;
    this.reloading = true;
    this.onAmmoChange?.(this.ammo, this.reserveAmmo, true);
    setTimeout(() => {
      const needed = this.magazineSize - this.ammo;
      const loaded = Math.min(needed, this.reserveAmmo);
      this.ammo += loaded;
      this.reserveAmmo -= loaded;
      this.reloading = false;
      this.onAmmoChange?.(this.ammo, this.reserveAmmo, false);
    }, this.reloadTime * 1000);
  }
}
