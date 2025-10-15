import { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

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

    const handleClick = (e: MouseEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1); // negro
    document.body.appendChild(renderer.domElement);

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.update();
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;

    let animationId: number;

    fetch("/data/stars.json")
      .then((res) => res.json())
      .then((stars) => {
        const geometry = new THREE.BufferGeometry();
        const positions: number[] = [];
        const colors: number[] = [];

        stars.forEach((star: any) => {
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

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        const animate = () => {
          animationId = requestAnimationFrame(animate);
          renderer.render(scene, camera);
          rayCaster.setFromCamera(pointer, camera);

          const intersects = rayCaster.intersectObjects(scene.children);
          const { index, point } = intersects[0];
            const star = stars[index]; // acceder a tu data original
            console.log(
              `🌟 ${star.proper || "Desconocida"} | mag: ${star.mag}`
            );
          
        };
        animate();
      });

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
