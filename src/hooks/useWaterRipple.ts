"use client";

import { useCallback, useEffect, useRef } from "react";

const RIPPLE_CONFIG = {
	// 每个波纹存活的帧数。越大越慢、拖尾越长。
	maxAge: 500,
	// 新波纹生成的最小时间间隔(ms)。越大越稀疏。
	throttleMs: 200,
	// 最大扩散半径 = 屏幕对角线 * 该比例。越大扩散越远。
	maxRadiusRatio: 0.5,
	// 初始透明度基准。越大越明显。
	baseOpacity: 0.5,
	// 波纹起始线宽。
	lineWidthBase: 3,
	// 线宽随时间衰减速度。越大越快变细。
	lineWidthDecay: 10,
	// 透明度衰减曲线指数。越大后期消失越快。
	opacityDecay: 1.5,
	// 扩散速度曲线指数。
	// =1 线性；>1 慢启动(前期更慢)；<1 快启动。
	expansionCurve: 1.5,
	// 亮色模式波纹颜色。
	lightColor: { r: 14, g: 165, b: 233 },
	// 暗色模式波纹颜色。
	darkColor: { r: 56, g: 189, b: 248 },
} as const;

interface Ripple {
	x: number;
	y: number;
	age: number;
}

export function useWaterRipple(
	canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
	const ripplesRef = useRef<Ripple[]>([]);
	const animationFrameRef = useRef<number>(0);
	const lastRippleTimeRef = useRef<number>(0);

	const isDark = () => document.documentElement.classList.contains("dark");

	const addRipple = (clientX: number, clientY: number) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const x = clientX - rect.left;
		const y = clientY - rect.top;

		if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

		const now = Date.now();
		if (now - lastRippleTimeRef.current > RIPPLE_CONFIG.throttleMs) {
			ripplesRef.current.push({ x, y, age: 0 });
			lastRippleTimeRef.current = now;
		}
	};

	const drawRipple = useCallback(
		(
			ctx: CanvasRenderingContext2D,
			ripple: Ripple,
			width: number,
			height: number
		) => {
			const progress = ripple.age / RIPPLE_CONFIG.maxAge;
			const expansionProgress = Math.pow(progress, RIPPLE_CONFIG.expansionCurve);
			const maxRadius =
				Math.hypot(width, height) * RIPPLE_CONFIG.maxRadiusRatio;
			const radius = expansionProgress * maxRadius;

			const opacity =
				Math.pow(1 - progress, RIPPLE_CONFIG.opacityDecay) *
				RIPPLE_CONFIG.baseOpacity;
			const lineWidth = Math.max(
				0.5,
				RIPPLE_CONFIG.lineWidthBase *
					(1 - progress * RIPPLE_CONFIG.lineWidthDecay)
			);

			const color = isDark()
				? RIPPLE_CONFIG.darkColor
				: RIPPLE_CONFIG.lightColor;

			ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
			ctx.lineWidth = lineWidth;
			ctx.beginPath();
			ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
			ctx.stroke();
		},
		[]
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const setCanvasSize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		setCanvasSize();
		window.addEventListener("resize", setCanvasSize);

		const animate = () => {
			const width = canvas.width;
			const height = canvas.height;
			ctx.clearRect(0, 0, width, height);

			ripplesRef.current = ripplesRef.current.filter((ripple) => {
				if (ripple.age >= RIPPLE_CONFIG.maxAge) return false;
				drawRipple(ctx, ripple, width, height);
				ripple.age++;
				return true;
			});

			animationFrameRef.current = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			window.removeEventListener("resize", setCanvasSize);
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [canvasRef, drawRipple]);

	return { addRipple };
}

export { RIPPLE_CONFIG };
