# AGENTS.md — Three.js FPS Game

## 1. 项目目标

构建一款在浏览器中运行的、高性能的第一人称射击（FPS）游戏。核心玩法包含移动、射击、敌人 AI 和基础物理交互。

## 2. 强制技术栈

- **渲染**：Three.js (ES Module 方式引入)
- **物理引擎**：Cannon-es（**必须**使用，严禁直接修改 `mesh.position` 来移动玩家或物体）
- **构建工具**：Vite
- **语言**：JavaScript (ES Modules, 即 `type="module"`)
- **3D 格式**：GLTF/GLB (使用 `GLTFLoader` 加载)

## 3. 项目目录结构（必须遵守）

```text
src/
├── main.js                # 入口文件（初始化场景、渲染器、启动游戏循环）
├── game/
│   ├── core/
│   │   ├── SceneManager.js    # 管理 Three.js 场景、相机、渲染器
│   │   └── GameLoop.js        # 基于 requestAnimationFrame 的主循环
│   ├── player/
│   │   ├── PlayerController.js # WASD 移动、跳跃（调用物理引擎）
│   │   └── CameraHandler.js    # PointerLock 鼠标视角控制
│   ├── physics/
│   │   └── PhysicsWorld.js     # 封装 Cannon-es 世界、地面、碰撞监听
│   ├── weapons/
│   │   ├── WeaponBase.js       # 武器基类（射击、换弹、弹药逻辑）
│   │   └── Pistol.js           # 具体武器实现（继承 WeaponBase）
│   ├── enemies/
│   │   └── EnemyAI.js          # 敌人状态机（巡逻、追踪、攻击）
│   └── ui/
│       └── HUD.js              # 准星、弹药数、血量显示
└── assets/                 # 存放纹理、音效（由 js 动态加载）
```
