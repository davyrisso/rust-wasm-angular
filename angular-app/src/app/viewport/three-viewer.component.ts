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
  selector: 'app-three-viewer',
  templateUrl: './three-viewer.component.html',
  styleUrls: ['./three-viewer.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule
  ]
})
export class ThreeViewerComponent implements AfterViewInit, OnDestroy {
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
    console.log('ngAfterViewInit called');
    setTimeout(() => {
      try {
        console.log('Setting up scene...');
        this.setupScene();
        console.log('Setting up lights...');
        this.setupLights();
        console.log('Setting up controls...');
        this.setupControls();
        this.isInitialized = true;
        this.cdr.detectChanges();

        console.log('Setting up subscriptions...');
        this.subscriptions.push(
          this.meshService.primitiveChange$.subscribe(type => {
            console.log('Primitive change received:', type);
            if (this.initService.isWasmInitialized()) {
              this.updateMesh(type);
            }
          }),
          this.meshService.subdivide$.subscribe(() => {
            console.log('Subdivide request received');
            if (this.initService.isWasmInitialized()) {
              this.subdivide();
            }
          })
        );

        console.log('Checking WASM initialization...');
        if (this.initService.isWasmInitialized()) {
          console.log('WASM already initialized, setting up mesh');
          this.setupMesh();
          this.animate();
        } else {
          console.log('Waiting for WASM initialization...');
          this.subscriptions.push(
            this.initService.wasmInitialized$.subscribe(initialized => {
              console.log('WASM initialization status:', initialized);
              if (initialized && this.isInitialized) {
                this.setupMesh();
                this.animate();
              }
            })
          );
        }

        this.setupResizeObserver();
      } catch (error) {
        console.error('Error in ngAfterViewInit:', error);
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
    
    console.log('Container dimensions:', { width, height });
    
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
    console.log('setupMesh called, WASM initialized:', this.initService.isWasmInitialized());
    if (this.initService.isWasmInitialized() && this.isInitialized) {
      this.updateMesh(PrimitiveType.Cube);
    }
  }

  private updateMesh(type: PrimitiveType) {
    console.log('updateMesh called with type:', type);
    if (!this.initService.isWasmInitialized() || !this.isInitialized) {
      console.log('Cannot update mesh: WASM not initialized or component not initialized');
      return;
    }

    if (this.mesh) {
      console.log('Removing existing mesh');
      this.scene.remove(this.mesh);
    }

    try {
      this.currentPrimitiveType = type;
      const wasmModule = this.initService.getWasmModule();
      console.log('WASM module available:', !!wasmModule);
      
      if (!wasmModule) {
        throw new Error('WASM module not available');
      }
      
      console.log('Creating mesh from primitive...');
      this.currentMesh = wasmModule.Mesh.from_primitive(type);
      
      if (!this.currentMesh) {
        throw new Error('Failed to create mesh');
      }

      console.log('Getting vertices and indices...');
      const vertices = this.currentMesh.get_vertices();
      const indices = this.currentMesh.get_indices();
      console.log('Mesh data:', { verticesLength: vertices.length, indicesLength: indices.length });

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
      console.log('Adding mesh to scene');
      this.scene.add(group);
      this.mesh = group as unknown as THREE.Mesh;
    } catch (error) {
      console.error('Error in updateMesh:', error);
    }
  }

  private subdivide() {
    console.log('subdivide called');
    if (!this.initService.isWasmInitialized() || !this.isInitialized) {
      console.log('Cannot subdivide: WASM not initialized or component not initialized');
      return;
    }

    if (this.currentMesh) {
      console.log('Subdividing current mesh');
      this.currentMesh.subdivide();
      
      const vertices = this.currentMesh.get_vertices();
      const indices = this.currentMesh.get_indices();
      console.log('Subdivided mesh data:', { verticesLength: vertices.length, indicesLength: indices.length });
      
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
      console.log('Adding subdivided mesh to scene');
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
