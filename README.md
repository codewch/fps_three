# BLACKSITE // Three.js FPS

一款基于 Three.js 和 Cannon-es 构建、运行于浏览器中的第一人称射击训练场游戏。

## 功能

- Pointer Lock 第一人称鼠标视角
- WASD 移动、冲刺和跳跃
- Cannon-es 刚体移动与场景碰撞
- 手枪射击、后坐力、弹药和换弹
- 头部与躯干独立伤害判定
- 敌人巡逻、追踪和近距离攻击状态机
- 实时小地图、生命值、弹药量和击杀数 HUD
- 命中数字、爆头、受击和增援提示
- `Esc`/`P` 暂停与三秒恢复倒计时
- GLTF/GLB 模型加载接口

## 环境要求

- Node.js 20 或更高版本
- npm 10 或兼容的包管理器

## 安装与运行

```bash
npm install
npm run dev
```

启动后打开终端显示的本地地址，通常为 `http://localhost:5173`。

生产构建：

```bash
npm run build
npm run preview
```

## 操作方式

| 操作 | 按键 |
| --- | --- |
| 移动 | `W` `A` `S` `D` |
| 瞄准 | 鼠标移动 |
| 射击 | 鼠标左键 |
| 跳跃 | `Space` |
| 冲刺 | `Shift` |
| 换弹 | `R` |
| 暂停 | `Esc` 或 `P` |

暂停后点击“继续任务”，游戏会在三秒倒计时结束后恢复。

## 伤害系统

| 命中区域 | 伤害 |
| --- | ---: |
| 躯干 | 34 |
| 头部/面罩 | 68 |

敌人拥有 100 点生命值，需要三次躯干命中、两次爆头，或一次爆头加一次躯干命中将其消灭。

## 项目结构

```text
src/
├── main.js
├── style.css
├── assets/
└── game/
    ├── core/
    │   ├── SceneManager.js
    │   └── GameLoop.js
    ├── physics/
    │   └── PhysicsWorld.js
    ├── player/
    │   ├── PlayerController.js
    │   └── CameraHandler.js
    ├── weapons/
    │   ├── WeaponBase.js
    │   └── Pistol.js
    ├── enemies/
    │   └── EnemyAI.js
    └── ui/
        └── HUD.js
```

## 使用 GLB 模型

将模型放入 `src/assets/`，然后通过 `SceneManager` 提供的加载方法导入：

```js
const gltf = await sceneManager.loadGLTF(
  new URL('./assets/model.glb', import.meta.url).href,
);

sceneManager.scene.add(gltf.scene);
```

渲染模型的位置应当由对应的 Cannon-es 刚体同步，玩家或可碰撞物体不能通过直接修改模型位置来实现移动。

## 技术栈

- [Three.js](https://threejs.org/)
- [Cannon-es](https://pmndrs.github.io/cannon-es/)
- [Vite](https://vite.dev/)
- JavaScript ES Modules
