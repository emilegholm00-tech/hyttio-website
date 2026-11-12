// Beregner til fordeling af sommerhusets udgifter:
// faste udgifter efter ejerandel, forbrug efter antal dage i huset.
(function () {
  const root = document.querySelector("[data-calc]");
  if (!root) return;
  const kr = new Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK", maximumFractionDigits: 0 });
  const rows = root.querySelector("[data-rows]");
  const result = root.querySelector("[data-result]");
  const fixed = root.querySelector("#fixed");
  const usage = root.querySelector("#usage");
  const note = root.querySelector("[data-out=note]");

  const start = [
    { name: "Anna", share: 50, days: 40 },
    { name: "Peter", share: 25, days: 25 },
    { name: "Mette", share: 25, days: 15 },
  ];

  function addRow(family) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      '<td><input aria-label="Navn" value=""></td>' +
      '<td><input aria-label="Ejerandel i procent" type="number" inputmode="decimal" min="0" max="100"></td>' +
      '<td><input aria-label="Dage i huset pr. år" type="number" inputmode="numeric" min="0" max="366"></td>' +
      '<td><button class="linkbtn" type="button" aria-label="Fjern">✕</button></td>';
    const [name, share, days] = tr.querySelectorAll("input");
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
        name: name.value.trim() || "Uden navn",
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
      tr.children[1].textContent = kr.format(total);
      tr.children[2].textContent = kr.format(total / 12);
      result.appendChild(tr);
    });
    note.textContent = Math.round(totalShare) === 100
      ? "Faste udgifter er fordelt efter ejerandel og forbrug efter dage i huset."
      : "Ejerandelene giver " + Math.round(totalShare) + " % og er regnet om, så de passer til 100 %.";
  }

  start.forEach(addRow);
  root.querySelector("[data-add]").addEventListener("click", () => {
    addRow({ name: "Familie " + (rows.children.length + 1), share: 0, days: 0 });
    update();
  });
  fixed.addEventListener("input", update);
  usage.addEventListener("input", update);
  update();
})();
