const items = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
},{threshold:.14});
items.forEach(el=>io.observe(el));

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const actions = document.querySelector('.header-actions');
if(menu){
  menu.addEventListener('click',()=>{
    const open = nav.style.display === 'flex';
    nav.style.display = open ? 'none' : 'flex';
    actions.style.display = open ? 'none' : 'flex';
    nav.style.position = actions.style.position = 'absolute';
    nav.style.top = '70px'; nav.style.left = '14px'; nav.style.right = '14px';
    nav.style.flexDirection = 'column'; nav.style.padding = '18px'; nav.style.borderRadius = '16px'; nav.style.background = 'rgba(4,10,18,.96)';
    actions.style.top = '266px'; actions.style.left = '14px'; actions.style.right = '14px'; actions.style.background = 'rgba(4,10,18,.96)'; actions.style.padding = '0 18px 18px'; actions.style.borderRadius = '0 0 16px 16px';
  });
}


// CP-004 newsletter form helper
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newsletterForm");
  if (!form) return;
  form.addEventListener("submit", () => {
    setTimeout(() => {
      const btn = form.querySelector("button");
      if (btn) btn.textContent = "Opening email…";
    }, 50);
  });
});


// CP-026: lightweight reveal fallback
(function(){
  if (!('IntersectionObserver' in window)) return;
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});
  items.forEach(function(item){ obs.observe(item); });
})();


/* CP060_COOKIE_CONSENT_BANNER */
(function () {
  var storageKey = "campPlannerCookieConsent";
  var existing = null;
  try { existing = localStorage.getItem(storageKey); } catch (e) {}

  function buildBanner() {
    if (document.getElementById("cp-cookie-banner")) return;

    var banner = document.createElement("div");
    banner.id = "cp-cookie-banner";
    banner.className = "cp-cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", "Cookie notice");

    banner.innerHTML =
      '<div class="cp-cookie-copy">' +
        '<strong>Cookies & privacy</strong>' +
        '<p>We use necessary cookies to make the site work. With your consent, we may also use optional cookies for analytics and embedded services. You can change your choice at any time.</p>' +
        '<div class="cp-cookie-links">' +
          '<a href="/legal/cookie-policy.html">Cookie Policy</a>' +
          '<a href="/legal/privacy-policy.html">Privacy Policy</a>' +
        '</div>' +
      '</div>' +
      '<div class="cp-cookie-actions">' +
        '<button type="button" class="cp-cookie-btn cp-cookie-secondary" data-choice="necessary">Necessary only</button>' +
        '<button type="button" class="cp-cookie-btn cp-cookie-primary" data-choice="accepted">Accept all</button>' +
      '</div>';

    document.body.appendChild(banner);

    banner.querySelectorAll("button[data-choice]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var choice = btn.getAttribute("data-choice");
        try {
          localStorage.setItem(storageKey, JSON.stringify({
            choice: choice,
            timestamp: new Date().toISOString(),
            version: "CP060"
          }));
        } catch (e) {}
        banner.classList.add("cp-cookie-hide");
        setTimeout(function () {
          if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
        }, 280);
      });
    });
  }

  if (!existing) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", buildBanner);
    } else {
      buildBanner();
    }
  }

  window.CampPlannerCookieConsent = {
    reset: function () {
      try { localStorage.removeItem(storageKey); } catch (e) {}
      buildBanner();
    }
  };
})();

/* CP061_MOBILE_MENU_FIX */
(function(){
  function init(){
    document.querySelectorAll(".cp31-header").forEach(function(header){
      var toggle=header.querySelector(".cp-mobile-toggle");
      var nav=header.querySelector(".cp31-nav");
      if(!toggle||!nav||toggle.dataset.cp061Ready==="1") return;
      toggle.dataset.cp061Ready="1";
      toggle.addEventListener("click",function(){
        var open=nav.classList.toggle("is-open");
        toggle.classList.toggle("is-open",open);
        toggle.setAttribute("aria-expanded",open?"true":"false");
      });
      nav.querySelectorAll("a").forEach(function(link){
        link.addEventListener("click",function(){
          nav.classList.remove("is-open");
          toggle.classList.remove("is-open");
          toggle.setAttribute("aria-expanded","false");
        });
      });
    });
  }
  if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init);}else{init();}
})();
