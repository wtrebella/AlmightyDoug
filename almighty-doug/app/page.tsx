
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
        if (!containerRef.current) return;

        const container = containerRef.current;

        const initThree = () => {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            if (containerWidth === 0 || containerHeight === 0) {
                requestAnimationFrame(initThree);
                return;
            }

            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x141414);

            const camera = new THREE.PerspectiveCamera(
                75,
                containerWidth / containerHeight,
                0.1,
                1000
            );

            camera.position.z = 3;

            const renderer = new THREE.WebGLRenderer({antialias: true});
            renderer.setSize(containerWidth, containerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);

            container.appendChild(renderer.domElement);

            // Lighting
            const lightStrength = 7;

            const ambientLight = new THREE.AmbientLight(0xffffff, lightStrength * 0.5);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, lightStrength);
            directionalLight.position.set(3, 3, 5);
            scene.add(directionalLight);

            const pointLight = new THREE.PointLight(0x6495ed, 1, lightStrength * 20);
            pointLight.position.set(-5, -5, -5);
            scene.add(pointLight);

            const renderPass = new RenderPass(scene, camera);
            const composer = new EffectComposer(renderer);
            composer.addPass(renderPass);

            let rock: THREE.Group;

            const textGroup = new THREE.Group();
            scene.add(textGroup);

            const fontLoader = new FontLoader();
            fontLoader.load('/fonts/bungee-hairline.json', (font) => {
                const text = 'ALMIGHTY DOUG ';
                const radius = 1.3;
                const angleStep = (Math.PI * 2) / text.length;

                for (let i = 0; i <= text.length; i++) {
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

                console.log('Text group children:', textGroup.children.length);
                console.log('Text group position:', textGroup.position);

                scene.add(textGroup);
            })

            const loader = new GLTFLoader();
            const rockScale = 1;
            loader.load(
                '/stylizedrock.glb',
                (gltf) => {
                    rock = gltf.scene;
                    rock.scale.set(rockScale, rockScale, rockScale);
                    scene.add(rock);
                },
                undefined,
                (error) => {
                    console.error('Error loading GLB:', error);
                }
            );

            const rotationSpeed = 0.5;
            const yMultiplier = 2;

            animate();

            const handleResize = () => {
                const width = container.clientWidth;
                const height = container.clientHeight;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
                composer.setSize(width, height);
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                renderer.dispose();
                container.removeChild(renderer.domElement);
            };

            function animate() {
                const ROTATION_SPEED = -0.005;

                requestAnimationFrame(animate);

                if (rock) {
                    rock.rotation.x += rotationSpeed * 0.01;
                    rock.rotation.y += rotationSpeed * 0.01 * yMultiplier;
                }

                if (textGroup) {
                    textGroup.rotation.z += ROTATION_SPEED;
                }

                renderer.render(scene, camera);
            }
        }

        const cleanup = initThree();

        return () => {
            if (cleanup) cleanup();
        };
    });

    return (
        <div className={"w-full h-full bg-gradient-to-br from-[#1e3c72] to-[#2a5298]"}>
            <div ref={containerRef} className="w-full h-full" />
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white text-center z-10  px-10 py-5 rounded-lg">
            </div>
        </div>
    );
}
