// Smooth scroll for navigation
const navLinks = document.querySelectorAll('nav a');
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Fun project card animation on click
const cards = document.querySelectorAll('.project-card');
cards.forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('active');
    card.style.background = card.classList.contains('active') ? '#ffe0b2' : '';
  });
});

// Contact form AJAX submission
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formStatus.textContent = 'Sending...';
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());
    try {
      const res = await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        formStatus.textContent = 'Message sent! Thank you!';
        contactForm.reset();
      } else {
        formStatus.textContent = 'Error: ' + (result.error || 'Could not send message.');
      }
    } catch (err) {
      formStatus.textContent = 'Error sending message.';
    }
  });
}

// Animate progress bars when skills section is in view
function animateSkillBars() {
  const bars = document.querySelectorAll('.skill-bar');
  bars.forEach(bar => {
    const fill = bar.querySelector('.fill');
    const width = fill.getAttribute('style').match(/width: ([0-9]+%)/);
    if (width) {
      bar.style.setProperty('--bar-width', width[1]);
      bar.classList.add('visible');
    }
  });
}

function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top < window.innerHeight - 80 &&
    rect.bottom > 80
  );
}

window.addEventListener('scroll', () => {
  const skillsSection = document.querySelector('.skills-section');
  if (skillsSection && isInViewport(skillsSection)) {
    animateSkillBars();
  }
});

// Initial check in case already in view
window.addEventListener('DOMContentLoaded', () => {
  const skillsSection = document.querySelector('.skills-section');
  if (skillsSection && isInViewport(skillsSection)) {
    animateSkillBars();
  }
});

document.getElementById('theme-toggle').addEventListener('click', function() {
  document.body.classList.toggle('dark-mode');
  // Optional: Change icon
  this.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

// Simple carousel for KGL project card
(function(){
  const track = document.querySelector('.kgl-carousel .carousel-track');
  if (!track) return;

  const slides = Array.from(track.querySelectorAll('img'));
  const prev = document.querySelector('.kgl-carousel .carousel-btn.prev');
  const next = document.querySelector('.kgl-carousel .carousel-btn.next');
  const thumbs = Array.from(document.querySelectorAll('.kgl-carousel .carousel-thumbs img'));
  let index = 0;

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    thumbs.forEach((t,i)=> t.classList.toggle('active', i===index));
  }

  prev.addEventListener('click', ()=> {
    index = (index - 1 + slides.length) % slides.length;
    update();
  });

  next.addEventListener('click', ()=> {
    index = (index + 1) % slides.length;
    update();
  });

  thumbs.forEach(t => t.addEventListener('click', (e)=>{
    index = Number(e.currentTarget.dataset.index) || 0;
    update();
  }));

  // auto-play (optional) — comment out if not desired
  let autoplay = setInterval(()=> {
    index = (index + 1) % slides.length; update();
  }, 4500);

  // pause on hover
  const carousel = document.querySelector('.kgl-carousel');
  carousel.addEventListener('mouseenter', ()=> clearInterval(autoplay));
  carousel.addEventListener('mouseleave', ()=> {
    autoplay = setInterval(()=> { index = (index + 1) % slides.length; update(); }, 4500);
  });

  // init
  update();
})();
