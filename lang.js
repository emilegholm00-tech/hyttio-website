// Foreslår siden på besøgendes eget sprog – ud fra telefonens/browserens sprog, ikke landet.
// Vi sender aldrig folk videre af os selv (det ville skjule siderne for Google); vi viser et lille banner.
(function () {
  const HOME = { da: "/", no: "/no/", sv: "/sv/", en: "/en/" };
  const TEXT = {
    da: ["Siden findes på dansk", "Gå til dansk"],
    no: ["Siden finnes på norsk", "Gå til norsk"],
    sv: ["Sidan finns på svenska", "Gå till svenska"],
    en: ["This page is available in English", "Go to English"],
  };
  const KEY = "hyttio-lang";

  function codeFor(lang) {
    const l = (lang || "").toLowerCase();
    if (l.startsWith("da")) return "da";
    if (l.startsWith("nb") || l.startsWith("nn") || l.startsWith("no")) return "no";
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

  const bar = document.createElement("div");
  bar.className = "langbar";
  bar.lang = wanted === "no" ? "nb" : wanted;
  bar.innerHTML = '<span></span><a></a><button type="button" aria-label="Luk">✕</button>';
  bar.querySelector("span").textContent = TEXT[wanted][0];
  const link = bar.querySelector("a");
  link.textContent = TEXT[wanted][1] + " →";
  // Siden ligger på hyttio.com/ eller i en undermappe; find roden ud fra stien.
  const root = location.pathname.replace(/\/(no|sv|en)\/.*$/, "/").replace(/[^/]*$/, "");
  link.href = root + HOME[wanted].slice(1);
  link.addEventListener("click", function () { remember(wanted); });
  bar.querySelector("button").addEventListener("click", function () {
    remember(pageCode);
    bar.remove();
  });
  document.body.prepend(bar);
})();
