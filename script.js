/* Camp-Planner shared site behaviour */
(function () {
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
    skip.textContent = 'Skip to main content';
    document.body.insertBefore(skip, document.body.firstChild);
  }

  const storageKey = 'cp-external-content-consent';
  const consentScripts = () => [...document.querySelectorAll('script[data-cp-consent][data-src]')];

  function readPreference() {
    try { return localStorage.getItem(storageKey); }
    catch (_) { return null; }
  }

  function writePreference(value) {
    try { localStorage.setItem(storageKey, value); }
    catch (_) { /* The choice remains valid for this page view. */ }
  }

  function clearPreference() {
    try { localStorage.removeItem(storageKey); }
    catch (_) { /* Storage may be unavailable in privacy-restricted browsers. */ }
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

  function setConsent(value) {
    writePreference(value);
    document.querySelector('.cp-consent')?.remove();
    if (value === 'accepted') loadExternalContent();
  }

  function showConsent() {
    if (document.querySelector('.cp-consent')) return;
    const banner = document.createElement('section');
    banner.className = 'cp-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'External content preferences');
    banner.innerHTML = `
      <div>
        <strong>External content</strong>
        <p>We use HubSpot forms and meeting booking when you allow external services. These services may store cookies and process usage data. You can continue without them.</p>
        <a href="/legal/cookie-policy.html">Read our cookie policy</a>
      </div>
      <div class="cp-consent-actions">
        <button type="button" class="btn btn-dark" data-consent="declined">Continue without</button>
        <button type="button" class="btn btn-primary" data-consent="accepted">Allow external services</button>
      </div>`;
    document.body.appendChild(banner);
    banner.querySelectorAll('[data-consent]').forEach((button) => {
      button.addEventListener('click', () => setConsent(button.dataset.consent));
    });
  }

  document.querySelectorAll('[data-open-consent]').forEach((button) => {
    button.addEventListener('click', () => {
      clearPreference();
      showConsent();
    });
  });

  document.querySelectorAll('footer nav').forEach((nav) => {
    if (!nav.querySelector('a[href="/legal/cookie-policy.html"]')) {
      const privacy = document.createElement('a');
      privacy.href = '/legal/privacy-policy.html';
      privacy.textContent = 'Privacy';
      const cookies = document.createElement('a');
      cookies.href = '/legal/cookie-policy.html';
      cookies.textContent = 'Cookies';
      nav.append(privacy, cookies);
    }
  });

  const savedConsent = readPreference();
  if (savedConsent === 'accepted') loadExternalContent();
  else if (consentScripts().length && !savedConsent) showConsent();

  document.querySelectorAll('[data-enable-external]').forEach((button) => {
    button.addEventListener('click', () => setConsent('accepted'));
  });
})();
