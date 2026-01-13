import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { User, LogOut, LogIn, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import TextRoll from './TextRoll';

export const StaggeredMenu = ({
  position = 'right',
  colors = ['#B19EEF', '#3F2965'],
  items = [],
  isAuthenticated = false,
  user = null,
  onLogout = null,
  className,
  logoUrl = '/logo.png',
  menuButtonColor = '#3F2965',
  openMenuButtonColor = '#3F2965',
  changeMenuColorOnOpen = true,
  isFixed = false,
  accentColor = '#3F2965',
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose
}) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const preLayerElsRef = useRef([]);

  const toggleBtnRef = useRef(null);
  const iconRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line3Ref = useRef(null);

  const openTlRef = useRef(null);
  const closeTweenRef = useRef(null);
  const spinTweenRef = useRef(null);
  const colorTweenRef = useRef(null);
  const busyRef = useRef(false);

  const itemEntranceTweenRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;

      const line1 = line1Ref.current;
      const line2 = line2Ref.current;
      const line3 = line3Ref.current;
      const icon = iconRef.current;

      if (!panel || !line1 || !line2 || !line3 || !icon) return;

      let preLayers = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen });

      // Initial Hamburger State
      gsap.set(line1, { y: -6, rotate: 0 });
      gsap.set(line2, { opacity: 1, scaleX: 1 });
      gsap.set(line3, { y: 6, rotate: 0 });
      gsap.set(icon, { rotate: 0 });

      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    const layerStates = layers.map(el => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }));
    const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

    if (itemEls.length) gsap.set(itemEls, { yPercent: 120, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.45, ease: 'power3.out' }, i * 0.05);
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.05 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.05 : 0);
    const panelDuration = 0.55;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power3.out' },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStart = panelInsertTime + 0.15;
      tl.to(
        itemEls,
        { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.06 },
        itemsStart
      );
    }

    openTlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();

    const offscreen = position === 'left' ? -100 : 100;

    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.3,
      ease: 'power3.inOut',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
        if (itemEls.length) gsap.set(itemEls, { yPercent: 120, opacity: 0 });
        busyRef.current = false;
      }
    });
  }, [position]);

  const animateIcon = useCallback(opening => {
    const l1 = line1Ref.current;
    const l2 = line2Ref.current;
    const l3 = line3Ref.current;
    if (!l1 || !l2 || !l3) return;

    spinTweenRef.current?.kill();

    if (opening) {
      spinTweenRef.current = gsap
        .timeline({ defaults: { duration: 0.4, ease: 'power4.inOut' } })
        .to(l1, { y: 0, rotate: 45 }, 0)
        .to(l2, { opacity: 0, scaleX: 0 }, 0)
        .to(l3, { y: 0, rotate: -45 }, 0);
    } else {
      spinTweenRef.current = gsap
        .timeline({ defaults: { duration: 0.4, ease: 'power4.inOut' } })
        .to(l1, { y: -6, rotate: 0 }, 0)
        .to(l2, { opacity: 1, scaleX: 1 }, 0)
        .to(l3, { y: 6, rotate: 0 }, 0);
    }
  }, []);

  const animateColor = useCallback(
    opening => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, { color: targetColor, delay: 0.05, duration: 0.3, ease: 'power2.out' });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);

    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }

    animateIcon(target);
    animateColor(target);
  }, [playOpen, playClose, animateIcon, animateColor, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false;
      setOpen(false);
      onMenuClose?.();
      playClose();
      animateIcon(false);
      animateColor(false);
    }
  }, [playClose, animateIcon, animateColor, onMenuClose]);

  React.useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = event => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeOnClickAway, open, closeMenu]);

  return (
    <div
      className={`sm-scope z-[999] ${isFixed ? 'fixed top-0 left-0 w-screen h-screen overflow-hidden' : 'w-full h-full'}`}
    >
      <div
        className={
          (className ? className + ' ' : '') + 'staggered-menu-wrapper pointer-events-none relative w-full h-full'
        }
        style={accentColor ? { ['--sm-accent']: accentColor } : undefined}
        data-position={position}
        data-open={open || undefined}
      >
        <div
          ref={preLayersRef}
          className="sm-prelayers absolute top-0 right-0 bottom-0 pointer-events-none z-[5] w-full"
          aria-hidden="true"
        >
          {(() => {
            const raw = colors && colors.length ? colors.slice(0, 4) : ['#B19EEF', '#3F2965'];
            let arr = [...raw];
            if (arr.length >= 3) {
              const mid = Math.floor(arr.length / 2);
              arr.splice(mid, 1);
            }
            return arr.map((c, i) => (
              <div
                key={i}
                className="sm-prelayer absolute top-0 right-0 h-full w-full translate-x-0"
                style={{ background: c }}
              />
            ));
          })()}
        </div>

        <header
          className="staggered-menu-header absolute top-0 left-0 w-full flex items-center justify-between px-4 py-2 sm:px-6 md:px-[2em] bg-transparent pointer-events-none z-20"
          aria-label="Main navigation header"
        >
          <div
            className={`sm-logo flex items-center select-none pointer-events-auto transition-all duration-300 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
            aria-label="Logo"
          >
            <img
              src={logoUrl}
              alt="Logo"
              className="sm-logo-img block h-8 md:h-10 w-auto object-contain"
              draggable={false}
              width={110}
              height={24}
            />
          </div>

          <div className="flex items-center gap-4 pointer-events-auto">
            <Link
              to="/booking"
              className="sm-quick-book flex items-center justify-center w-10 h-10 transition-transform hover:scale-110 active:scale-95"
              aria-label="Book a Session"
              style={{ color: accentColor }}
            >
              <Calendar size={open ? 24 : 1.5 * 24} />
            </Link>

            <button
              ref={toggleBtnRef}
              className="sm-toggle relative flex items-center justify-center bg-transparent border-none outline-none cursor-pointer p-0 m-0 overflow-visible w-10 h-10 shadow-none appearance-none"
              aria-label={open ? 'Close' : 'Menu'}
              aria-expanded={open}
              aria-controls="staggered-menu-panel"
              onClick={toggleMenu}
              type="button"
            >
              <div
                ref={iconRef}
                className="sm-icon relative w-6 h-6 flex items-center justify-center"
                aria-hidden="true"
              >
                <span
                  ref={line1Ref}
                  className="sm-icon-line absolute w-full h-[3px] bg-current rounded-full"
                />
                <span
                  ref={line2Ref}
                  className="sm-icon-line absolute w-full h-[3px] bg-current rounded-full"
                />
                <span
                  ref={line3Ref}
                  className="sm-icon-line absolute w-full h-[3px] bg-current rounded-full"
                />
              </div>
            </button>
          </div>
        </header>

        <aside
          id="staggered-menu-panel"
          ref={panelRef}
          className="staggered-menu-panel absolute top-0 right-0 w-full h-full flex flex-col p-[6rem_2rem_2rem_2rem] overflow-y-auto z-10 pointer-events-auto"
          aria-hidden={!open}
        >
          <div className="sm-panel-inner flex-1 flex flex-col gap-8">
            <ul
              className="sm-panel-list list-none m-0 p-0 flex flex-col gap-2"
              role="list"
            >
              {items && items.length > 0 && items.map((it, idx) => (
                <li className="sm-panel-itemWrap relative overflow-visible leading-none" key={it.label + idx}>
                  <Link
                    className="sm-panel-item group relative inline-block no-underline"
                    to={it.link}
                    aria-label={it.ariaLabel}
                    onClick={closeMenu}
                  >
                    <span className="sm-panel-itemLabel block">
                      <TextRoll className="text-black font-normal text-[2.5rem] leading-tight">
                        {it.label}
                      </TextRoll>
                    </span>
                  </Link>
                </li>
              ))}

              {/* Auth Links */}
              {isAuthenticated ? (
                <>
                  <li className="sm-panel-itemWrap relative overflow-visible leading-none mt-6">
                    <Link
                      to="/profile"
                      className="sm-panel-item group relative inline-block no-underline"
                      onClick={closeMenu}
                    >
                      <span className="sm-panel-itemLabel flex items-center gap-3">
                        <User size={20} className="shrink-0 text-primary" />
                        <TextRoll className="text-primary font-medium text-[1.5rem] leading-none">
                          {user?.firstName || 'Profile'}
                        </TextRoll>
                      </span>
                    </Link>
                  </li>
                  <li className="sm-panel-itemWrap relative overflow-visible leading-none">
                    <button
                      onClick={() => { onLogout?.(); closeMenu(); }}
                      className="sm-panel-item group relative inline-block no-underline bg-transparent border-0 p-0 cursor-pointer text-left w-full"
                    >
                      <span className="sm-panel-itemLabel flex items-center gap-3">
                        <LogOut size={16} className="shrink-0 text-gray-400" />
                        <TextRoll className="text-gray-400 font-medium text-[1.2rem] leading-none">
                          Logout
                        </TextRoll>
                      </span>
                    </button>
                  </li>
                </>
              ) : (
                <li className="sm-panel-itemWrap relative overflow-visible leading-none mt-6">
                  <Link
                    to="/login"
                    className="sm-panel-item group relative inline-block no-underline"
                    onClick={closeMenu}
                  >
                    <span className="sm-panel-itemLabel flex items-center gap-3">
                      <LogIn size={24} className="text-primary" />
                      <TextRoll className="text-primary font-medium text-[1.8rem] leading-tight">
                        Login
                      </TextRoll>
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </aside>
      </div>

      <style>{`
.sm-scope .staggered-menu-wrapper { position: relative; width: 100%; height: 100%; z-index: 40; pointer-events: none; }
.sm-scope .staggered-menu-header { position: absolute; top: 0; left: 0; width: 100%; padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; background: transparent; pointer-events: none; z-index: 20; }
.sm-scope .sm-logo-img { display: block; height: 32px; width: auto; object-fit: contain; }
.sm-scope .sm-toggle { position: relative; display: flex; align-items: center; justify-content: center; background: transparent !important; border: none !important; box-shadow: none !important; cursor: pointer; color: inherit; line-height: 1; overflow: visible; -webkit-tap-highlight-color: transparent; }
.sm-scope .sm-icon { position: relative; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; will-change: transform; }
.sm-scope .sm-icon-line { position: absolute; left: 0; right: 0; height: 3px; background: currentColor; border-radius: 4px; transform-origin: center; will-change: transform; transition: color 0.3s ease; }

.sm-scope .staggered-menu-panel { position: absolute; top: 0; right: 0; width: 100%; height: 100%; background: radial-gradient(at 0% 0%, rgba(63, 41, 101, 0.05) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(221, 23, 100, 0.05) 0px, transparent 50%), #FFF5F8; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; flex-direction: column; padding: 6rem 2rem 2rem 2rem; overflow-y: auto; z-index: 10; scroll-behavior: smooth; }

.sm-scope .sm-panel-item { 
  display: inline-block; 
  font-family: 'Source Serif 4', serif; 
  cursor: pointer;
}

@media (max-width: 768px) { 
  .sm-scope .staggered-menu-panel { width: 100%; padding: 5rem 1.5rem 2rem 1.5rem; } 
  .sm-scope .staggered-menu-header { padding: 0.5rem 1rem; }
}
      `}</style>
    </div>
  );
};

export default StaggeredMenu;
