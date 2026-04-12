"use client"

import { useEffect } from "react"

export function HomepageAnimations() {
  useEffect(() => {
    // Inject keyframes and styles for marquee + fade-in animations
    const styleId = "wise-homepage-animations"
    if (document.getElementById(styleId)) return

    const style = document.createElement("style")
    style.id = styleId
    style.textContent = `
      /* Hero fade-in animation */
      @keyframes wiseFadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .hero-fade-in {
        opacity: 0;
        animation: wiseFadeInUp 0.8s ease-out forwards;
      }

      /* Marquee animation */
      @keyframes wiseMarquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-33.333%); }
      }
      .marquee-container {
        overflow: hidden;
        width: 100%;
        mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
      }
      .marquee-track {
        display: flex;
        align-items: center;
        width: max-content;
        animation: wiseMarquee 30s linear infinite;
      }
      .marquee-track:hover {
        animation-play-state: paused;
      }
    `
    document.head.appendChild(style)

    return () => {
      const existing = document.getElementById(styleId)
      if (existing) existing.remove()
    }
  }, [])

  return null
}
