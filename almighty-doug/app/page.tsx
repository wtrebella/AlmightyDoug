
'use client';

import * as THREE from 'three'
import { useEffect, useRef } from 'react';
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) {
            console.log("no container ref");
            return;
        }

        const container = containerRef.current;
        let renderer: THREE.WebGLRenderer | null = null;
        let composer: EffectComposer | null = null;
        let camera: THREE.PerspectiveCamera | null = null;
        let scene: THREE.Scene | null = null;
        let rock: THREE.Object3D | null = null;
        let animationFrameId: number;
        const textGroup = new THREE.Group();
        let textBaseSize = 3;
        let rockBaseSize = 1;
        const coverage = 0.7;
        const rockCoverage = 0.45;
        const cameraDistance = 3;
        const lightStrength = 7;

        function visibleSizesAtDistance(fovDeg: number, distance: number, aspect: number) {
            const fov = THREE.MathUtils.degToRad(fovDeg);
            const visibleHeight = 2 * Math.tan(fov / 2) * distance;
            const visibleWidth = visibleHeight * aspect;
            return { visibleWidth, visibleHeight };
        }

        const initThree = () => {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            if (containerWidth === 0 || containerHeight === 0) {
                animationFrameId = requestAnimationFrame(initThree);
                return;
            }

            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x141414);

            const aspect = containerWidth / containerHeight;

            camera = new THREE.PerspectiveCamera(
                75,
                aspect,
                0.1,
                1000
            );

            camera.position.z = cameraDistance;

            const { visibleWidth, visibleHeight } = visibleSizesAtDistance(camera.fov, camera.position.z, aspect);
            const minVisible = Math.min(visibleWidth, visibleHeight);
            const desiredSize = minVisible * coverage;

            renderer = new THREE.WebGLRenderer({antialias: true});
            renderer.setSize(containerWidth, containerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);

            // Lighting
            const lightMultiplier = lightStrength;

            const ambientLight = new THREE.AmbientLight(0xffffff, lightMultiplier * 0.5);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, lightMultiplier);
            directionalLight.position.set(3, 3, 5);
            scene.add(directionalLight);

            const pointLight = new THREE.PointLight(0x6495ed, 1, lightMultiplier * 20);
            pointLight.position.set(-5, -5, -5);
            scene.add(pointLight);

            const renderPass = new RenderPass(scene, camera);
            composer = new EffectComposer(renderer);
            composer.addPass(renderPass);

            scene.add(textGroup);

            const fontLoader = new FontLoader();
            fontLoader.load('/fonts/bungee-hairline.json', (font) => {
                const text = 'ALMIGHTY DOUG ';
                const radius = 1.3 * aspect;
                const angleStep = (Math.PI * 2) / text.length;

                for (let i = 0; i < text.length; i++) {
                    const textGeometry = new TextGeometry(text[i], {
                        font: font,
                        size: 0.32,
                        depth: 0.001,
                        curveSegments: 1,
                        bevelEnabled: false,
                    });

                    textGeometry.center();

                    const textMaterial = new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        metalness: 0.3,
                        roughness: 0.4
                    });

                    const letterMesh = new THREE.Mesh(textGeometry, textMaterial);

                    const angle = i * angleStep;
                    letterMesh.position.x = Math.cos(angle) * radius;
                    letterMesh.position.y = Math.sin(angle) * radius;
                    letterMesh.rotation.z = angle + Math.PI / 2;

                    textGroup.add(letterMesh);
                }

                const box = new THREE.Box3().setFromObject(textGroup);
                const sizeVec = new THREE.Vector3();
                box.getSize(sizeVec);
                textBaseSize = Math.max(sizeVec.x || 1, sizeVec.y || 1, sizeVec.z || 1);
                if (textBaseSize > 0) {
                    const textScale = desiredSize / textBaseSize;
                    textGroup.scale.setScalar(textScale);
                }

                scene?.add(textGroup);
            })

            const loader = new GLTFLoader();
            loader.load(
                '/stylizedrock.glb',
                (gltf) => {
                    rock = gltf.scene;
                    rock.scale.setScalar(1);
                    scene?.add(rock);

                    const box = new THREE.Box3().setFromObject(rock);
                    const sizeVec = new THREE.Vector3();
                    box.getSize(sizeVec);
                    rockBaseSize = Math.max(sizeVec.x || 1, sizeVec.y || 1, sizeVec.z || 1);
                    if (rockBaseSize > 0) {
                        const rockTarget = desiredSize * rockCoverage;
                        const rockScale = rockTarget / rockBaseSize;
                        rock.scale.setScalar(rockScale);
                    }
                },
                undefined,
                (error) => {
                    console.error('Error loading GLB:', error);
                }
            );

            const rotationSpeed = 0.5;
            const yMultiplier = 2;

            animate();

            return () => {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }

                if (renderer) {
                    renderer.dispose();
                    if (container.contains(renderer.domElement)) {
                        container.removeChild(renderer.domElement);
                    }
                }

            };

            function animate() {
                const ROTATION_SPEED = -0.005;

                animationFrameId = requestAnimationFrame(animate);

                if (rock) {
                    rock.rotation.x += rotationSpeed * 0.01;
                    rock.rotation.y += rotationSpeed * 0.01 * yMultiplier;
                }

                if (textGroup) {
                    textGroup.rotation.z += ROTATION_SPEED;
                }

                if (scene && renderer && camera) {
                    renderer.render(scene, camera);
                }
            }
        }

        const onResize = (width: number, height: number) => {
            if (!camera || !renderer || !composer) {
                return;
            }

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            composer.setSize(width, height);

            const aspect = width / height;
            const { visibleWidth, visibleHeight } = visibleSizesAtDistance(camera.fov, camera.position.z, aspect);
            const minVisible = Math.min(visibleWidth, visibleHeight);
            const desiredSize = minVisible * coverage;

            if (textBaseSize > 0 && textGroup) {
                const textScale = desiredSize / textBaseSize;
                textGroup.scale.setScalar(textScale);
            }

            if (rockBaseSize > 0 && rock) {
                const rockTarget = desiredSize * rockCoverage;
                const rockScale = rockTarget / rockBaseSize;
                rock.scale.setScalar(rockScale);
            }
        };

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const contentRect = entry.contentRect;
                const width = Math.max(1, Math.floor(contentRect.width));
                const height = Math.max(1, Math.floor(contentRect.height));
                onResize(width, height);
            }
        });
        resizeObserver.observe(container);

        const cleanup = initThree();

        return () => {
            if (cleanup) {
                cleanup();
            }

            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div className={"w-full h-screen bg-[#141414]"}>
            <div ref={containerRef} className="w-full h-full" />
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white text-center z-10  px-10 py-5 rounded-lg">
            </div>
        </div>
    );
}
