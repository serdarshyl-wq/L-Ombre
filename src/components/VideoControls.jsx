"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Volume2, VolumeX } from "lucide-react";

const BARS = 5;

export default function VideoControls({ videoRef, playing, onToggle }) {
  const root = useRef(null);
  const [volume, setVolume] = useState(0.6);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    video.volume = volume;
  }, [videoRef, muted, volume]);

  useGSAP(
    () => {
      const bars = gsap.utils.toArray(".eq__bar", root.current);

      gsap.killTweensOf(bars);

      if (!playing) {
        gsap.to(bars, {
          scaleY: 0.08,
          duration: 0.35,
          ease: "power2.out",
          stagger: { each: 0.03, from: "center" },
        });
        return;
      }

      bars.forEach((bar, i) => {
        gsap.to(bar, {
          scaleY: gsap.utils.random(0.35, 1),
          duration: gsap.utils.random(0.28, 0.5),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          repeatRefresh: true,
          delay: i * 0.06,
        });
      });
    },
    { scope: root, dependencies: [playing] }
  );

  return (
    <div className="controls" ref={root}>
      <button
        type="button"
        className="eq"
        onClick={onToggle}
        aria-pressed={playing}
        aria-label={playing ? "Pause" : "Play"}
      >
        {Array.from({ length: BARS }, (_, i) => (
          <span key={i} className="eq__bar" />
        ))}
      </button>

      <div className="volume">
        <button
          type="button"
          className="volume__toggle"
          onClick={() => setMuted((m) => !m)}
          aria-pressed={!muted}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? (
            <VolumeX strokeWidth={1.25} aria-hidden="true" />
          ) : (
            <Volume2 strokeWidth={1.25} aria-hidden="true" />
          )}
        </button>

        <input
          className="volume__range"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={muted ? 0 : volume}
          aria-label="Volume"
          onChange={(e) => {
            const next = Number(e.target.value);
            setVolume(next);
            setMuted(next === 0);
          }}
          style={{ "--fill": `${(muted ? 0 : volume) * 100}%` }}
        />
      </div>
    </div>
  );
}
