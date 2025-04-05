// --- Simple Counter Animation ---
function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    // Use easing function for smoother animation
    const easedProgress =
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    obj.innerHTML = Math.floor(easedProgress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end; // Ensure final value is exact
    }
  };
  window.requestAnimationFrame(step);
}

const waitlistCounter = document.getElementById("waitlist-count");
let counterAnimated = false; // Flag to ensure animation runs only once

// --- Animate Elements on Scroll ---
const observerOptions = {
  root: null, // relative to document viewport
  rootMargin: "0px",
  threshold: 0.1, // trigger when 10% of the element is visible
};

const observerCallback = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Add 'visible' class to trigger CSS animation
      entry.target.classList.add("visible");

      // Animate counter when its container becomes visible
      if (
        entry.target.classList.contains("early-adopter") &&
        waitlistCounter &&
        !counterAnimated
      ) {
        setTimeout(() => {
          animateValue(waitlistCounter, 0, 1, 1200); // Count up to 1 over 1200ms
          counterAnimated = true; // Set flag
        }, 300); // Short delay after section appears
      }

      observer.unobserve(entry.target); // Stop observing once visible
    }
  });
};

const scrollObserver = new IntersectionObserver(
  observerCallback,
  observerOptions
);

// Observe all elements that need the scroll animation effect
const elementsToAnimate = document.querySelectorAll(".animate-on-scroll");
elementsToAnimate.forEach((el) => {
  // Apply staggered delay for benefit and step cards based on their order in the HTML
  // This can be done more robustly if needed, but inline styles work for now
  scrollObserver.observe(el);
});

// Initialize Supabase client correctly
const supabaseUrl = "https://ssdxnzytputskovimgyc.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZHhuenl0cHV0c2tvdmltZ3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NTU3NTMsImV4cCI6MjA1OTQzMTc1M30.LecOHl7vVG3i2a2dpZ-AOFm046WnyAaBeaDXLJ6enLA";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- Simple Form Handling ---
const signupForm = document.getElementById("signup-form");
const formMessage = document.getElementById("form-message");
const submitButton = signupForm
  ? signupForm.querySelector('button[type="submit"]')
  : null;

if (signupForm && formMessage && submitButton) {
  signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Disable button immediately
    submitButton.disabled = true;
    submitButton.style.opacity = "0.7";
    submitButton.style.cursor = "not-allowed";

    // Get form data
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const isValidPhone = /^[6-9]\d{9}$/.test(phone);

    try {
      if (!name || !email || !phone || !isValidPhone) {
        throw new Error("Please fill all fields correctly");
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from("waitlist")
        .select("email")
        .eq("email", email)
        .single();

      if (existingUser) {
        throw new Error(
          "This email is already registered! Please use a different email address."
        );
      }

      // Insert data into Supabase
      const { data, error } = await supabase.from("waitlist").insert([
        {
          name,
          email,
          phone,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        // Check for unique constraint violation
        if (error.code === "23505") {
          throw new Error(
            "This email is already registered! Please use a different email address."
          );
        }
        throw error;
      }

      // Show success message
      formMessage.textContent =
        "✅ Thank you for joining! We'll notify you soon!";
      formMessage.style.color = "var(--success)";
      formMessage.style.opacity = "1";

      // Update button
      submitButton.innerHTML = '<span class="test-emoji">👍</span> Submitted!';
      submitButton.classList.remove("pulse");

      // Clear form
      signupForm.reset();
    } catch (error) {
      console.error("Error:", error);
      formMessage.textContent =
        error.message || "Something went wrong. Please try again.";
      formMessage.style.color = "#f44336";
      formMessage.style.opacity = "1";

      // Re-enable button on error
      submitButton.disabled = false;
      submitButton.style.opacity = "1";
      submitButton.style.cursor = "pointer";
    }

    // Hide message after 5 seconds
    setTimeout(() => {
      formMessage.style.opacity = "0";
    }, 5000);
  });
}

// --- Footer Year ---
const yearSpan = document.getElementById("current-year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// --- Share Button Message ---
const shareMessageEl = document.getElementById("share-message");
let shareTimeout;

function showShareMessage(message) {
  if (shareMessageEl) {
    clearTimeout(shareTimeout); // Clear previous timeout if any
    shareMessageEl.textContent = message;
    shareMessageEl.style.opacity = "1";
    shareTimeout = setTimeout(() => {
      shareMessageEl.style.opacity = "0";
    }, 3000); // Hide message after 3 seconds
  } else {
    alert(message); // Fallback if element not found
  }
}

// --- Scroll Down Link Handler ---
const scrollLink = document.querySelector(".scroll-down");
if (scrollLink) {
  scrollLink.addEventListener("click", function (e) {
    e.preventDefault();
    const targetSection = document.getElementById("signup-form-section");
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}
