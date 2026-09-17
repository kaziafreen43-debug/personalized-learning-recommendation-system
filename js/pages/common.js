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
   * Generates video player embed HTML (YouTube, Vimeo, direct mp4, or iframe fallback)
   * @param {string} contentUrl
   * @returns {string} HTML string
   */
  function getVideoPlayerHtml(contentUrl) {
    if (!contentUrl) return '';
    const url = contentUrl.trim();
    
    // 1. YouTube detection and conversion
    const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const ytMatch = url.match(ytRegex);
    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1];
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      return `
        <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:var(--radius-md); margin-bottom:20px; background:#000;">
          <iframe src="${embedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
      `;
    }
    
    // 2. Vimeo detection and conversion
    const vimeoRegex = /(?:vimeo\.com\/(?:video\/|channels\/|groups\/[^\/]+\/videos\/|album\/[0-9]+\/video\/|showcase\/[0-9]+\/video\/)?|player\.vimeo\.com\/video\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch && vimeoMatch[1]) {
      const videoId = vimeoMatch[1];
      const embedUrl = `https://player.vimeo.com/video/${videoId}`;
      return `
        <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:var(--radius-md); margin-bottom:20px; background:#000;">
          <iframe src="${embedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
        </div>
      `;
    }
    
    // 3. Direct video format detection
    const lowerUrl = url.toLowerCase();
    const isDirectVideo = lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') || lowerUrl.endsWith('.ogg') ||
                          lowerUrl.endsWith('.mov') || lowerUrl.endsWith('.m4v') ||
                          lowerUrl.includes('.mp4?') || lowerUrl.includes('.webm?') || lowerUrl.includes('.ogg?') ||
                          lowerUrl.includes('.mov?') || lowerUrl.includes('.m4v?') ||
                          lowerUrl.startsWith('data:video/') ||
                          /\.(mp4|webm|ogg|mov|m4v|mkv|avi|3gp|flv)($|\?)/i.test(url);
                          
    if (isDirectVideo) {
      return `
        <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:var(--radius-md); margin-bottom:20px; background:#000;">
          <video controls autoplay style="position:absolute; top:0; left:0; width:100%; height:100%; border:0; border-radius:var(--radius-md);" src="${url}"></video>
        </div>
      `;
    }
    
    // 4. Default fallback: iframe
    return `
      <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:var(--radius-md); margin-bottom:20px; background:#000;">
        <iframe src="${url}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe>
      </div>
    `;
  }

  // Export to window for global access across all View and ViewMachine modules
  window.renderIcon = renderIcon;
  window.escapeHtmlAttr = escapeHtmlAttr;
  window.getVideoPlayerHtml = getVideoPlayerHtml;
})();
