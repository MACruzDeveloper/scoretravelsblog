# Performance Optimization Guide

## Changes Implemented

### 1. Font Display Optimization ✅
- **index.html**: Added preload links for critical Catamaran fonts
  - Preload Regular and SemiBold weights with `crossorigin`
  - Added preconnect to Google Fonts CDN for DNS prefetch
- **_fonts.scss**: 
  - Updated Google Fonts import with `display=swap` parameter
  - Added `size-adjust: 100%` to prevent font size shifts during loading
  - Already using `font-display: swap` for optimal text visibility

### 2. LCP (Largest Contentful Paint) Optimization ✅
- **Carousel.tsx**:
  - Added `fetchpriority="high"` to active slide (first video/image)
  - Added `fetchpriority="low"` to previous slide (off-screen)
  - Added `preload="auto"` to video element for early loading
  - Added `decoding="async"` for non-blocking image decoding
- **index.html**: 
  - Preload critical fonts before main script
  - Preload Google Fonts stylesheet

### 3. Cache Lifetimes for Static Assets ✅
- **nginx-scoretravelsblog.conf**:
  - Fonts: 1 year cache with `immutable` flag (never changes)
  - CSS/JS: 30 days cache with must-revalidate
  - Images: 90 days cache with Vary Accept header
  - HTML: no-cache (always check for updates)
  - API responses: 5 minutes cache

### 4. Image Delivery Optimization ✅
- **Carousel.tsx**:
  - Added `fetchpriority="high"` for LCP image
  - Added `loading="lazy"` for lazy-loaded images
  - Added `decoding="async"` for non-blocking decode
- **_Image.tsx**:
  - Added `loading="lazy"` for all gallery images
  - Added `decoding="async"` for performance

### 5. Reduce Unused JavaScript ✅
- **vite.config.ts**:
  - Added bundle optimization with manual chunks for better tree-shaking:
    - `vendor-react`: React, React DOM, React Router
    - `vendor-ui`: Moment, DOMPurify
    - `vendor-icons`: React Icons (SVG icons)
    - `vendor-map`: Leaflet and React Leaflet
    - `vendor-zustand`: Zustand state management
  - Enabled Terser minification with `drop_console` for production
  - Enabled CSS code splitting
  - Disabled source maps in production

### 6. Additional Optimizations ✅
- **nginx.conf**:
  - Enabled gzip compression for text/font/JSON content
  - Added `gzip_vary` header for cache-aware clients
  - Configured HTTP/2 for multiplexing
  - Added proper Vary headers for responsive images

---

## How to Verify Improvements

### Using Chrome DevTools
1. Open DevTools → Performance tab
2. Click Record and reload the page
3. Look for:
   - **LCP (Largest Contentful Paint)**: Should be < 2.5s (target)
   - **FID (First Input Delay)**: Should be < 100ms
   - **CLS (Cumulative Layout Shift)**: Should be < 0.1

### Using Chrome Lighthouse
1. Open DevTools → Lighthouse tab
2. Click "Analyze page load"
3. Check Performance score (target: > 80)
4. Review recommendations in report

### Using PageSpeed Insights
1. Go to https://pagespeed.web.dev/
2. Enter your domain
3. Check scores for Mobile and Desktop
4. Review Core Web Vitals metrics

### Using WebPageTest
1. Go to https://www.webpagetest.org/
2. Enter your domain
3. Run test and check:
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Time to Interactive (TTI)

---

## Additional Recommendations

### 1. Image Format Optimization
- Convert images to WebP/AVIF format for smaller file sizes
- Use srcset and sizes attributes for responsive images
- Example:
  ```html
  <img 
    src="image.jpg"
    srcset="image-small.webp 480w, image-medium.webp 800w"
    sizes="(max-width: 600px) 480px, 800px"
    loading="lazy"
    decoding="async"
  />
  ```

### 2. Code Splitting Opportunities
- Already lazy loading major sections (Carousel, LastExperiences, etc.)
- Consider code splitting heavy components:
  - Map components
  - Admin components
  - Gallery components

### 3. Critical Request Chain Reduction
- Preload only critical fonts
- Defer non-critical JavaScript
- Load analytics/tracking scripts asynchronously

### 4. Font Subsetting
- Consider subsetting Catamaran font to only include used characters
- Google Fonts already supports subsetting with `?text=` parameter

### 5. Video Optimization
- Ensure video is in modern format (MP4 with H.264 codec)
- Consider providing multiple qualities with `<source>` tags
- Use `preload="none"` for non-hero videos

### 6. Resource Hints
- **DNS Prefetch**: `<link rel="dns-prefetch" href="//api.example.com">`
- **Preconnect**: `<link rel="preconnect" href="//cdn.example.com">`
- **Prefetch**: For next-page resources
- **Prerender**: For highly likely navigation targets

---

## Build Commands

### Development
```bash
npm run dev
```
Components lazy load, no minification

### Production Build
```bash
npm run build
```
Optimizes bundle with:
- Terser minification
- Manual chunk splitting
- CSS code splitting
- Console log removal

### Preview Production Build
```bash
npm run preview
```
Test production build locally before deployment

---

## Monitoring Checklist

- [ ] Verify fonts load with swap strategy
- [ ] Check LCP is < 2.5s (target)
- [ ] Verify images lazy load correctly
- [ ] Check bundle size reduction in build output
- [ ] Verify cache headers with DevTools (Network tab)
- [ ] Test on slow network (DevTools throttling)
- [ ] Check Core Web Vitals with Lighthouse
- [ ] Monitor Real User Metrics (RUM) in production

