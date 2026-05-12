import type { Transition, Variants } from 'framer-motion';

/** Smooth ease-out for enterprise polish */
export const landingEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const landingSpring: Transition = {
    type: 'spring',
    stiffness: 380,
    damping: 32,
    mass: 0.9,
};

export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 22 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: landingEase },
    },
};

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.45, ease: landingEase },
    },
};

export const staggerFast: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.075,
            delayChildren: 0.08,
        },
    },
};

export const staggerCards: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.09,
            delayChildren: 0.05,
        },
    },
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.96, y: 16 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.55, ease: landingEase },
    },
};

/** Scroll-triggered sections */
export const inViewProps = {
    viewport: { once: true, margin: '-60px' as const },
    initial: 'hidden' as const,
    whileInView: 'visible' as const,
};
