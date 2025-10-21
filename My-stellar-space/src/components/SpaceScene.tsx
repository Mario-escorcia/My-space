import { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
export type star = {
  x: number;
  y: number;
  z: number;
  mag: number;
  ci: number;
  proper: string;
  con: string;
};

// IDEAS : enable and disable constellations, zoom to star, info panel, milky way background, galactic plane, planets, labels dinamically , allowing user to select that features
export const SpaceScene = () => {
  useEffect(() => {
    const rayCaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    // const handleClick = (e: MouseEvent) => {
    //   pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    //   pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    // };

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1); // negro
    document.body.appendChild(renderer.domElement);

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.update();
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;

    let animationId: number;
    let points: THREE.Points;
    let stars: Array<star> = [];

    fetch("/data/stars.json")
      .then((res) => res.json())
      .then((data) => {
        stars = data;
        const geometry = new THREE.BufferGeometry();
        const positions: number[] = [];
        const colors: number[] = [];

        stars.forEach((star: star) => {
          positions.push(star.x, star.y, star.z);

          const color = new THREE.Color();
          if (star.ci < 0.3) color.setRGB(0.6, 0.6, 1);
          else if (star.ci < 0.6) color.setRGB(1, 1, 1);
          else color.setRGB(1.0, 0.8, 0.6);
          colors.push(color.r, color.g, color.b);
        });

        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(positions, 3)
        );
        geometry.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(colors, 3)
        );

        const material = new THREE.PointsMaterial({
          size: 0.01,
          vertexColors: true,
          transparent: true,
          opacity: 1,
        });

        points = new THREE.Points(geometry, material);
        const linesMaterial = new THREE.LineBasicMaterial({
          color: 0x56DFCF,
          opacity: 0.3,
          transparent: true,
          linewidth: 1,
        });
        scene.add(points);

        const starsGroups: Map<string, Array<star>> = new Map();
        for (const star of stars) {
          const key = star.con;
          if (!starsGroups.has(key)) {
            starsGroups.set(key, []);
          }
          starsGroups.get(key)!.push(star);
        }
        const linePositions: number[] = [];


        // Función para calcular distancia (opcional)
        const dist = (a: star, b: star) =>
          Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);

        // Recorremos cada constelación
        for (const [conName, arr] of starsGroups.entries()) {
          // tomar las más brillantes
          const main = arr
            .filter((s) => s.mag !== undefined)
            .sort((a, b) => a.mag - b.mag)
            .slice(0, 8);

          if (main.length < 2) continue;

          // conectar las más cercanas (simple, local)
          for (let i = 0; i < main.length; i++) {
            const a = main[i];
            // buscar la más cercana siguiente
            let best = null;
            let bestDist = Infinity;
            for (let j = 0; j < main.length; j++) {
              if (i === j) continue;
              const d = dist(a, main[j]);
              if (d < bestDist) {
                best = main[j];
                bestDist = d;
              }
            }
            if (best) {
              linePositions.push(a.x, a.y, a.z, best.x, best.y, best.z);
            }
          }
        }
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(linePositions, 3)
        );
        const lines = new THREE.LineSegments(lineGeometry, linesMaterial);
        scene.add(lines);
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          renderer.render(scene, camera);
        };
        animate();
      });

    const handleClick = (event: MouseEvent) => {
      if (!points) return;

      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      rayCaster.setFromCamera(pointer, camera);
      const intersects = rayCaster.intersectObject(points);

      if (intersects.length > 0) {
        const i = intersects[0].index!;
        const star = stars[i];
        console.log(`🌟 ${star.proper || "Desconocida"} | mag: ${star.mag}`);
      }
    };

    // manejar resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("click", handleClick);
    window.addEventListener("resize", handleResize);

    // 🔥 limpieza al desmontar el componente
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  return null;
};
