/* =====================================
   CORE NAVIGATION & UI
===================================== */
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navPanel = document.querySelector(".nav-panel");
const currentPage = window.location.pathname.split("/").pop() || "index.html";

// Highlight active navigation link
document.querySelectorAll(".nav-panel a").forEach((link) => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  }
});

// Manage header transparency on scroll
const setHeaderState = () => {
  header?.classList.toggle("scrolled", window.scrollY > 18);
};
setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

// Mobile Menu Toggle
navToggle?.addEventListener("click", () => {
  const isOpen = header.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

// Close mobile menu when a link is clicked
navPanel?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    header.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

/* =====================================
   REVEAL ON SCROLL LOGIC
===================================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll(".reveal").forEach((el) => {
  revealObserver.observe(el);
});

/* =====================================
   GALLERY LIGHTBOX SYSTEM
===================================== */
const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox img");
const closeLightbox = document.querySelector(".lightbox-close");

// Open Lightbox
document.querySelectorAll(".masonry-gallery button").forEach((button) => {
  button.addEventListener("click", () => {
    if (lightboxImage && button.dataset.full) {
      lightboxImage.src = button.dataset.full;
      lightboxImage.alt = button.querySelector("img")?.alt || "Gallery Image";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
    }
  });
});

// Close Lightbox function
const closePreview = () => {
  if (!lightbox) return;
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
};

closeLightbox?.addEventListener("click", closePreview);
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closePreview();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePreview();
});

/* =====================================
   BOOKING FORM API SUBMISSION
===================================== */
const bookingForm = document.querySelector(".booking-form");

if (bookingForm) {
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitBtn = bookingForm.querySelector("button[type='submit']");
    const originalBtnText = submitBtn.textContent;

    // Collect all data from the form
    const formData = new FormData(bookingForm);
    const payload = Object.fromEntries(formData.entries());

    // Provide UI feedback
    submitBtn.textContent = "Connecting to Concierge...";
    submitBtn.disabled = true;

    try {
      // POST the data to our Node.js server
      const response = await fetch("http://localhost:3000/send-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Capture the Success HTML from the server
        const successPage = await response.text();
        
        // Render it to the browser
        document.open();
        document.write(successPage);
        document.close();
      } else {
        throw new Error("Server Error");
      }
    } catch (err) {
      console.error("Submission Error:", err);
      submitBtn.textContent = "Error: Try Again";
      submitBtn.disabled = false;
      alert("We encountered an error connecting to our server. Please check your internet or try again later.");
    }
  });
}