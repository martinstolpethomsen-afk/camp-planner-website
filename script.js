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
