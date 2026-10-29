/**
 * ============================================================================
 * COMMON VIEW HELPERS & UTILITIES (MVME Architecture)
 * Layer: View Support / UI Helpers
 * ============================================================================
 */

(function() {
  /**
   * Renders a Lucide icon HTML markup
   * @param {string} iconName
   * @param {string} extraClass
   * @returns {string} HTML string
   */
  function renderIcon(iconName, extraClass = '') {
    return `<i data-lucide="${iconName}" class="${extraClass}"></i>`;
  }

  /**
   * Escapes HTML characters for safe input/attribute values
   * @param {string} str
   * @returns {string} Escaped string
   */
  function escapeHtmlAttr(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Parses duration string or number into seconds
   * @param {string|number} durationStr
   * @returns {number} Seconds
   */
  function parseDurationToSeconds(durationStr) {
    if (!durationStr) return 900;
    if (typeof durationStr === 'number') return Math.max(1, Math.floor(durationStr));
    const str = String(durationStr).trim().toLowerCase();
    
    // Check for "MM:SS" or "HH:MM:SS"
    if (str.includes(':')) {
      const parts = str.split(':').map(p => parseInt(p, 10) || 0);
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    
    // Check for "X mins", "X min", "X m"
    const minMatch = str.match(/(\d+)\s*(?:mins|min|minutes|minute|m\b)/);
    if (minMatch) return parseInt(minMatch[1], 10) * 60;
    
    // Check for "X hours", "X hrs", "X h"
    const hrMatch = str.match(/(\d+)\s*(?:hours|hrs|hr|h\b)/);
    if (hrMatch) return parseInt(hrMatch[1], 10) * 3600;

    // Check for "X secs", "X s"
    const secMatch = str.match(/(\d+)\s*(?:secs|sec|seconds|second|s\b)/);
    if (secMatch) return parseInt(secMatch[1], 10);

    const num = parseInt(str, 10);
    return isNaN(num) ? 900 : num * 60;
  }

  /**
   * Formats seconds into MM:SS string
   * @param {number} seconds
   * @returns {string} Formatted time string
   */
  function formatSeconds(seconds) {
    const sec = Math.max(0, Math.floor(seconds || 0));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  /**
   * Generates video player embed HTML (YouTube, Vimeo, direct mp4, or iframe fallback)
   * Supports starting at a specific timestamp for resume playback
   * @param {string} contentUrl
   * @param {number} startTime Optional start timestamp in seconds
   * @param {string} elementId Optional HTML element id
   * @returns {string} HTML string
   */
  // --------------------------------------------------------------------------
  // GLOBAL EDUCATIONAL VIDEO & RESILIENT FALLBACK REGISTRY
  // --------------------------------------------------------------------------
  const KNOWN_BROKEN_VIDEO_IDS = new Set([
    'P3RXtoYCF4U',
    '8hly31xKLI0',
    '5vcj8kSwBCY',
    'Qe453-yYjbg',
    'SqsC34ghxCM',
    'ndSpJq7q4G8'
  ]);

  window._failedVideoIds = window._failedVideoIds || new Set(KNOWN_BROKEN_VIDEO_IDS);

  const TOPIC_VIDEO_REGISTRY = {
    // 1. Chemistry: Atomic Models, Electron Shells & Periodic Trends
    'res-chem-road-1': {
      topic: 'Atomic Models, Electron Shells & Periodic Trends',
      subject: 'chem',
      primary: {
        url: 'https://www.youtube.com/embed/jMvG_IeSWCs',
        title: 'Atomic Structure, Electron Configuration & Periodic Trends (Eurekha)'
      },
      fallbacks: [
        { url: 'https://www.youtube.com/embed/rcKilE9CdaA', title: 'The Electron: CrashCourse #5 (Bohr, Orbitals & Trends)' },
        { url: 'https://www.youtube.com/embed/0RRVV4Diomg', title: 'The Periodic Table: CrashCourse #4 (Periodic Trends)' },
        { url: 'https://www.youtube.com/embed/NSAgLvKOPLQ', title: 'Models of the Atom Timeline (Tyler DeWitt)' },
        { url: 'https://www.youtube.com/embed/Gy9HR65DpYQ', title: 'Periodic Trends: Ionization Energy & Electronegativity (Organic Chem Tutor)' },
        { url: 'https://www.youtube.com/embed/NIwcDnFjj98', title: 'Electron Configuration - Basic Introduction (Organic Chem Tutor)' }
      ]
    },
    // 2. Computer Science: Data Structures, Big-O Complexity & Sorting Algorithms
    'res-cs-road-2': {
      topic: 'Data Structures, Big-O Complexity & Sorting Algorithms',
      subject: 'cs',
      primary: {
        url: 'https://www.youtube.com/embed/CBYHwZcbD-s',
        title: 'Data Structures & Algorithms Full Course (Bro Code - Arrays, Lists, Trees, Sorting)'
      },
      fallbacks: [
        { url: 'https://www.youtube.com/embed/8hly31xKli0', title: 'Algorithms and Data Structures Tutorial (freeCodeCamp)' },
        { url: 'https://www.youtube.com/embed/RBSGKlAvoiM', title: 'Data Structures Easy to Advanced (William Fiset / freeCodeCamp)' }
      ]
    },
    // 3. Chemistry: Organic Functional Groups & Reaction Mechanisms
    'res-chem-road-2': {
      topic: 'Organic Functional Groups & Reaction Mechanisms',
      subject: 'chem',
      primary: {
        url: 'https://www.youtube.com/embed/ORMUTUhYjvg',
        title: 'Intro to Reaction Mechanisms: Crash Course Organic Chemistry #13'
      },
      fallbacks: [
        { url: 'https://www.youtube.com/embed/z43b8WbMsmw', title: 'Functional Groups Review' }
      ]
    },
    // 4. Computer Science: System Design & Microservices
    'res-cs-road-4': {
      topic: 'System Design, DevOps & Distributed Microservices',
      subject: 'cs',
      primary: {
        url: 'https://www.youtube.com/embed/m8Icp_Cid5o',
        title: 'System Design Course for Beginners (freeCodeCamp)'
      },
      fallbacks: [
        { url: 'https://www.youtube.com/embed/zQnBQ4tB3ZA', title: 'Full Stack Web Architecture & REST API Engineering' }
      ]
    },
    // 5. Physics: Quantum Mechanics & Double Slit
    'res-phys-road-3': {
      topic: 'Quantum Mechanics, Wave Function & Double Slit',
      subject: 'physics',
      primary: {
        url: 'https://www.youtube.com/embed/7kb1VT0J3DE',
        title: 'Quantum Mechanics - Part 1: Crash Course Physics #43'
      },
      fallbacks: [
        { url: 'https://www.youtube.com/embed/qO_W70VegbQ', title: 'Quantum Mechanics - Part 2: Crash Course Physics #44' }
      ]
    },
    // 6. AI: Transformers & LLMs
    'res-ai-road-4': {
      topic: 'Transformers & LLM Architectures (Attention Mechanism)',
      subject: 'ai',
      primary: {
        url: 'https://www.youtube.com/embed/eMlx5fFNoYc',
        title: 'Attention in transformers, visually explained (3Blue1Brown)'
      },
      fallbacks: [
        { url: 'https://www.youtube.com/embed/aircAruvnKk', title: 'AI Neural Networks Foundation' }
      ]
    }
  };

  window.TOPIC_VIDEO_REGISTRY = TOPIC_VIDEO_REGISTRY;

  function extractYouTubeId(url) {
    if (!url) return null;
    const match = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  function isVideoIdUnavailable(idOrUrl) {
    if (!idOrUrl) return false;
    const id = extractYouTubeId(idOrUrl) || idOrUrl;
    return window._failedVideoIds.has(id);
  }

  /**
   * Resolves fallback videos by resource ID or topic keyword matching
   */
  function getTopicFallbackEntry(resourceId, metadata = {}) {
    if (resourceId && TOPIC_VIDEO_REGISTRY[resourceId]) {
      return TOPIC_VIDEO_REGISTRY[resourceId];
    }
    const topicText = `${metadata.title || ''} ${metadata.topic || ''} ${metadata.subjectId || ''}`.toLowerCase();
    
    // Chemistry topic keywords
    if (topicText.includes('atomic') || topicText.includes('electron') || topicText.includes('periodic') || topicText.includes('bohr')) {
      return TOPIC_VIDEO_REGISTRY['res-chem-road-1'];
    }
    // Computer science topic keywords
    if (topicText.includes('data structure') || topicText.includes('sorting') || topicText.includes('big-o') || topicText.includes('algorithm') || topicText.includes('linked list') || topicText.includes('binary tree')) {
      return TOPIC_VIDEO_REGISTRY['res-cs-road-2'];
    }
    // Organic chemistry
    if (topicText.includes('organic') || topicText.includes('functional group') || topicText.includes('reaction mechanism')) {
      return TOPIC_VIDEO_REGISTRY['res-chem-road-2'];
    }
    // System design
    if (topicText.includes('system design') || topicText.includes('microservice') || topicText.includes('distributed')) {
      return TOPIC_VIDEO_REGISTRY['res-cs-road-4'];
    }
    // Quantum physics
    if (topicText.includes('quantum') || topicText.includes('double slit') || topicText.includes('wave function')) {
      return TOPIC_VIDEO_REGISTRY['res-phys-road-3'];
    }
    // Transformers & LLM
    if (topicText.includes('transformer') || topicText.includes('attention') || topicText.includes('llm')) {
      return TOPIC_VIDEO_REGISTRY['res-ai-road-4'];
    }

    return null;
  }

  /**
   * Builds the full list of candidates (primary + fallbacks) for a video resource
   */
  function getCandidateVideos(contentUrl, fallbackUrls = [], metadata = {}) {
    const list = [];
    const seenUrls = new Set();
    const resId = metadata.resourceId || metadata.id;

    function addVideo(url, title) {
      if (!url) return;
      const cleanUrl = url.trim();
      const vidId = extractYouTubeId(cleanUrl);
      const key = vidId || cleanUrl;
      if (!seenUrls.has(key)) {
        seenUrls.add(key);
        list.push({ url: cleanUrl, title: title || (vidId ? `Lecture (${vidId.substring(0, 5)})` : 'Lecture') });
      }
    }

    // 1. Registry entry if available
    const regEntry = getTopicFallbackEntry(resId, metadata);
    if (regEntry) {
      if (regEntry.primary) addVideo(regEntry.primary.url, regEntry.primary.title);
      if (Array.isArray(regEntry.fallbacks)) {
        regEntry.fallbacks.forEach(fb => addVideo(fb.url, fb.title));
      }
    }

    // 2. Primary URL
    if (contentUrl) {
      addVideo(contentUrl, metadata.title || 'Primary Lecture');
    }

    // 3. Fallback URLs from data model
    if (Array.isArray(fallbackUrls)) {
      fallbackUrls.forEach((fbUrl, i) => {
        addVideo(fbUrl, `Alternate Lecture ${i + 1}`);
      });
    }

    return list;
  }

  /**
   * Generates video player embed HTML with automatic fallback switching and lecture source selection
   * @param {string} contentUrl
   * @param {number} startTime Optional start timestamp in seconds
   * @param {string} elementId Optional HTML element id
   * @param {Array} fallbackUrls Optional array of alternate embed URLs
   * @param {Object} metadata Optional metadata ({ resourceId, title, topic, subjectId })
   * @returns {string} HTML string
   */
  function getVideoPlayerHtml(contentUrl, startTime = 0, elementId = 'active-video-player', fallbackUrls = [], metadata = {}) {
    if (!contentUrl && (!fallbackUrls || fallbackUrls.length === 0)) return '';
    const initialUrl = (contentUrl || '').trim();
    const startSec = Math.max(0, Math.floor(startTime || 0));
    const candidates = getCandidateVideos(initialUrl, fallbackUrls, metadata);

    // Filter candidates to find the first non-broken URL
    let activeCandidate = candidates.find(c => !isVideoIdUnavailable(c.url));
    if (!activeCandidate && candidates.length > 0) {
      activeCandidate = candidates[0];
    }
    const currentUrl = activeCandidate ? activeCandidate.url : initialUrl;
    const isAutoSwitched = initialUrl && isVideoIdUnavailable(initialUrl) && activeCandidate && activeCandidate.url !== initialUrl;

    const ytId = extractYouTubeId(currentUrl);

    // Encode candidate metadata into JSON for dynamic client-side recovery
    const fallbacksJson = JSON.stringify(candidates.map(c => ({ url: c.url, title: c.title })));
    const encodedFallbacks = window.escapeHtmlAttr ? window.escapeHtmlAttr(fallbacksJson) : '';
    const resIdAttr = window.escapeHtmlAttr ? window.escapeHtmlAttr(metadata.resourceId || metadata.id || '') : '';
    const resTitleAttr = window.escapeHtmlAttr ? window.escapeHtmlAttr(metadata.title || '') : '';

    // Notice banner HTML
    const noticeStyle = isAutoSwitched ? 'display:flex;' : 'display:none;';
    const noticeText = isAutoSwitched
      ? `Original video link was unavailable. Automatically loaded verified alternate lecture: <strong>${activeCandidate ? activeCandidate.title : 'Educational Alternate'}</strong>.`
      : '';

    const noticeBanner = `
      <div id="${elementId}-fallback-notice" class="video-auto-fallback-notice" style="${noticeStyle} margin-bottom:12px; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.32); color:var(--text-main); padding:9px 14px; border-radius:var(--radius-sm); font-size:0.82rem; align-items:center; justify-content:space-between; gap:10px; box-shadow:var(--shadow-xs);">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="color:#10b981; display:inline-flex;">${renderIcon('check-circle', 'small-icon')}</span>
          <span id="${elementId}-fallback-notice-text">${noticeText}</span>
        </div>
        <button type="button" onclick="window.autoSwitchToNextVideoFallback('${elementId}', 'user-manual')" style="background:none; border:none; color:var(--color-teal-action); font-size:0.78rem; font-weight:800; cursor:pointer; text-decoration:underline;">Switch Video</button>
      </div>
    `;

    // Alternate lecture pills switcher
    let sourceSwitcherHtml = '';
    if (candidates.length > 1) {
      sourceSwitcherHtml = `
        <div class="video-source-switcher" id="${elementId}-source-switcher" style="display:flex; align-items:center; gap:6px; margin-bottom:14px; flex-wrap:wrap;">
          <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700; display:inline-flex; align-items:center; gap:4px; margin-right:4px;">
            ${renderIcon('video', 'small-icon')} Lecture Source:
          </span>
          ${candidates.map((c, idx) => {
            const isActive = c.url === currentUrl;
            const label = idx === 0 ? 'Primary' : `Alt ${idx}`;
            return `
              <button type="button" class="btn-source-pill ${isActive ? 'active' : ''}" data-player-id="${elementId}" data-url="${window.escapeHtmlAttr(c.url)}" onclick="window.switchVideoPlayerSource('${elementId}', '${window.escapeHtmlAttr(c.url)}', '${window.escapeHtmlAttr(c.title)}')">
                ${isActive ? `${renderIcon('check', 'small-icon')} ` : ''}${label}: ${c.title}
              </button>
            `;
          }).join('')}
        </div>
      `;
    }

    // 1. YouTube Player
    if (ytId) {
      const startParam = startSec > 0 ? `&start=${startSec}` : '';
      const currentOrigin = (window.location && window.location.origin && window.location.origin !== 'null') ? window.location.origin : '';
      const originParam = currentOrigin ? `&origin=${encodeURIComponent(currentOrigin)}` : '';
      const refParam = (window.location && window.location.href) ? `&widget_referrer=${encodeURIComponent(window.location.href)}` : '';
      const embedUrl = `https://www.youtube.com/embed/${ytId}?enablejsapi=1${originParam}${refParam}&autoplay=1&rel=0${startParam}`;
      return `
        <div class="video-player-component" id="${elementId}-component">
          ${noticeBanner}
          <div class="video-embed-wrapper" id="${elementId}-wrapper" data-player-id="${elementId}" data-current-url="${currentUrl}" data-resource-id="${resIdAttr}" data-resource-title="${resTitleAttr}" data-fallbacks="${encodedFallbacks}" style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:var(--radius-md); margin-bottom:12px; background:#000;">
            <iframe id="${elementId}" src="${embedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
          </div>
          ${sourceSwitcherHtml}
        </div>
      `;
    }

    // 2. Direct HTML5 video
    const lowerUrl = currentUrl.toLowerCase();
    const isDirectVideo = lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') || lowerUrl.endsWith('.ogg') ||
                          lowerUrl.endsWith('.mov') || lowerUrl.endsWith('.m4v') ||
                          lowerUrl.includes('.mp4?') || lowerUrl.includes('.webm?') || lowerUrl.includes('.ogg?') ||
                          lowerUrl.includes('.mov?') || lowerUrl.includes('.m4v?') ||
                          lowerUrl.startsWith('data:video/') ||
                          /\.(mp4|webm|ogg|mov|m4v|mkv|avi|3gp|flv)($|\?)/i.test(currentUrl);

    if (isDirectVideo) {
      const videoSrc = startSec > 0 ? `${currentUrl}#t=${startSec}` : currentUrl;
      return `
        <div class="video-player-component" id="${elementId}-component">
          ${noticeBanner}
          <div class="video-embed-wrapper" id="${elementId}-wrapper" data-player-id="${elementId}" data-current-url="${currentUrl}" data-resource-id="${resIdAttr}" data-resource-title="${resTitleAttr}" data-fallbacks="${encodedFallbacks}" style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:var(--radius-md); margin-bottom:12px; background:#000;">
            <video id="${elementId}" controls autoplay style="position:absolute; top:0; left:0; width:100%; height:100%; border:0; border-radius:var(--radius-md);" src="${videoSrc}"></video>
          </div>
          ${sourceSwitcherHtml}
        </div>
      `;
    }

    // 3. Fallback generic iframe
    return `
      <div class="video-player-component" id="${elementId}-component">
        ${noticeBanner}
        <div class="video-embed-wrapper" id="${elementId}-wrapper" data-player-id="${elementId}" data-current-url="${currentUrl}" data-resource-id="${resIdAttr}" data-resource-title="${resTitleAttr}" data-fallbacks="${encodedFallbacks}" style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:var(--radius-md); margin-bottom:12px; background:#000;">
          <iframe id="${elementId}" src="${currentUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
        </div>
        ${sourceSwitcherHtml}
      </div>
    `;
  }

  /**
   * Switches video player source to a specific alternate lecture URL
   */
  window.switchVideoPlayerSource = function(elementId, targetUrl, targetTitle) {
    if (!targetUrl) return;
    const iframe = document.getElementById(elementId);
    const wrapper = document.getElementById(`${elementId}-wrapper`) || (iframe ? iframe.parentElement : null);
    if (!iframe) return;

    const ytId = extractYouTubeId(targetUrl);
    const newSrc = ytId
      ? `https://www.youtube.com/embed/${ytId}?enablejsapi=1&autoplay=1&rel=0`
      : targetUrl;

    if (iframe.src !== newSrc) {
      iframe.src = newSrc;
    }

    if (wrapper) {
      wrapper.setAttribute('data-current-url', targetUrl);
    }

    // Update active state on switcher buttons
    const switcher = document.getElementById(`${elementId}-source-switcher`);
    if (switcher) {
      const pills = switcher.querySelectorAll('.btn-source-pill');
      pills.forEach(p => {
        const pUrl = p.getAttribute('data-url');
        if (pUrl === targetUrl) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
    }

    // Update video title in modal UI if applicable
    if (window.activeVideoState && targetTitle) {
      window.activeVideoState.videoTitle = targetTitle;
    }
  };

  /**
   * Automatically switches the player to the next available working video fallback
   */
  window.autoSwitchToNextVideoFallback = function(elementId, reason) {
    const iframe = document.getElementById(elementId);
    if (!iframe) return;
    const wrapper = document.getElementById(`${elementId}-wrapper`) || iframe.parentElement;
    if (!wrapper) return;

    const currentUrl = wrapper.getAttribute('data-current-url') || iframe.src;
    const failedId = extractYouTubeId(currentUrl);
    if (failedId) {
      window._failedVideoIds.add(failedId);
    }

    // Read candidate fallback list
    let fallbacks = [];
    const rawFallbacks = wrapper.getAttribute('data-fallbacks');
    if (rawFallbacks) {
      try { fallbacks = JSON.parse(rawFallbacks); } catch (_) {}
    }

    // If empty, look up by resource ID or topic
    if (!fallbacks || fallbacks.length === 0) {
      const resId = wrapper.getAttribute('data-resource-id');
      const topicText = wrapper.getAttribute('data-resource-title') || '';
      fallbacks = getCandidateVideos('', [], { resourceId: resId, title: topicText });
    }

    // Find next available candidate that is not failed
    const nextCandidate = fallbacks.find(c => {
      const cid = extractYouTubeId(c.url);
      return !window._failedVideoIds.has(cid) && c.url !== currentUrl;
    });

    if (nextCandidate) {
      console.log(`[LearnAI Video Auto-Recovery] Switching ${elementId} from unavailable video (${failedId}) to:`, nextCandidate.title);
      window.switchVideoPlayerSource(elementId, nextCandidate.url, nextCandidate.title);

      // Display user-friendly auto-recovery notice
      const notice = document.getElementById(`${elementId}-fallback-notice`);
      const noticeText = document.getElementById(`${elementId}-fallback-notice-text`);
      if (notice && noticeText) {
        noticeText.innerHTML = `Original video was unavailable. Automatically switched to verified alternate lecture: <strong>${window.escapeHtmlAttr ? window.escapeHtmlAttr(nextCandidate.title) : nextCandidate.title}</strong>.`;
        notice.style.display = 'flex';
      }
    } else {
      console.warn(`[LearnAI Video] No further fallbacks available for ${elementId}`);
    }
  };

  /**
   * Catches YouTube player error events posted from iframe and triggers auto-fallback
   */
  window.handleYouTubeEmbedError = function(sourceWindow, errorCode) {
    const allWrappers = document.querySelectorAll('.video-embed-wrapper');
    allWrappers.forEach(wrap => {
      const iframe = wrap.querySelector('iframe');
      if (iframe && iframe.contentWindow === sourceWindow) {
        const playerId = wrap.getAttribute('data-player-id') || iframe.id;
        window.autoSwitchToNextVideoFallback(playerId, `YouTube Error ${errorCode}`);
      }
    });
  };

  // Global postMessage error and playback interceptor for embedded YouTube players
  // Intercepts fatal error codes (100: not found, 101/150: embed blocked)
  // And forwards live playback metrics (currentTime, duration, playerState) to video tracker
  window.addEventListener('message', function(event) {
    try {
      let data = event.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (_) { return; }
      }
      if (!data) return;

      // YouTube error event from IFrame API
      if (data.event === 'onError') {
        const errCode = Number(data.info);
        if (errCode === 100 || errCode === 101 || errCode === 150) {
          window.handleYouTubeEmbedError(event.source, errCode);
        }
      } else if (data.event === 'infoDelivery' && data.info && data.info.error) {
        const errCode = Number(data.info.error);
        if (errCode === 100 || errCode === 101 || errCode === 150) {
          window.handleYouTubeEmbedError(event.source, errCode);
        }
      }

      // Live YouTube playback progress and state events
      if (typeof window.handleYouTubePlaybackUpdate === 'function') {
        if (data.event === 'infoDelivery' && data.info) {
          window.handleYouTubePlaybackUpdate(data.info);
        } else if (data.event === 'onStateChange' && data.info !== undefined) {
          window.handleYouTubePlaybackUpdate({ playerState: Number(data.info) });
        }
      }
    } catch (_) {}
  });

  // Export to window for global access across all View and ViewMachine modules
  window.renderIcon = renderIcon;
  window.escapeHtmlAttr = escapeHtmlAttr;
  window.parseDurationToSeconds = parseDurationToSeconds;
  window.formatSeconds = formatSeconds;
  window.getVideoPlayerHtml = getVideoPlayerHtml;
  window.extractYouTubeId = extractYouTubeId;
  window.isVideoIdUnavailable = isVideoIdUnavailable;
})();
