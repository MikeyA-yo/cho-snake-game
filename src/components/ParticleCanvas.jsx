import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { GRID_SIZE } from '../utils/gameUtils';

const ParticleCanvas = forwardRef(({ width, height }, ref) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animFrameRef = useRef(null);

    const cellW = width / GRID_SIZE;
    const cellH = height / GRID_SIZE;

    const spawnParticles = useCallback((gridX, gridY, color, count = 12, speed = 3) => {
        const cx = gridX * cellW + cellW / 2;
        const cy = gridY * cellH + cellH / 2;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const vel = speed * (0.5 + Math.random());
            particlesRef.current.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * vel,
                vy: Math.sin(angle) * vel,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.02,
                size: 2 + Math.random() * 4,
                color,
            });
        }
    }, [cellW, cellH]);

    const spawnTrail = useCallback((gridX, gridY, color) => {
        const cx = gridX * cellW + cellW / 2;
        const cy = gridY * cellH + cellH / 2;
        for (let i = 0; i < 3; i++) {
            particlesRef.current.push({
                x: cx + (Math.random() - 0.5) * cellW * 0.5,
                y: cy + (Math.random() - 0.5) * cellH * 0.5,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: 0.6,
                decay: 0.03 + Math.random() * 0.02,
                size: 1.5 + Math.random() * 2,
                color,
            });
        }
    }, [cellW, cellH]);

    const spawnExplosion = useCallback((gridX, gridY) => {
        const colors = ['#ef4444', '#f97316', '#facc15', '#ffffff'];
        const cx = gridX * cellW + cellW / 2;
        const cy = gridY * cellH + cellH / 2;
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const vel = 1 + Math.random() * 5;
            particlesRef.current.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * vel,
                vy: Math.sin(angle) * vel,
                life: 1.0,
                decay: 0.01 + Math.random() * 0.02,
                size: 2 + Math.random() * 5,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }
    }, [cellW, cellH]);

    useImperativeHandle(ref, () => ({
        burst: spawnParticles,
        trail: spawnTrail,
        explode: spawnExplosion,
    }), [spawnParticles, spawnTrail, spawnExplosion]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            const alive = [];

            for (const p of particlesRef.current) {
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.96;
                p.vy *= 0.96;
                p.life -= p.decay;

                if (p.life > 0) {
                    ctx.globalAlpha = p.life;
                    ctx.fillStyle = p.color;
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = p.size * 2;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                    ctx.fill();
                    alive.push(p);
                }
            }

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            particlesRef.current = alive;
            animFrameRef.current = requestAnimationFrame(animate);
        };

        animFrameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [width, height]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 30,
                pointerEvents: 'none',
            }}
        />
    );
});

ParticleCanvas.displayName = 'ParticleCanvas';
export default ParticleCanvas;
