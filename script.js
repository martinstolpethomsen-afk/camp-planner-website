/* Camp-Planner shared site behaviour */
(function () {
  const copy = JSON.parse(document.getElementById('cp-site-copy')?.textContent || '{}');
  const launchBar = document.querySelector('.launch-bar');
  if (launchBar) {
    const reserveLaunchSpace = () => document.body.style.setProperty('--cp-launch-height', `${launchBar.getBoundingClientRect().height}px`);
    reserveLaunchSpace();
    if ('ResizeObserver' in window) new ResizeObserver(reserveLaunchSpace).observe(launchBar);
    else window.addEventListener('resize', reserveLaunchSpace);
  }
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in', 'visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('in', 'visible'));
  }

  const header = document.querySelector('header');
  const main = document.querySelector('main');
  if (header && main && !document.querySelector('.skip-link')) {
    if (!main.id) main.id = 'main-content';
    const skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = `#${main.id}`;
    skip.textContent = copy.skip || 'Skip to main content';
    document.body.insertBefore(skip, document.body.firstChild);
  }

  const storageKey = 'cp-external-content-consent';
  const analyticsKey = 'cp-analytics-consent';
  const measurementId = 'G-19CQPS2HDT';
  const analyticsCopy = ({
    da: ['Google Analytics måler besøg, sete sider og aktiv tid, hvis du tillader statistik.', 'Tillad statistik', 'Tillad formularer og booking', 'Gem valg'],
    de: ['Google Analytics misst Besuche, Seitenaufrufe und aktive Zeit, wenn Sie Statistiken erlauben.', 'Statistiken erlauben', 'Formulare und Buchungen erlauben', 'Auswahl speichern'],
    sv: ['Google Analytics mäter besök, sidvisningar och aktiv tid om du tillåter statistik.', 'Tillåt statistik', 'Tillåt formulär och bokning', 'Spara val'],
    nb: ['Google Analytics måler besøk, sidevisninger og aktiv tid hvis du tillater statistikk.', 'Tillat statistikk', 'Tillat skjemaer og bestilling', 'Lagre valg']
  })[document.documentElement.lang] || ['Google Analytics measures visits, page views and active time if you allow statistics.', 'Allow statistics', 'Allow forms and booking', 'Save choices'];
  let analyticsPreference = readAnalyticsPreference();
  let analyticsLoaded = false;
  // Basic consent mode: do not contact Google until statistics are accepted.
  window['ga-disable-' + measurementId] = analyticsPreference !== 'accepted';

  function readAnalyticsPreference() {
    try {
      const value = localStorage.getItem(analyticsKey);
      return value === 'accepted' || value === 'declined' ? value : null;
    } catch (_) { return null; }
  }

  function enableAnalytics() {
    if (analyticsLoaded) return;
    // Keep previews and local development out of production statistics.
    if (!['camp-planner.online', 'www.camp-planner.online'].includes(window.location.hostname)) return;
    analyticsLoaded = true;
    window['ga-disable-' + measurementId] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      allow_google_signals: false, allow_ad_personalization_signals: false,
      // Query strings can contain contact details or form tokens.
      page_location: window.location.origin + window.location.pathname,
      page_referrer: document.referrer.split(/[?#]/)[0],
      cookie_expires: 60 * 60 * 24 * 395
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);
  }

  function setAnalyticsConsent(value) {
    analyticsPreference = value;
    try { localStorage.setItem(analyticsKey, value); } catch (_) { /* Page-only choice. */ }
    window['ga-disable-' + measurementId] = value !== 'accepted';
    if (value === 'accepted') enableAnalytics();
    else {
      // Remove first-party GA cookies and unload an already running tag below.
      document.cookie.split(';').forEach((entry) => {
        const name = entry.trim().split('=')[0];
        if (name !== '_ga' && !name.startsWith('_ga_')) return;
        ['', '; domain=' + window.location.hostname, '; domain=.camp-planner.online'].forEach((domain) => {
          document.cookie = name + '=; Max-Age=0; path=/' + domain;
        });
      });
    }
  }
  const consentScripts = () => [...document.querySelectorAll('script[data-cp-consent][data-src]')];

  function readPreference() {
    try {
      const value = localStorage.getItem(storageKey);
      return value === 'accepted' || value === 'declined' ? value : null;
    }
    catch (_) { return null; }
  }

  function writePreference(value) {
    try { localStorage.setItem(storageKey, value); }
    catch (_) { /* The choice remains valid for this page view. */ }
  }

  function loadExternalContent() {
    consentScripts().forEach((source) => {
      if (source.dataset.loaded === 'true') return;
      const script = document.createElement('script');
      script.src = source.dataset.src;
      script.defer = true;
      script.dataset.loadedByConsent = 'true';
      script.addEventListener('load', () => {
        document.querySelectorAll('[data-consent-placeholder]').forEach((node) => node.remove());
      }, { once: true });
      script.addEventListener('error', () => {
        source.dataset.loaded = 'false';
        document.querySelectorAll('[data-consent-placeholder]').forEach((node) => {
          const message = node.querySelector('p');
          if (message) message.textContent = 'The external service could not be loaded. Please try again or contact hello@camp-planner.online.';
        });
      }, { once: true });
      source.dataset.loaded = 'true';
      document.head.appendChild(script);
    });
  }

  function setConsent(value, analyticsValue) {
    const unloadAnalytics = analyticsLoaded && analyticsValue === 'declined';
    if (analyticsValue) setAnalyticsConsent(analyticsValue);
    writePreference(value);
    document.querySelector('.cp-consent')?.remove();
    if (value === 'accepted') loadExternalContent();
    if (unloadAnalytics || (value === 'declined' && document.querySelector('script[data-loaded-by-consent]'))) {
      // Unload third-party frames/scripts that were already allowed on this view.
      // Existing third-party cookies remain controlled by the visitor's browser.
      window.location.reload();
    }
  }

  function showConsent() {
    if (document.querySelector('.cp-consent')) return;
    const banner = document.createElement('section');
    banner.className = 'cp-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', copy.consentTitle || 'Cookies and external content');
    banner.innerHTML = `
      <div>
        <strong>${copy.consentTitle || 'Cookies and external content'}</strong>
        <p>${copy.consent || 'We use HubSpot forms and meeting booking when you allow external services. These services may store cookies and process usage data. You can continue without them.'}</p>
        <p>${analyticsCopy[0]}</p>
        <div class="cp-consent-options">
          <label><input type="checkbox" data-choice-external ${readPreference() === 'accepted' ? 'checked' : ''}> ${analyticsCopy[2]}</label>
          <label><input type="checkbox" data-choice-analytics ${analyticsPreference === 'accepted' ? 'checked' : ''}> ${analyticsCopy[1]}</label>
        </div>
        <a href="/legal/cookie-policy.html">${copy.policy || 'Read our cookie policy'}</a>
      </div>
      <div class="cp-consent-actions">
        <button type="button" class="btn btn-dark" data-consent="declined">${copy.decline || 'Continue without'}</button>
        <button type="button" class="btn btn-primary" data-consent="save">${analyticsCopy[3]}</button>
      </div>`;
    document.body.appendChild(banner);
    banner.querySelectorAll('[data-consent]').forEach((button) => {
      button.addEventListener('click', () => {
        const save = button.dataset.consent === 'save';
        setConsent(
          save && banner.querySelector('[data-choice-external]').checked ? 'accepted' : 'declined',
          save && banner.querySelector('[data-choice-analytics]').checked ? 'accepted' : 'declined'
        );
      });
    });
  }

  // Keep preferences reachable after either choice, on every content page.
  const settingsHost = document.querySelector('footer nav') || document.querySelector('main');
  if (settingsHost && !document.querySelector('[data-open-consent]')) {
    const settings = document.createElement('button');
    settings.type = 'button';
    settings.className = 'cp-cookie-settings';
    settings.setAttribute('data-open-consent', '');
    settings.textContent = copy.cookieSettings || 'Cookie settings';
    settingsHost.appendChild(settings);
  }
  document.querySelectorAll('[data-open-consent]').forEach((button) => {
    button.addEventListener('click', showConsent);
  });

  document.querySelectorAll('footer nav').forEach((nav) => {
    if (!nav.querySelector('a[href="/legal/cookie-policy.html"]')) {
      const privacy = document.createElement('a');
      privacy.href = '/legal/privacy-policy.html';
      privacy.textContent = copy.privacy || 'Privacy';
      const cookies = document.createElement('a');
      cookies.href = '/legal/cookie-policy.html';
      cookies.textContent = copy.cookies || 'Cookies';
      nav.append(privacy, cookies);
    }
  });

  const savedConsent = readPreference();
  if (savedConsent === 'accepted') loadExternalContent();
  if (analyticsPreference === 'accepted') enableAnalytics();
  if (!savedConsent || !analyticsPreference) showConsent();

  window.addEventListener('storage', (event) => {
    if (event.key === analyticsKey || event.key === null) {
      const next = readAnalyticsPreference();
      if (next !== 'accepted') {
        window['ga-disable-' + measurementId] = true;
        if (analyticsLoaded) window.location.reload();
      } else enableAnalytics();
      analyticsPreference = next;
    }
  });

  document.querySelectorAll('[data-enable-external]').forEach((button) => {
    button.addEventListener('click', () => setConsent('accepted'));
  });
})();
