(function(){
  const root = document.getElementById("sz1-workflow");
  if (!root) return;

  const base = "/projects/SZ1-IRES-Mutation-Optimization/";

  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines.shift().split(",");
    return lines.map(function(line) {
      const values = [];
      let value = "";
      let quoted = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') quoted = !quoted;
        else if (c === "," && !quoted) {
          values.push(value);
          value = "";
        } else {
          value += c;
        }
      }
      values.push(value);
      const row = {};
      headers.forEach(function(header, i) {
        row[header] = values[i] || "";
      });
      return row;
    });
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function fmt(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(1) : "—";
  }

  function render(summary, train) {
    const count = summary.total_single_substitution_candidates || "—";
    const length = summary.sequence_length || "—";
    const labels = summary.experimental_variants || train.length || "—";
    const paired = summary.pairing_state_changes || "—";
    const minMfe = summary.min_delta_mfe;
    const maxMfe = summary.max_delta_mfe;

    let best = train[0] || {};
    train.forEach(function(row) {
      if (Number(row.experimental_TE_WT100) > Number(best.experimental_TE_WT100)) best = row;
    });

    root.innerHTML =
      '<div class="workflow-head">' +
        '<div><div class="meta">COMPUTATIONAL PIPELINE · DATA-DRIVEN VIEW</div>' +
        '<div class="workflow-title">From sequence input to mutation landscape</div></div>' +
        '<div class="workflow-status">LIVE FROM PROJECT DATA</div>' +
      '</div>' +

      '<div class="workflow-canvas">' +
        '<svg viewBox="0 0 1100 330" preserveAspectRatio="xMidYMid meet" aria-label="SZ1 IRES computational workflow">' +
          '<g class="wf-line">' +
            '<line x1="195" y1="100" x2="270" y2="100"/>' +
            '<line x1="400" y1="100" x2="475" y2="100"/>' +
            '<line x1="605" y1="100" x2="680" y2="100"/>' +
            '<line x1="810" y1="100" x2="885" y2="100"/>' +
          '</g>' +

          '<g class="wf-node" tabindex="0" data-tip="The 650-nt SZ1 IRES WT sequence is the computational input.">' +
            '<rect x="25" y="45" width="170" height="110" rx="2"/>' +
            '<text x="45" y="72" class="wf-step">01 · INPUT</text>' +
            '<text x="45" y="101" class="wf-main">' + esc(length) + ' nt</text>' +
            '<text x="45" y="123" class="wf-sub">SZ1 IRES WT</text>' +
            '<text x="45" y="141" class="wf-sub">FASTA sequence</text>' +
          '</g>' +

          '<g class="wf-node" tabindex="0" data-tip="Every position is substituted with the three alternative nucleotides.">' +
            '<rect x="270" y="45" width="130" height="110" rx="2"/>' +
            '<text x="290" y="72" class="wf-step">02 · GENERATE</text>' +
            '<text x="290" y="103" class="wf-main">' + esc(count) + '</text>' +
            '<text x="290" y="125" class="wf-sub">single substitutions</text>' +
            '<text x="290" y="143" class="wf-sub">A / C / G / U</text>' +
          '</g>' +

          '<g class="wf-node" tabindex="0" data-tip="RNAfold predicts secondary structure and minimum free energy for each sequence.">' +
            '<rect x="475" y="45" width="130" height="110" rx="2"/>' +
            '<text x="495" y="72" class="wf-step">03 · PREDICT</text>' +
            '<text x="495" y="103" class="wf-main">RNAfold</text>' +
            '<text x="495" y="125" class="wf-sub">MFE + structure</text>' +
            '<text x="495" y="143" class="wf-sub">ΔMFE vs WT</text>' +
          '</g>' +

          '<g class="wf-node" tabindex="0" role="button" aria-label="Explore the mutation landscape" data-action="landscape" data-tip="RNAfold outputs are transformed into structural and mutation-level features. Click to explore all 1,950 substitutions.">' +
            '<rect x="680" y="45" width="130" height="110" rx="2"/>' +
            '<text x="700" y="72" class="wf-step">04 · FEATURES</text>' +
            '<text x="700" y="101" class="wf-main">Feature</text>' +
            '<text x="700" y="121" class="wf-main">engineering</text>' +
            '<text x="700" y="143" class="wf-sub">pairing + local change</text>' +
          '</g>' +

          '<g class="wf-node" tabindex="0" data-tip="Experimental labels support an exploratory supervised-learning benchmark.">' +
            '<rect x="885" y="45" width="190" height="110" rx="2"/>' +
            '<text x="905" y="72" class="wf-step">05 · EVALUATE</text>' +
            '<text x="905" y="101" class="wf-main">LOOCV / ML</text>' +
            '<text x="905" y="123" class="wf-sub">' + esc(labels) + ' experimental labels</text>' +
            '<text x="905" y="141" class="wf-sub">exploratory benchmark</text>' +
          '</g>' +

          '<line class="wf-branch" x1="745" y1="155" x2="745" y2="220"/>' +
          '<line class="wf-branch" x1="745" y1="220" x2="555" y2="220"/>' +
          '<line class="wf-branch" x1="745" y1="220" x2="935" y2="220"/>' +
          '<line class="wf-branch" x1="555" y1="220" x2="555" y2="255"/>' +
          '<line class="wf-branch" x1="935" y1="220" x2="935" y2="255"/>' +

          '<g class="wf-output">' +
            '<rect x="390" y="255" width="330" height="52" rx="2"/>' +
            '<text x="410" y="277" class="wf-step">STRUCTURAL LANDSCAPE</text>' +
            '<text x="410" y="296" class="wf-sub">pairing changes: ' + esc(paired) + ' · ΔMFE: ' + esc(fmt(minMfe)) + ' → ' + esc(fmt(maxMfe)) + '</text>' +
          '</g>' +

          '<g class="wf-output">' +
            '<rect x="770" y="255" width="270" height="52" rx="2"/>' +
            '<text x="790" y="277" class="wf-step">EXPERIMENTAL ANCHOR</text>' +
            '<text x="790" y="296" class="wf-sub">' + esc(best.variant || "—") + ' · TE ' + esc(fmt(best.experimental_TE_WT100)) + ' WT100</text>' +
          '</g>' +
        '</svg>' +
        '<div class="workflow-tooltip" aria-live="polite"></div>' +
      '</div>' +

      '<div class="workflow-readout">' +
        '<div><strong>' + esc(count) + '</strong><span>variants screened computationally</span></div>' +
        '<div><strong>' + esc(labels) + '</strong><span>experimentally labeled variants</span></div>' +
        '<div><strong>' + esc(paired) + '</strong><span>predicted pairing-state changes</span></div>' +
        '<div><strong>ΔMFE ' + esc(fmt(minMfe)) + ' → ' + esc(fmt(maxMfe)) + '</strong><span>RNAfold structural range</span></div>' +
      '</div>';

    const tooltip = root.querySelector(".workflow-tooltip");
    root.querySelectorAll(".wf-node").forEach(function(node) {
      function show() {
        tooltip.textContent = node.getAttribute("data-tip") || "";
        tooltip.classList.add("is-visible");
      }
      function hide() {
        tooltip.classList.remove("is-visible");
      }
      node.addEventListener("mouseenter", show);
      node.addEventListener("focus", show);
      node.addEventListener("mouseleave", hide);
      node.addEventListener("blur", hide);
      if (node.getAttribute("data-action") === "landscape") {
        function openLandscape() {
          const target = document.getElementById("sz1-landscape");
          if (target) target.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "start"
          });
        }
        node.addEventListener("click", openLandscape);
        node.addEventListener("keydown", function(event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openLandscape();
          }
        });
      }
    });
  }

  Promise.all([
    fetch(base + "results/mutation_landscape_summary.csv"),
    fetch(base + "results/feature_dataset_training_9.csv")
  ])
  .then(function(responses) {
    return Promise.all(responses.map(function(response) {
      if (!response.ok) throw new Error("Data request failed");
      return response.text();
    }));
  })
  .then(function(texts) {
    render(parseCSV(texts[0])[0] || {}, parseCSV(texts[1]));
  })
  .catch(function(error) {
    console.error("SZ1 workflow:", error);
    root.innerHTML = '<div class="workflow-fallback">Computational workflow data could not be loaded.</div>';
  });
})();