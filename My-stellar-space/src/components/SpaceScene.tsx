import { useEffect } from "react";
import * as THREE from "three";

export const SpaceScene = () => {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      100,
      window.outerWidth / window.outerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1); // negro
    document.body.appendChild(renderer.domElement);

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
        //   points.rotation.x += 0.001;
          renderer.render(scene, camera);
        };
        animate();
      });

    // manejar resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
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
