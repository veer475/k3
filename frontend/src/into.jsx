import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const K3AnimatedIntro = () => {
  const mountRef = useRef(null);
  const [showLandingPage, setShowLandingPage] = useState(false);

  useEffect(() => {
    if (showLandingPage) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121212);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xFFE4B5, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xFFD700, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xFFA500, 0.6);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    const clothingItems = [];
    const clothingGroup = new THREE.Group();
    clothingGroup.position.z = -5;
    scene.add(clothingGroup);

    const createKurta = (color, accentColor) => {
      const kurta = new THREE.Group();
      
      const bodyGeometry = new THREE.BoxGeometry(0.8, 1.4, 0.12);
      const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: color,
        metalness: 0.3,
        roughness: 0.6,
        transparent: true,
        opacity: 0.7
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      kurta.add(body);
      
      const collarGeometry = new THREE.BoxGeometry(0.35, 0.12, 0.13);
      const collarMaterial = new THREE.MeshStandardMaterial({ 
        color: accentColor,
        metalness: 0.5,
        roughness: 0.4,
        transparent: true,
        opacity: 0.8
      });
      const collar = new THREE.Mesh(collarGeometry, collarMaterial);
      collar.position.y = 0.72;
      kurta.add(collar);
      
      const placketGeometry = new THREE.BoxGeometry(0.15, 1.2, 0.13);
      const placketMaterial = new THREE.MeshStandardMaterial({ 
        color: accentColor,
        metalness: 0.6,
        roughness: 0.3,
        transparent: true,
        opacity: 0.85
      });
      const placket = new THREE.Mesh(placketGeometry, placketMaterial);
      placket.position.z = 0.01;
      kurta.add(placket);
      
      for (let i = 0; i < 5; i++) {
        const buttonGeometry = new THREE.SphereGeometry(0.04, 16, 16);
        const buttonMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xFFD700,
          metalness: 0.9,
          roughness: 0.1
        });
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
        button.position.set(0, 0.5 - i * 0.25, 0.08);
        kurta.add(button);
      }
      
      const sleeveGeometry = new THREE.BoxGeometry(0.9, 0.25, 0.12);
      const sleeve = new THREE.Mesh(sleeveGeometry, bodyMaterial);
      sleeve.position.y = 0.4;
      kurta.add(sleeve);
      
      const cuffGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.13);
      const cuffMaterial = new THREE.MeshStandardMaterial({ 
        color: accentColor,
        metalness: 0.5,
        roughness: 0.4,
        transparent: true,
        opacity: 0.8
      });
      const leftCuff = new THREE.Mesh(cuffGeometry, cuffMaterial);
      leftCuff.position.set(-0.45, 0.4, 0);
      kurta.add(leftCuff);
      
      const rightCuff = new THREE.Mesh(cuffGeometry, cuffMaterial);
      rightCuff.position.set(0.45, 0.4, 0);
      kurta.add(rightCuff);
      
      return kurta;
    };

    const createSherwani = (color, accentColor) => {
      const sherwani = new THREE.Group();
      
      const bodyGeometry = new THREE.BoxGeometry(0.9, 1.6, 0.14);
      const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: color,
        metalness: 0.4,
        roughness: 0.5,
        transparent: true,
        opacity: 0.75
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      sherwani.add(body);
      
      const collarGeometry = new THREE.BoxGeometry(0.4, 0.18, 0.15);
      const collarMaterial = new THREE.MeshStandardMaterial({ 
        color: accentColor,
        metalness: 0.7,
        roughness: 0.2,
        transparent: true,
        opacity: 0.9
      });
      const collar = new THREE.Mesh(collarGeometry, collarMaterial);
      collar.position.y = 0.85;
      sherwani.add(collar);
      
      const leftPanelGeometry = new THREE.BoxGeometry(0.25, 1.4, 0.15);
      const panelMaterial = new THREE.MeshStandardMaterial({ 
        color: accentColor,
        metalness: 0.6,
        roughness: 0.3,
        transparent: true,
        opacity: 0.85
      });
      const leftPanel = new THREE.Mesh(leftPanelGeometry, panelMaterial);
      leftPanel.position.set(-0.2, 0, 0.01);
      sherwani.add(leftPanel);
      
      const rightPanel = new THREE.Mesh(leftPanelGeometry, panelMaterial);
      rightPanel.position.set(0.2, 0, 0.01);
      sherwani.add(rightPanel);
      
      for (let i = 0; i < 4; i++) {
        const buttonGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const buttonMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xFFD700,
          metalness: 1,
          roughness: 0.05
        });
        
        const leftButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
        leftButton.position.set(-0.2, 0.6 - i * 0.3, 0.09);
        sherwani.add(leftButton);
        
        const rightButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
        rightButton.position.set(0.2, 0.6 - i * 0.3, 0.09);
        sherwani.add(rightButton);
      }
      
      const shoulderGeometry = new THREE.BoxGeometry(0.15, 0.12, 0.12);
      const shoulderMaterial = new THREE.MeshStandardMaterial({ 
        color: accentColor,
        metalness: 0.7,
        roughness: 0.3
      });
      const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
      leftShoulder.position.set(-0.45, 0.75, 0);
      sherwani.add(leftShoulder);
      
      const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
      rightShoulder.position.set(0.45, 0.75, 0);
      sherwani.add(rightShoulder);
      
      const sleeveGeometry = new THREE.BoxGeometry(1, 0.3, 0.14);
      const sleeve = new THREE.Mesh(sleeveGeometry, bodyMaterial);
      sleeve.position.y = 0.45;
      sherwani.add(sleeve);
      
      const cuffGeometry = new THREE.BoxGeometry(0.22, 0.18, 0.15);
      const cuffMaterial = new THREE.MeshStandardMaterial({ 
        color: accentColor,
        metalness: 0.7,
        roughness: 0.3,
        transparent: true,
        opacity: 0.9
      });
      const leftCuff = new THREE.Mesh(cuffGeometry, cuffMaterial);
      leftCuff.position.set(-0.5, 0.45, 0);
      sherwani.add(leftCuff);
      
      const rightCuff = new THREE.Mesh(cuffGeometry, cuffMaterial);
      rightCuff.position.set(0.5, 0.45, 0);
      sherwani.add(rightCuff);
      
      const hemGeometry = new THREE.BoxGeometry(0.92, 0.1, 0.15);
      const hemMaterial = new THREE.MeshStandardMaterial({ 
        color: accentColor,
        metalness: 0.6,
        roughness: 0.4
      });
      const hem = new THREE.Mesh(hemGeometry, hemMaterial);
      hem.position.y = -0.85;
      sherwani.add(hem);
      
      return sherwani;
    };

    const weddingColors = [
      { main: 0xDC143C, accent: 0xFFD700 },
      { main: 0xFF6B35, accent: 0xFFD700 },
      { main: 0x8B0000, accent: 0xFFD700 },
      { main: 0x138808, accent: 0xFFD700 },
      { main: 0xC04000, accent: 0xFF6347 },
      { main: 0x800080, accent: 0xFFD700 },
      { main: 0x000080, accent: 0xFFD700 },
      { main: 0xB8860B, accent: 0xFFFFFF }
    ];

    for (let i = 0; i < 22; i++) {
      const colorScheme = weddingColors[Math.floor(Math.random() * weddingColors.length)];
      
      let clothingItem;
      if (i % 2 === 0) {
        clothingItem = createKurta(colorScheme.main, colorScheme.accent);
      } else {
        clothingItem = createSherwani(colorScheme.main, colorScheme.accent);
      }
      
      clothingItem.position.x = (Math.random() - 0.5) * 20;
      clothingItem.position.y = (Math.random() - 0.5) * 15;
      clothingItem.position.z = Math.random() * 5;
      clothingItem.rotation.z = Math.random() * Math.PI * 2;
      
      clothingItem.userData = {
        speedX: (Math.random() - 0.5) * 0.015,
        speedY: (Math.random() - 0.5) * 0.015,
        rotationSpeed: (Math.random() - 0.5) * 0.008,
        floatOffset: Math.random() * Math.PI * 2
      };
      
      clothingItems.push(clothingItem);
      clothingGroup.add(clothingItem);
    }

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const bagGroup = new THREE.Group();
    
    const bagGeometry = new THREE.BoxGeometry(1.6, 2, 0.8);
    const bagMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x7B1E1E,          // deep royal maroon
  metalness: 0.3,
  roughness: 0.5,
  emissive: 0x3D0C0C,
  emissiveIntensity: 0.25
});

    const bag = new THREE.Mesh(bagGeometry, bagMaterial);
    bagGroup.add(bag);

    const topBorderGeometry = new THREE.BoxGeometry(1.65, 0.15, 0.85);
    const borderMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFD700,
      metalness: 0.6,
      roughness: 0.3,
      emissive: 0xFFD700,
      emissiveIntensity: 0.2
    });
    const topBorder = new THREE.Mesh(topBorderGeometry, borderMaterial);
    topBorder.position.y = 1.05;
    bagGroup.add(topBorder);

    const bottomBorder = new THREE.Mesh(topBorderGeometry, borderMaterial);
    bottomBorder.position.y = -1.05;
    bagGroup.add(bottomBorder);

    const midBandGeometry = new THREE.BoxGeometry(1.65, 0.2, 0.85);
    const midBandMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFF6347,
      metalness: 0.3,
      roughness: 0.5
    });
    const midBand = new THREE.Mesh(midBandGeometry, midBandMaterial);
    midBand.position.y = 0;
    bagGroup.add(midBand);

    for (let i = 0; i < 8; i++) {
      const dotGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const dotMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFD700,
        metalness: 0.8,
        roughness: 0.2
      });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.position.set(-0.6 + i * 0.2, 0.5, 0.42);
      bagGroup.add(dot);
      
      const dot2 = new THREE.Mesh(dotGeometry, dotMaterial);
      dot2.position.set(-0.6 + i * 0.2, -0.5, 0.42);
      bagGroup.add(dot2);
    }

    const handleMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      metalness: 0.2,
      roughness: 0.9
    });
    
    const leftHandleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.5, 1.1, 0.3),
      new THREE.Vector3(-0.5, 1.5, 0.3),
      new THREE.Vector3(-0.4, 1.7, 0.3),
      new THREE.Vector3(-0.3, 1.8, 0.3),
      new THREE.Vector3(-0.2, 1.8, 0.3)
    ]);
    const leftHandleGeo = new THREE.TubeGeometry(leftHandleCurve, 20, 0.08, 8, false);
    const leftHandle = new THREE.Mesh(leftHandleGeo, handleMaterial);
    bagGroup.add(leftHandle);
    
    const rightHandleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, 1.8, 0.3),
      new THREE.Vector3(0.3, 1.8, 0.3),
      new THREE.Vector3(0.4, 1.7, 0.3),
      new THREE.Vector3(0.5, 1.5, 0.3),
      new THREE.Vector3(0.5, 1.1, 0.3)
    ]);
    const rightHandleGeo = new THREE.TubeGeometry(rightHandleCurve, 20, 0.08, 8, false);
    const rightHandle = new THREE.Mesh(rightHandleGeo, handleMaterial);
    bagGroup.add(rightHandle);

    const motifGeometry = new THREE.TorusGeometry(0.25, 0.05, 16, 100);
    const motifMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFD700,
      metalness: 0.9,
      roughness: 0.1
    });
    const motif = new THREE.Mesh(motifGeometry, motifMaterial);
    motif.position.set(0, 0, 0.42);
    bagGroup.add(motif);

    bagGroup.position.set(-3.5, 0, 0);
    bagGroup.scale.set(0, 0, 0);
    mainGroup.add(bagGroup);

    const kGroup = new THREE.Group();
    const letterMaterial = new THREE.MeshStandardMaterial({ 
  color: 0xFF9F1C,          // brighter saffron-gold
  metalness: 0.85,
  roughness: 0.2,
  emissive: 0xFF6B00,
  emissiveIntensity: 0.85
});

    
    const kVertical = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 2.2, 0.35),
      letterMaterial
    );
    kVertical.position.set(-0.5, 0, 0);
    kGroup.add(kVertical);
    
    const kUpperDiag = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 1.2, 0.35),
      letterMaterial
    );
    kUpperDiag.position.set(0.15, 0.55, 0);
    kUpperDiag.rotation.z = -Math.PI / 3.5;
    kGroup.add(kUpperDiag);
    
    const kLowerDiag = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 1.2, 0.35),
      letterMaterial
    );
    kLowerDiag.position.set(0.15, -0.55, 0);
    kLowerDiag.rotation.z = Math.PI / 3.5;
    kGroup.add(kLowerDiag);

    kGroup.position.set(-0.8, 0, 0);
    kGroup.scale.set(0, 0, 0);
    mainGroup.add(kGroup);

    const threeGroup = new THREE.Group();
    const threeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2ECC71,
    metalness: 0.8,
     roughness: 0.25,
    emissive: 0x1E8449,
    emissiveIntensity: 0.7
    });
    
    const threeGeometry = new THREE.TorusGeometry(0.5, 0.18, 16, 100, Math.PI);
    
    const threeTop = new THREE.Mesh(threeGeometry, threeMaterial);
    threeTop.position.set(0, 0.45, 0);
    threeTop.rotation.z = -Math.PI / 2;
    threeGroup.add(threeTop);
    
    const threeBottom = new THREE.Mesh(threeGeometry, threeMaterial);
    threeBottom.position.set(0, -0.45, 0);
    threeBottom.rotation.z = -Math.PI / 2;
    threeGroup.add(threeBottom);

    threeGroup.position.set(0.5, 0, 0);
    threeGroup.scale.set(0, 0, 0);
    mainGroup.add(threeGroup);

    const textGroup = new THREE.Group();
    const textSprites = [];
    const text = 'Rental clothing';
    
    for (let i = 0; i < text.length; i++) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 158;
      canvas.height = 158;
      
      context.fillStyle = '#FF6B35';
      context.font = 'bold 120px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text[i], 64, 64);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(1.1, 1.1, 1);
      sprite.position.x = i * 0.9;
      sprite.userData.baseY = 0;
      sprite.userData.index = i;
      sprite.userData.baseX = i * 0.9;
      spriteMaterial.opacity = 0;
      
      textSprites.push(sprite);
      textGroup.add(sprite);
    }
    
    textGroup.position.set(2.5, 0, 0);
    textGroup.scale.set(0, 0, 0);
    mainGroup.add(textGroup);

    mainGroup.position.set(-4.8, 0, 0);

    let animationPhase = 0;
    let phaseTime = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      phaseTime += delta;

      clothingItems.forEach((item) => {
        item.position.x += item.userData.speedX;
        item.position.y += item.userData.speedY;
        item.rotation.z += item.userData.rotationSpeed;
        item.position.y += Math.sin(phaseTime * 2 + item.userData.floatOffset) * 0.005;
        
        if (item.position.x > 10) item.position.x = -10;
        if (item.position.x < -10) item.position.x = 10;
        if (item.position.y > 8) item.position.y = -8;
        if (item.position.y < -8) item.position.y = 8;
      });

      if (animationPhase === 0) {
        const progress = Math.min(phaseTime / 1, 1);
        const scale = easeOutElastic(progress);
        bagGroup.scale.set(scale, scale, scale);
        bagGroup.rotation.y = Math.sin(progress * Math.PI) * 0.15;
        
        if (progress >= 1) {
          animationPhase = 1;
          phaseTime = 0;
        }
      }
      else if (animationPhase === 1) {
        const progress = Math.min(phaseTime / 1.5, 1);
        const scale = easeOutBack(progress);
        
        kGroup.scale.set(scale, scale, scale);
        threeGroup.scale.set(scale, scale, scale);
        textGroup.scale.set(scale, scale, scale);
        
        textSprites.forEach((sprite, i) => {
          const wavePhase = progress * Math.PI * 2 + i * 0.4;
          sprite.position.y = sprite.userData.baseY + Math.sin(wavePhase) * 0.25 * progress;
          sprite.material.opacity = progress;
        });
        
        if (progress >= 1) {
          animationPhase = 2;
          phaseTime = 0;
        }
      }
      else if (animationPhase === 2) {
        textSprites.forEach((sprite, i) => {
          const wavePhase = phaseTime * 3 + i * 0.4;
          sprite.position.y = sprite.userData.baseY + Math.sin(wavePhase) * 0.18;
        });
        
        const floatAmount = Math.sin(phaseTime * 1.5) * 0.08;
        bagGroup.position.y = floatAmount;
        kGroup.position.y = floatAmount;
        threeGroup.position.y = floatAmount;
        textGroup.position.y = floatAmount;
        
        if (phaseTime >= 1.5) {
          animationPhase = 3;
          phaseTime = 0;
        }
      }
      else if (animationPhase === 3) {
        const progress = Math.min(phaseTime / 1.2, 1);
        const zoomProgress = easeInCubic(progress);
        
        const scaleMultiplier = 1 + zoomProgress * 60;
        mainGroup.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);
        mainGroup.position.z = zoomProgress * 20;
        mainGroup.rotation.y = zoomProgress * 0.3;
        
        textSprites.forEach((sprite, i) => {
          const wavePhase = phaseTime * 4 + i * 0.4;
          sprite.position.y = sprite.userData.baseY + Math.sin(wavePhase) * 0.18;
        });
        
        clothingItems.forEach(item => {
          item.traverse(child => {
            if (child.material && child.material.transparent) {
              const originalOpacity = child.material.opacity || 0.7;
              child.material.opacity = originalOpacity * (1 - zoomProgress);
            }
          });
        });
        
        if (progress >= 0.75) {
          const fadeProgress = (progress - 0.75) / 0.25;
          renderer.domElement.style.opacity = 1 - fadeProgress;
        }
        
        if (progress >= 1) {
          setShowLandingPage(true);
          return;
        }
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    function easeOutElastic(x) {
      const c4 = (2 * Math.PI) / 3;
      return x === 0 ? 0 : x === 1 ? 1 :
        Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    }

    function easeOutBack(x) {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    function easeInCubic(x) {
      return x * x * x;
    }

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [showLandingPage]);

  if (showLandingPage) {
    return (
    <div>HEllo</div>
    );
  }

  if (!showLandingPage) {
  return (
    <div
      ref={mountRef}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    />
  );
}
}

export default K3AnimatedIntro;