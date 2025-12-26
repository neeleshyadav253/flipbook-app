import { useRef, useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react";
import HTMLFlipBook from "react-pageflip";

export default function FlipBook() {
  const bookRef = useRef(null);
  const containerRef = useRef(null);

  const DESKTOP_SPREADS = 46; // each = one image across 2 pages
  const MOBILE_PAGES = 92; // single pages

  const [page, setPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [size, setSize] = useState({ width: 900, height: 600 });

  /* ---------------- Layout calculation ---------------- */
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

  /* ---------------- Pages (NEVER NULL) ---------------- */
  const pages = useMemo(() => {
    const count = isMobile ? MOBILE_PAGES : DESKTOP_SPREADS;
    const folder = isMobile ? "mobile" : "desktop";

    return Array.from({ length: count }).map((_, i) => (
      <div key={i} className="page">
        <img
          src={`${import.meta.env.BASE_URL}flipbook/${folder}/${i + 1}.png`}
          alt={`Page ${i + 1}`}
          draggable={false}
        />
      </div>
    ));
  }, [isMobile]);

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
          background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 50%, #16213e 100%);
        }

        .page {
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .page img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
          user-select: none;
        }

        .header {
          text-align: center;
          margin-bottom: 24px;
        }

        .header h1 {
          font-size: 2.5rem;
          font-weight: bold;
          background: linear-gradient(120deg, #3b82f6, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 8px;
        }

        .header p {
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .controls {
          display: flex;
          gap: 16px;
          margin-top: 24px;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
        }

        .nav-group {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(31, 41, 55, 0.6);
          backdrop-filter: blur(10px);
          padding: 12px 20px;
          border-radius: 9999px;
          border: 1px solid rgba(75, 85, 99, 0.5);
        }

        .controls button {
          padding: 10px 16px;
          border-radius: 9999px;
          background: #3b82f6;
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
        }

        .controls button:hover:not(:disabled) {
          background: #2563eb;
          transform: scale(1.05);
        }

        .controls button:active:not(:disabled) {
          transform: scale(0.95);
        }

        .controls button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: #4b5563;
        }

        .nav-btn {
          padding: 8px;
          min-width: unset;
        }

        .fullscreen-btn {
          background: linear-gradient(120deg, #8b5cf6, #3b82f6);
          padding: 12px 24px;
        }

        .fullscreen-btn:hover:not(:disabled) {
          background: linear-gradient(120deg, #7c3aed, #2563eb);
        }

        .page-counter {
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          min-width: 80px;
          text-align: center;
          background: rgba(17, 24, 39, 0.6);
          padding: 6px 16px;
          border-radius: 9999px;
        }

        .stf__block {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
        }

        @media (max-width: 640px) {
          .header h1 {
            font-size: 2rem;
          }
          
          .controls {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>

      {/* Header */}
      <div className="header">
        <h1>Flipbook</h1>
        <p>
          {isMobile
            ? "Swipe to flip pages"
            : "Click pages or use arrow buttons"}
        </p>
      </div>

      {/* Flipbook */}
      <HTMLFlipBook
        ref={bookRef}
        width={size.width}
        height={size.height}
        size="fixed"
        showCover={!isMobile}
        usePortrait={isMobile}
        drawShadow={!isMobile}
        mobileScrollSupport
        onFlip={(e) => setPage(e.data)}
      >
        {pages}
      </HTMLFlipBook>

      {/* Controls */}
      <div className="controls">
        <div className="nav-group">
          <button
            className="nav-btn"
            onClick={() => bookRef.current?.pageFlip().flipPrev()}
            disabled={page === 0}
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="page-counter">
            {page + 1} / {totalPages}
          </span>

          <button
            className="nav-btn"
            onClick={() => bookRef.current?.pageFlip().flipNext()}
            disabled={page === totalPages - 1}
            aria-label="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <button className="fullscreen-btn" onClick={toggleFullscreen}>
          {isFullscreen ? (
            <>
              <Minimize size={16} />
              Exit Fullscreen
            </>
          ) : (
            <>
              <Maximize size={16} />
              Fullscreen
            </>
          )}
        </button>
      </div>
    </div>
  );
}
