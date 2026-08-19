export class HUD {
  constructor(root) {
    this.root = root;
    root.insertAdjacentHTML('beforeend', `
      <div class="hud">
        <div class="vignette"></div><div class="damage"></div>
        <div class="topbar">OPERATION<strong>BLACKSITE</strong></div>
        <button class="pause-button" type="button">Ⅱ PAUSE · ESC / P</button>
        <div class="stats"><div class="stat"><small>VITALS</small><b class="health">100</b></div><div class="stat"><small>HOSTILES DOWN</small><b class="kills">0</b></div></div>
        <div class="ammo"><span>12</span><small> / 72</small><label>MK IV SIDEARM</label></div>
        <div class="minimap-wrap"><canvas class="minimap" width="316" height="316"></canvas></div>
        <div class="crosshair"></div><div class="hitmarker">×</div><div class="message"></div>
      </div>
      <div class="overlay">
        <div class="panel"><div class="eyebrow">TACTICAL TRAINING // 01</div><h1>BLACKSITE</h1>
        <p>清除训练区内不断增援的敌对单位。点击进入战区，按 ESC 可暂停。</p>
        <div class="controls"><span><b>WASD</b> 移动</span><span><b>鼠标</b> 瞄准</span><span><b>左键</b> 射击</span><span><b>R</b> 换弹</span><span><b>SPACE</b> 跳跃</span><span><b>SHIFT</b> 冲刺</span></div>
        <div class="start">点击开始任务</div></div>
      </div>`);
    this.overlay = root.querySelector('.overlay');
    this.overlayTitle = this.overlay.querySelector('h1');
    this.overlayText = this.overlay.querySelector('p');
    this.overlayAction = this.overlay.querySelector('.start');
    this.pauseButton = root.querySelector('.pause-button');
    this.health = root.querySelector('.health');
    this.kills = root.querySelector('.kills');
    this.ammo = root.querySelector('.ammo span');
    this.reserve = root.querySelector('.ammo small');
    this.damage = root.querySelector('.damage');
    this.hitmarker = root.querySelector('.hitmarker');
    this.messageEl = root.querySelector('.message');
    this.hud = root.querySelector('.hud');
    this.minimap = root.querySelector('.minimap');
    this.mapContext = this.minimap.getContext('2d');
  }

  hideOverlay() {
    this.overlay.classList.add('hidden');
    this.overlay.classList.remove('countdown');
  }

  showPause(message = '战斗已冻结。点击继续后将在 3 秒倒计时结束时恢复。') {
    this.overlayTitle.textContent = '任务暂停';
    this.overlayText.textContent = message;
    this.overlayAction.textContent = '继续任务';
    this.overlayAction.style.display = '';
    this.overlay.classList.remove('hidden', 'countdown');
    this.pauseButton.textContent = '▶ RESUME · ESC / P';
  }

  showCountdown(value) {
    this.overlayTitle.textContent = value;
    this.overlayText.textContent = '准备返回战区';
    this.overlayAction.style.display = 'none';
    this.overlay.classList.remove('hidden');
    this.overlay.classList.add('countdown');
  }

  setRunning() {
    this.hideOverlay();
    this.pauseButton.textContent = 'Ⅱ PAUSE · ESC / P';
  }
  setHealth(value) { this.health.textContent = value; }
  setKills(value) { this.kills.textContent = value; }
  setAmmo(ammo, reserve, reloading = false) {
    this.ammo.textContent = ammo;
    this.reserve.textContent = ` / ${reserve}`;
    if (reloading) this.message('换弹中');
  }
  flashDamage() { this.#flash(this.damage, 150); }
  flashHit() { this.#flash(this.hitmarker, 90); }
  showDamage(value, hitZone) {
    const number = document.createElement('div');
    number.className = `damage-number${hitZone === 'head' ? ' headshot' : ''}`;
    number.textContent = hitZone === 'head' ? `${value} HEADSHOT` : value;
    number.style.marginLeft = `${20 + Math.random() * 22}px`;
    number.style.marginTop = `${-15 + Math.random() * 22}px`;
    this.hud.appendChild(number);
    number.addEventListener('animationend', () => number.remove(), { once: true });
  }

  updateMinimap(player, enemies, yaw) {
    const ctx = this.mapContext;
    const size = this.minimap.width;
    const center = size / 2;
    const range = 32;
    const scale = size / (range * 2);
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#071016';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = 'rgba(100,135,150,.18)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= size; i += size / 8) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(175,199,208,.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(center + (-28 - player.x) * scale, center + (-28 - player.z) * scale, 56 * scale, 56 * scale);

    ctx.fillStyle = '#ef4b3e';
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const x = center + (enemy.body.position.x - player.x) * scale;
      const y = center + (enemy.body.position.z - player.z) * scale;
      if (x < 5 || y < 5 || x > size - 5 || y > size - 5) continue;
      ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    }

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(-yaw);
    ctx.fillStyle = '#f3b33d';
    ctx.beginPath();
    ctx.moveTo(0, -13); ctx.lineTo(9, 10); ctx.lineTo(0, 6); ctx.lineTo(-9, 10); ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  message(text, duration = 900) {
    this.messageEl.textContent = text;
    this.messageEl.classList.add('show');
    clearTimeout(this.messageTimer);
    this.messageTimer = setTimeout(() => this.messageEl.classList.remove('show'), duration);
  }
  gameOver() {
    document.exitPointerLock();
    this.overlay.classList.remove('hidden', 'countdown');
    this.overlayTitle.textContent = '任务失败';
    this.overlayText.textContent = '点击重新部署并继续训练。';
    this.overlayAction.textContent = '重新部署';
    this.overlayAction.style.display = '';
    this.overlay.onclick = () => location.reload();
  }
  #flash(element, duration) {
    element.classList.add('show');
    setTimeout(() => element.classList.remove('show'), duration);
  }
}
