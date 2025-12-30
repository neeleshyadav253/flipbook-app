import { useRef, useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react";
import HTMLFlipBook from "react-pageflip";

export default function FlipBook() {
  const bookRef = useRef(null);
  const containerRef = useRef(null);

  const DESKTOP_SPREADS = 46;
  const MOBILE_PAGES = 92;

  const [page, setPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [size, setSize] = useState({ width: 900, height: 600 });

  /* ---------------- Zoom State ---------------- */
  const [zoomed, setZoomed] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const lastTap = useRef(0);
  const dragStart = useRef({ x: null, y: null });

  /* ---------------- Layout ---------------- */
  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const mobile = width < 640;
      const tablet = width >= 640 && width < 1024;

      setIsMobile(mobile);
      setIsTablet(tablet);

      const reservedHeight = 240;
      const availableHeight = height - reservedHeight;

      if (mobile) {
        setSize({
          width: Math.min(width - 48, 360),
          height: Math.min(availableHeight * 0.8, 500),
        });
      } else if (tablet) {
        setSize({
          width: Math.min(width * 0.9, 600),
          height: Math.min(availableHeight * 0.85, 420),
        });
      } else {
        setSize({
          width: Math.min(width * 0.85, 900),
          height: Math.min(availableHeight, 600),
        });
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  /* ---------------- Fullscreen ---------------- */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* ---------------- Zoom Handlers ---------------- */
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setZoomed((z) => !z);
      setOffset({ x: 0, y: 0 });
    }
    lastTap.current = now;
  };

  const handlePointerDown = (e) => {
    if (!zoomed) return;
    dragStart.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
  };

  const handlePointerMove = (e) => {
    if (!zoomed || dragStart.current.x === null) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handlePointerUp = () => {
    dragStart.current = { x: null, y: null };
  };

  /* ---------------- Pages ---------------- */
  const pages = useMemo(() => {
    const count = isMobile ? MOBILE_PAGES : DESKTOP_SPREADS;
    const folder = isMobile ? "mobile" : "desktop";

    return Array.from({ length: count }).map((_, i) => (
      <div key={i} className="page">
        <div
          className={`zoom-container ${zoomed ? "zoomed" : ""}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={isMobile ? handleDoubleTap : undefined}
          style={{
            transform: zoomed
              ? `scale(2) translate(${offset.x / 2}px, ${offset.y / 2}px)`
              : "scale(1)",
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}flipbook/${folder}/${i + 1}.png`}
            alt={`Page ${i + 1}`}
            draggable={false}
          />
        </div>
      </div>
    ));
  }, [isMobile, zoomed, offset]);

  const totalPages = pages.length;

  return (
    <div ref={containerRef} className="flipbook-wrapper">
      <style>{`
        .flipbook-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e, #0f0f1e, #16213e);
        }

        .page {
          background: white;
          overflow: hidden;
        }

        .zoom-container {
          width: 100%;
          height: 100%;
          touch-action: none;
          transition: transform 0.25s ease;
          cursor: grab;
        }

        .zoom-container.zoomed {
          cursor: grabbing;
        }

        .zoom-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
          user-select: none;
        }

        .controls {
          display: flex;
          gap: 16px;
          margin-top: 24px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .nav-group {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(31, 41, 55, 0.6);
          padding: 12px 20px;
          border-radius: 9999px;
        }

        .controls button {
          padding: 10px 16px;
          border-radius: 9999px;
          background: #3b82f6;
          color: white;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }

        .controls button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .page-counter {
          color: white;
          font-weight: 600;
          min-width: 80px;
          text-align: center;
        }
      `}</style>

      <HTMLFlipBook
        ref={bookRef}
        width={size.width}
        height={size.height}
        size="fixed"
        showCover={!isMobile}
        usePortrait={isMobile}
        drawShadow={!isMobile}
        mobileScrollSupport={!zoomed}
        disableFlipByClick={zoomed}
        onFlip={(e) => {
          setPage(e.data);
          setZoomed(false);
          setOffset({ x: 0, y: 0 });
        }}
      >
        {pages}
      </HTMLFlipBook>

      <div className="controls">
        <div className="nav-group">
          <button
            onClick={() => bookRef.current?.pageFlip().flipPrev()}
            disabled={page === 0}
          >
            <ChevronLeft />
          </button>

          <span className="page-counter">
            {page + 1} / {totalPages}
          </span>

          <button
            onClick={() => bookRef.current?.pageFlip().flipNext()}
            disabled={page === totalPages - 1}
          >
            <ChevronRight />
          </button>
        </div>

        <button onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize /> : <Maximize />}
        </button>
      </div>
    </div>
  );
}
