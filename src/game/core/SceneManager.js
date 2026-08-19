import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class SceneManager {
  constructor(container) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x071019);
    this.scene.fog = new THREE.FogExp2(0x071019, 0.022);

    this.camera = new THREE.PerspectiveCamera(74, innerWidth / innerHeight, 0.05, 250);
    this.camera.rotation.order = 'YXZ';

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    this.loader = new GLTFLoader();
    this.#addLighting();
    addEventListener('resize', () => this.resize());
  }

  #addLighting() {
    this.scene.add(new THREE.HemisphereLight(0x8bb7d6, 0x101820, 1.25));
    const sun = new THREE.DirectionalLight(0xffe2b0, 3.4);
    sun.position.set(-16, 24, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = sun.shadow.camera.bottom = -35;
    sun.shadow.camera.right = sun.shadow.camera.top = 35;
    this.scene.add(sun);
  }

  async loadGLTF(url) {
    return this.loader.loadAsync(url);
  }

  resize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
  }

  render() { this.renderer.render(this.scene, this.camera); }
}
