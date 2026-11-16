// Forsiden: toppen skifter farve med sektionen, kortene glider ind, og app-kortene kan prøves.
(function () {
  // Toppen er altid mørk: fjord i toppen og i bunden, ellers dyb fjord.
  const colors = { fjord: "#2E4A5C", deep: "#1B2D38", soft: "#36566A", sun: "#1B2D38", sky: "#1B2D38", mist: "#1B2D38" };
  const bar = document.querySelector(".bar");
  const sections = document.querySelectorAll("main section[data-bg]");

  if ("IntersectionObserver" in window) {
    // Den sektion, der ligger lige under toppen, bestemmer dens farve.
    const barWatch = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && bar) bar.style.setProperty("--barbg", colors[e.target.dataset.bg]);
      });
    }, { rootMargin: "-68px 0px -85% 0px" });
    sections.forEach(function (s) { barWatch.observe(s); });

    const reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); reveal.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    document.querySelectorAll(".reveal").forEach(function (el) { reveal.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  // Booking: den ledige uge bliver Sofies.
  document.querySelectorAll("[data-book]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const card = btn.closest(".ui");
      const free = card.querySelector(".wk.free");
      if (free) {
        free.classList.remove("free");
        free.style.background = btn.dataset.color;
        free.style.color = "#FFFFFF";
        free.lastChild.textContent = btn.dataset.who;
      }
      btn.classList.add("is-done");
      btn.disabled = true;
      card.querySelector("[data-done]").hidden = false;
    });
  });

  // Opgaver: flueben til og fra.
  document.querySelectorAll(".tick").forEach(function (b) {
    b.addEventListener("click", function () {
      b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
    });
  });

  // Send linket til familien: telefonens del-menu, ellers kopiér linket.
  document.querySelectorAll("[data-share]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const d = btn.dataset;
      const note = btn.closest(".wrap").querySelector("[data-share-note]");
      if (navigator.share) {
        navigator.share({ title: d.title, text: d.text, url: d.url }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(d.text + " " + d.url).then(function () {
          note.textContent = d.copied;
          note.hidden = false;
        });
      }
    });
  });

  // Gør op: markér som betalt.
  document.querySelectorAll("[data-settle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.textContent = btn.dataset.doneText;
      btn.classList.add("is-done");
      btn.disabled = true;
      btn.closest(".ui").querySelectorAll(".row b").forEach(function (b) { b.textContent = "0 kr."; });
    });
  });
})();
