'use client';

import { useEffect, useState } from 'react';

const HEADER_OFFSET = 88;

function getSectionTop(el: HTMLElement) {
    return el.getBoundingClientRect().top + window.scrollY;
}

/**
 * Highlights the landing nav item for the section currently in view.
 * Sections are resolved in DOM order (not nav label order).
 */
export function useLandingSectionSpy(sectionIds: string[]) {
    const [activeId, setActiveId] = useState('');

    useEffect(() => {
        const resolveSections = () =>
            sectionIds
                .map((id) => document.getElementById(id))
                .filter((el): el is HTMLElement => el !== null)
                .sort((a, b) => getSectionTop(a) - getSectionTop(b));

        const computeActive = () => {
            const sections = resolveSections();
            if (!sections.length) return;

            const marker = window.scrollY + HEADER_OFFSET;
            const firstTop = getSectionTop(sections[0]);

            if (marker < firstTop - 48) {
                setActiveId('');
                return;
            }

            let current = sections[0].id;
            for (const section of sections) {
                if (getSectionTop(section) <= marker) {
                    current = section.id;
                }
            }
            setActiveId(current);
        };

        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(computeActive);
        };

        computeActive();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [sectionIds.join('|')]);

    return activeId;
}
