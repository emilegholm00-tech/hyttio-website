// Foreslår den samme side på besøgendes eget sprog – ud fra telefonens/browserens sprog, ikke landet.
// Vi sender aldrig folk videre af os selv (det ville skjule siderne for Google); vi viser et lille banner.
// Hvilken side der svarer til hvilken, står i sidens <link rel="alternate" hreflang="...">.
(function () {
  const TEXT = {
    da: ["Siden findes på dansk", "Gå til dansk"],
    nb: ["Siden finnes på norsk", "Gå til norsk"],
    sv: ["Sidan finns på svenska", "Gå till svenska"],
    en: ["This page is available in English", "Go to English"],
  };
  const KEY = "hyttio-lang";

  function codeFor(lang) {
    const l = (lang || "").toLowerCase();
    if (l.startsWith("da")) return "da";
    if (l.startsWith("nb") || l.startsWith("nn") || l.startsWith("no")) return "nb";
    if (l.startsWith("sv")) return "sv";
    return "en";
  }

  function remember(code) {
    try { localStorage.setItem(KEY, code); } catch (e) {}
  }

  const pageCode = codeFor(document.documentElement.lang);

  // Vælger man selv et sprog, husker vi det og viser ikke banneret igen.
  document.querySelectorAll("a[hreflang]").forEach(function (a) {
    a.addEventListener("click", function () { remember(codeFor(a.getAttribute("hreflang"))); });
  });

  let chosen = null;
  try { chosen = localStorage.getItem(KEY); } catch (e) {}
  if (chosen) return;

  const wanted = codeFor((navigator.languages && navigator.languages[0]) || navigator.language);
  if (wanted === pageCode) return;
  const alt = document.querySelector('link[rel="alternate"][hreflang="' + wanted + '"]');
  if (!alt) return;

  const bar = document.createElement("div");
  bar.className = "langbar";
  bar.lang = wanted;
  bar.innerHTML = '<span></span><a></a><button type="button" aria-label="✕">✕</button>';
  bar.querySelector("span").textContent = TEXT[wanted][0];
  const link = bar.querySelector("a");
  link.textContent = TEXT[wanted][1] + " →";
  link.hreflang = wanted;
  // Kun stien, så banneret også virker, når siden vises et andet sted end hyttio.com.
  link.href = new URL(alt.href).pathname;
  link.addEventListener("click", function () { remember(wanted); });
  bar.querySelector("button").addEventListener("click", function () {
    remember(pageCode);
    bar.remove();
  });
  document.body.prepend(bar);
})();
