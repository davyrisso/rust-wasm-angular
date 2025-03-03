import { Component, ElementRef, AfterViewInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule
  ]
})
export class ViewportComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private mesh!: THREE.Mesh;
  private currentMesh: Mesh | null = null;
  private currentPrimitiveType: PrimitiveType = PrimitiveType.Cube;
  private subscriptions: Subscription[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private isInitialized = false;

  constructor(
    private meshService: MeshService,
    private initService: InitService,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit() {
    setTimeout(() => {
      try {
        this.setupScene();
        this.setupLights();
        this.setupControls();
        this.isInitialized = true;
        this.cdr.detectChanges();

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

        this.setupResizeObserver();
      } catch (error) {
        // Handle error silently
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private setupScene() {
    if (!this.rendererContainer?.nativeElement) {
      throw new Error('Renderer container not found');
    }

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x333333);
    
    const container = this.rendererContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    if (width === 0 || height === 0) {
      throw new Error('Container has zero size');
    }
    
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);
  }

  private setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);
  }

  private setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.screenSpacePanning = false;
  }

  private setupResizeObserver() {
    if (!this.rendererContainer?.nativeElement) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.onResize();
    });

    this.resizeObserver.observe(this.rendererContainer.nativeElement);
  }

  private onResize() {
    if (!this.rendererContainer?.nativeElement || !this.camera || !this.renderer) return;

    const container = this.rendererContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private setupMesh() {
    if (this.initService.isWasmInitialized() && this.isInitialized) {
      this.updateMesh(PrimitiveType.Cube);
    }
  }

  private updateMesh(type: PrimitiveType) {
    if (!this.initService.isWasmInitialized() || !this.isInitialized) {
      return;
    }

    if (this.mesh) {
      this.scene.remove(this.mesh);
    }

    try {
      this.currentPrimitiveType = type;
      const wasmModule = this.initService.getWasmModule();
      if (!wasmModule) {
        throw new Error('WASM module not available');
      }
      this.currentMesh = wasmModule.Mesh.from_primitive(type);
      
      if (!this.currentMesh) {
        throw new Error('Failed to create mesh');
      }

      const vertices = this.currentMesh.get_vertices();
      const indices = this.currentMesh.get_indices();

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

      const group = new THREE.Group();

      const solidMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });

      const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        side: THREE.DoubleSide
      });

      const solidMesh = new THREE.Mesh(geometry, solidMaterial);
      const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);

      group.add(solidMesh);
      group.add(wireframeMesh);
      this.scene.add(group);
      this.mesh = group as unknown as THREE.Mesh;
    } catch (error) {
      // Handle error silently
    }
  }

  private subdivide() {
    if (!this.initService.isWasmInitialized() || !this.isInitialized) {
      return;
    }

    if (this.currentMesh) {
      this.currentMesh.subdivide();
      
      const vertices = this.currentMesh.get_vertices();
      const indices = this.currentMesh.get_indices();
      
      if (this.mesh) {
        this.scene.remove(this.mesh);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

      const group = new THREE.Group();

      const solidMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });

      const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        side: THREE.DoubleSide
      });

      const solidMesh = new THREE.Mesh(geometry, solidMaterial);
      const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);

      group.add(solidMesh);
      group.add(wireframeMesh);
      this.scene.add(group);
      this.mesh = group as unknown as THREE.Mesh;
    }
  }

  private animate = () => {
    if (!this.mesh || !this.initService.isWasmInitialized() || !this.isInitialized) {
      return;
    }
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
} 