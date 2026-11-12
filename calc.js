// Beregner til fordeling af sommerhusets udgifter:
// faste udgifter efter ejerandel, forbrug efter antal dage i huset.
// Sprog og valuta følger sidens sprog (<html lang>).
(function () {
  const root = document.querySelector("[data-calc]");
  if (!root) return;

  const LANG = {
    da: { locale: "da-DK", currency: "DKK", unnamed: "Uden navn", family: "Familie", ok: "Faste udgifter er fordelt efter ejerandel og forbrug efter dage i huset.", rescaled: (p) => "Ejerandelene giver " + p + " % og er regnet om, så de passer til 100 %.", remove: "Fjern", names: ["Anna", "Peter", "Mette"], fixed: 24000, usage: 12000 },
    nb: { locale: "nb-NO", currency: "NOK", unnamed: "Uten navn", family: "Familie", ok: "Faste utgifter er fordelt etter eierandel og forbruk etter døgn på hytta.", rescaled: (p) => "Eierandelene blir " + p + " % og er regnet om slik at de blir 100 %.", remove: "Fjern", names: ["Kari", "Ola", "Ingrid"], fixed: 36000, usage: 18000 },
    sv: { locale: "sv-SE", currency: "SEK", unnamed: "Utan namn", family: "Familj", ok: "Fasta kostnader är fördelade efter ägarandel och förbrukning efter dagar i stugan.", rescaled: (p) => "Ägarandelarna blir " + p + " % och har räknats om så att de blir 100 %.", remove: "Ta bort", names: ["Anna", "Erik", "Maria"], fixed: 36000, usage: 18000 },
    en: { locale: "en-GB", currency: "EUR", unnamed: "No name", family: "Family", ok: "Fixed costs are split by ownership share and usage by days in the house.", rescaled: (p) => "The shares add up to " + p + " % and have been scaled to 100 %.", remove: "Remove", names: ["Anna", "Peter", "Emma"], fixed: 3200, usage: 1600 },
  };
  const t = LANG[(document.documentElement.lang || "da").slice(0, 2)] || LANG.da;
  const money = new Intl.NumberFormat(t.locale, { style: "currency", currency: t.currency, maximumFractionDigits: 0 });
  const rows = root.querySelector("[data-rows]");
  const result = root.querySelector("[data-result]");
  const fixed = root.querySelector("#fixed");
  const usage = root.querySelector("#usage");
  const note = root.querySelector("[data-out=note]");
  if (!fixed.value) fixed.value = t.fixed;
  if (!usage.value) usage.value = t.usage;

  const start = [
    { name: t.names[0], share: 50, days: 40 },
    { name: t.names[1], share: 25, days: 25 },
    { name: t.names[2], share: 25, days: 15 },
  ];
  const labels = [...root.querySelectorAll(".families th")].map((th) => th.textContent);

  function addRow(family) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      "<td><input></td>" +
      '<td><input type="number" inputmode="decimal" min="0" max="100"></td>' +
      '<td><input type="number" inputmode="numeric" min="0" max="366"></td>' +
      '<td><button class="linkbtn" type="button">✕</button></td>';
    const [name, share, days] = tr.querySelectorAll("input");
    name.setAttribute("aria-label", labels[0]);
    share.setAttribute("aria-label", labels[1]);
    days.setAttribute("aria-label", labels[2]);
    tr.querySelector("button").setAttribute("aria-label", t.remove);
    name.value = family.name;
    share.value = family.share;
    days.value = family.days;
    tr.querySelector("button").addEventListener("click", () => {
      if (rows.children.length > 2) { tr.remove(); update(); }
    });
    tr.addEventListener("input", update);
    rows.appendChild(tr);
  }

  function update() {
    const families = [...rows.children].map((tr) => {
      const [name, share, days] = tr.querySelectorAll("input");
      return {
        name: name.value.trim() || t.unnamed,
        share: Math.max(0, Number(share.value) || 0),
        days: Math.max(0, Number(days.value) || 0),
      };
    });
    const totalShare = families.reduce((sum, f) => sum + f.share, 0);
    const totalDays = families.reduce((sum, f) => sum + f.days, 0);
    const fixedSum = Math.max(0, Number(fixed.value) || 0);
    const usageSum = Math.max(0, Number(usage.value) || 0);

    result.innerHTML = "";
    families.forEach((f) => {
      // Står ejerandelene ikke til 100 %, regnes de om, så de passer.
      const fixedPart = totalShare > 0 ? fixedSum * f.share / totalShare : fixedSum / families.length;
      const usagePart = totalDays > 0 ? usageSum * f.days / totalDays : usageSum / families.length;
      const total = fixedPart + usagePart;
      const tr = document.createElement("tr");
      tr.innerHTML = "<td></td><td class='num'></td><td class='num'></td>";
      tr.children[0].textContent = f.name;
      tr.children[1].textContent = money.format(total);
      tr.children[2].textContent = money.format(total / 12);
      result.appendChild(tr);
    });
    note.textContent = Math.round(totalShare) === 100 ? t.ok : t.rescaled(Math.round(totalShare));
  }

  start.forEach(addRow);
  root.querySelector("[data-add]").addEventListener("click", () => {
    addRow({ name: t.family + " " + (rows.children.length + 1), share: 0, days: 0 });
    update();
  });
  fixed.addEventListener("input", update);
  usage.addEventListener("input", update);
  update();
})();
