import { useState, useEffect, useRef } from "react";

export default function App() {
  const [aliens, setAliens] = useState([]);
  const [lasers, setLasers] = useState([]);
  const [alienLasers, setAlienLasers] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [particles, setParticles] = useState([]);
  const [yPosition, setYPosition] = useState(100);
  const [targetY, setTargetY] = useState(100);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  const characterRef = useRef(null);
  const aliensRef = useRef([]);
  const lasersRef = useRef([]);
  const alienLasersRef = useRef([]);
  const particlesRef = useRef([]);
  const explosionsRef = useRef([]);

  // Smooth player movement
  useEffect(() => {
    let frame;
    const move = () => {
      setYPosition((prev) => {
        const delta = targetY - prev;
        if (Math.abs(delta) < 1) return targetY;
        return prev + delta * 0.1;
      });
      frame = requestAnimationFrame(move);
    };
    move();
    return () => cancelAnimationFrame(frame);
  }, [targetY]);

  // Key controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      if (e.code === "ArrowUp") setTargetY((prev) => Math.min(prev + 50, window.innerHeight - 150));
      if (e.code === "ArrowDown") setTargetY((prev) => Math.max(prev - 50, 50));
      if (e.code === "Space") shootLaser();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver]);

  // Shoot player laser
  const shootLaser = () => {
    if (!characterRef.current || gameOver) return;
    const rect = characterRef.current.getBoundingClientRect();
    const id = crypto.randomUUID();
    lasersRef.current.push({ id, x: rect.right, y: rect.top + rect.height / 2 });
    setLasers([...lasersRef.current]);
  };

  // Spawn aliens periodically
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      const newAlien = {
        id: crypto.randomUUID(),
        x: window.innerWidth + 50,
        top: 20 + Math.random() * 60,
        floatOffset: Math.random() * Math.PI * 2,
        zigZagOffset: Math.random() * Math.PI * 2,
        speed: 2 + Math.random() * 2,
      };
      aliensRef.current.push(newAlien);
      if (aliensRef.current.length > 10) aliensRef.current.shift();
      setAliens([...aliensRef.current]);
    }, 1500);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Main game loop
  useEffect(() => {
    if (gameOver) return;
    let lastTime = performance.now();
    let lastAlienShoot = 0;

    const loop = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      // Move player lasers
      lasersRef.current.forEach((l) => (l.x += 15));
      lasersRef.current = lasersRef.current.filter((l) => l.x < window.innerWidth);

      // Move alien lasers
      alienLasersRef.current.forEach((l) => (l.x -= 15));
      alienLasersRef.current = alienLasersRef.current.filter((l) => l.x > 0);

      // Move aliens
      aliensRef.current.forEach((alien, i) => {
        alien.x -= alien.speed;
        alien.y = (alien.top / 100) * window.innerHeight + Math.sin(alien.floatOffset + time / 500) * 20;
        alien.x += Math.sin(alien.zigZagOffset + time / 300) * 5;
      });
      aliensRef.current = aliensRef.current.filter((a) => a.x > -50);

      // Aliens shooting
      if (time - lastAlienShoot > 2000 && aliensRef.current.length > 0) {
        const shooter = aliensRef.current[Math.floor(Math.random() * aliensRef.current.length)];
        const alienX = shooter.x;
        const alienY = shooter.y;
        const offset = Math.random() * 40 - 20;
        alienLasersRef.current.push({ id: crypto.randomUUID(), x: alienX, y: alienY + offset });
        lastAlienShoot = time;
      }

      // Player laser hits alien
      aliensRef.current = aliensRef.current.filter((alien) => {
        let hit = false;
        lasersRef.current.forEach((laser) => {
          if (
            laser.x >= alien.x &&
            laser.x <= alien.x + 48 &&
            laser.y >= alien.y &&
            laser.y <= alien.y + 48
          ) {
            hit = true;
            explosionsRef.current.push({ id: crypto.randomUUID(), x: alien.x, y: alien.y });
            lasersRef.current = lasersRef.current.filter((l) => l.id !== laser.id);
            setScore((prev) => prev + 1);
          }
        });
        return !hit;
      });

      // Alien laser hits player
      if (characterRef.current) {
        const rect = characterRef.current.getBoundingClientRect();
        alienLasersRef.current = alienLasersRef.current.filter((laser) => {
          if (
            laser.x <= rect.right &&
            laser.x >= rect.left &&
            laser.y >= rect.top &&
            laser.y <= rect.bottom
          ) {
            setHealth((prev) => {
              const newHealth = prev - 1;
              if (newHealth <= 0) setGameOver(true);
              return newHealth;
            });
            return false;
          }
          return true;
        });
      }

  // Flame particles
if (characterRef.current) {
  const rect = characterRef.current.getBoundingClientRect();
  const flameCount = 4;

  // Slightly wider boot offsets
  const bootOffsets = [rect.left + 20, rect.left + rect.width - 80];

  const newParticles = bootOffsets.flatMap((bootX) =>
    Array.from({ length: flameCount }).map(() => ({
      id: crypto.randomUUID(),
      x: bootX + Math.random() * 20, // random horizontal spread
      y: rect.bottom,
      vx: (Math.random() - 0.5) * 0.2,
      vy: 2 + Math.random() * 2,
      width: 8 + Math.random() * 6,
      height: 20 + Math.random() * 20,
      color: "#ff0000",
      opacity: 0.6 + Math.random() * 0.4,
      blur: 4 + Math.random() * 4,
    }))
  );

  particlesRef.current.push(...newParticles);
  particlesRef.current = particlesRef.current.slice(-200);
}



      // Move particles
      particlesRef.current = particlesRef.current
        .map((p) => ({
          ...p,
          x: p.x + (p.vx ?? 0),
          y: p.y + (p.vy ?? 2),
          opacity: (p.opacity ?? 1) - 0.05,
        }))
        .filter((p) => p.opacity > 0);

      // Update states for rendering
      setLasers([...lasersRef.current]);
      setAlienLasers([...alienLasersRef.current]);
      setAliens([...aliensRef.current]);
      setParticles([...particlesRef.current]);
      setExplosions([...explosionsRef.current]);

      if (!gameOver) requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }, [gameOver]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        backgroundImage: "url('/stars.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "contain",
        position: "relative",
        overflow: "hidden",
        fontSize: "3rem",
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: "4rem",
          fontWeight: "bold",
          textAlign: "center",
          textShadow: "0 0 10px #00f, 0 0 20px #0ff",
          position: "absolute",
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        Void Blaster
      </h1>

      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          color: "white",
          fontSize: "2rem",
          zIndex: 15,
        }}
      >
        Score: {score} | Health: {health}
      </div>

      {gameOver && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "red",
            fontSize: "4rem",
            textAlign: "center",
            textShadow: "0 0 10px black",
            zIndex: 20,
          }}
        >
          GAME OVER
        </div>
      )}

      {/* Player */}
      <div
        ref={characterRef}
        style={{
          position: "absolute",
          bottom: `${yPosition}px`,
          left: "5%",
          width: "12rem",
          zIndex: 10,
        }}
      >
        <img
          src="/character.png"
          alt="Character"
          style={{ width: "12rem", userSelect: "none", pointerEvents: "none" }}
        />
      </div>

      {/* Aliens */}
      {aliens.map((alien) => (
        <div
          key={alien.id}
          style={{
            position: "absolute",
            top: `${alien.y}px`,
            left: `${alien.x}px`,
            fontSize: "2rem",
            zIndex: 10,
          }}
        >
          👾
        </div>
      ))}

      {/* Player lasers */}
      {lasers.map((laser) => (
        <div
          key={laser.id}
          style={{
            position: "absolute",
            top: `${laser.y}px`,
            left: `${laser.x}px`,
            width: "1rem",
            height: "0.5rem",
            backgroundColor: "cyan",
            borderRadius: "2px",
            zIndex: 15,
          }}
        />
      ))}

      {/* Alien lasers */}
      {alienLasers.map((laser) => (
        <div
          key={laser.id}
          style={{
            position: "absolute",
            top: `${laser.y}px`,
            left: `${laser.x}px`,
            width: "1rem",
            height: "0.5rem",
            backgroundColor: "red",
            borderRadius: "2px",
            zIndex: 15,
          }}
        />
      ))}

      {/* Explosions */}
      {explosions.map((exp) => (
        <div
          key={exp.id}
          style={{
            position: "absolute",
            top: `${exp.y}px`,
            left: `${exp.x}px`,
            fontSize: "2rem",
            zIndex: 20,
          }}
        >
          💥
        </div>
      ))}

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: `${p.y}px`,
            left: `${p.x}px`,
            width: `${p.width}px`,
            height: `${p.height}px`,
            borderRadius: "50%",
            backgroundColor: p.color,
            opacity: p.opacity,
            filter: `blur(${p.blur}px)`,
            zIndex: 5,
          }}
        />
      ))}
    </div>
  );
}
