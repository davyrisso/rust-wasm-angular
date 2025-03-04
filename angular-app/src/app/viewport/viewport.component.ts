import { Component, ElementRef, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Mesh, PrimitiveType } from '@wasm/rust_wasm';
import { MeshService } from '../mesh.service';
import { InitService } from '../init.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule, MatButtonModule]
})
export class ViewportComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer') private rendererContainer!: ElementRef;

  private scene = new THREE.Scene();
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private mesh: THREE.Group | null = null;
  private currentMesh: Mesh | null = null;
  private subscriptions: Subscription[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private isInitialized = false;

  constructor(
    private meshService: MeshService,
    private initService: InitService
  ) {
    this.scene.background = new THREE.Color(0x333333);
  }

  ngAfterViewInit(): void {
    this.setupScene();
    this.setupLights();
    this.setupControls();
    this.setupSubscriptions();
    this.setupResizeObserver();
    this.isInitialized = true;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.renderer?.dispose();
    this.resizeObserver?.disconnect();
  }

  private setupScene(): void {
    const container = this.rendererContainer.nativeElement;
    const { clientWidth: width, clientHeight: height } = container;

    if (!width || !height) {
      throw new Error('Container has zero size');
    }

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);
  }

  private setupLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);

    this.scene.add(ambientLight, directionalLight);
  }

  private setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.screenSpacePanning = false;
  }

  private setupSubscriptions(): void {
    this.subscriptions.push(
      this.meshService.primitiveChange$.subscribe(type => {
        if (this.initService.isWasmInitialized()) {
          this.updateMesh(type);
        }
      }),
      this.meshService.subdivide$.subscribe(() => {
        if (this.initService.isWasmInitialized()) {
          this.subdivide();
        }
      })
    );

    if (this.initService.isWasmInitialized()) {
      this.setupMesh();
      this.animate();
    } else {
      this.subscriptions.push(
        this.initService.wasmInitialized$.subscribe(initialized => {
          if (initialized && this.isInitialized) {
            this.setupMesh();
            this.animate();
          }
        })
      );
    }
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.rendererContainer.nativeElement);
  }

  private onResize(): void {
    const container = this.rendererContainer.nativeElement;
    const { clientWidth: width, clientHeight: height } = container;

    if (!width || !height) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private setupMesh(): void {
    if (this.initService.isWasmInitialized() && this.isInitialized) {
      this.updateMesh(PrimitiveType.Cube);
    }
  }

  private createMeshGeometry(vertices: Float32Array, indices: Uint16Array): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    return geometry;
  }

  private createMaterials(): { solid: THREE.Material; wireframe: THREE.Material } {
    return {
      solid: new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      }),
      wireframe: new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        side: THREE.DoubleSide
      })
    };
  }

  private updateMesh(type: PrimitiveType): void {
    if (!this.initService.isWasmInitialized() || !this.isInitialized) return;

    this.mesh?.removeFromParent();

    try {
      const wasmModule = this.initService.getWasmModule();
      if (!wasmModule) throw new Error('WASM module not available');

      this.currentMesh = wasmModule.Mesh.from_primitive(type);
      if (!this.currentMesh) throw new Error('Failed to create mesh');

      const geometry = this.createMeshGeometry(
        this.currentMesh.get_vertices(),
        this.currentMesh.get_indices()
      );

      const { solid, wireframe } = this.createMaterials();
      const solidMesh = new THREE.Mesh(geometry, solid);
      const wireframeMesh = new THREE.Mesh(geometry, wireframe);

      this.mesh = new THREE.Group();
      this.mesh.add(solidMesh, wireframeMesh);
      this.scene.add(this.mesh);
    } catch (error) {
      // Handle error silently
    }
  }

  private subdivide(): void {
    if (!this.initService.isWasmInitialized() || !this.isInitialized || !this.currentMesh) return;

    this.currentMesh.subdivide();
    const geometry = this.createMeshGeometry(
      this.currentMesh.get_vertices(),
      this.currentMesh.get_indices()
    );

    const { solid, wireframe } = this.createMaterials();
    const solidMesh = new THREE.Mesh(geometry, solid);
    const wireframeMesh = new THREE.Mesh(geometry, wireframe);

    this.mesh?.removeFromParent();
    this.mesh = new THREE.Group();
    this.mesh.add(solidMesh, wireframeMesh);
    this.scene.add(this.mesh);
  }

  private animate = (): void => {
    if (!this.mesh || !this.initService.isWasmInitialized() || !this.isInitialized) return;
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
} 