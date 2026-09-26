(function () {
  "use strict";

  var root = document.getElementById("sz1-landscape");
  if (!root) return;

  var base = "/projects/SZ1-IRES-Mutation-Optimization/";
  var colors = { A: "#6f837a", C: "#b17b61", G: "#7889a2", T: "#aa9a55" };
  var allRows = [];
  var experimental = Object.create(null);
  var selectedId = null;
  var svg = document.getElementById("landscape-chart");
  var countNode = document.getElementById("landscape-count");
  var detailNode = document.getElementById("landscape-detail");
  var liveNode = document.getElementById("landscape-live");

  function parseCSV(text) {
    var lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
    if (!lines[0]) return [];
    function parseLine(line) {
      var fields = [], value = "", quoted = false;
      for (var i = 0; i < line.length; i++) {
        var ch = line[i];
        if (ch === '"') {
          if (quoted && line[i + 1] === '"') { value += '"'; i++; }
          else quoted = !quoted;
        } else if (ch === "," && !quoted) {
          fields.push(value); value = "";
        } else value += ch;
      }
      fields.push(value);
      return fields;
    }
    var headers = parseLine(lines.shift()).map(function (name) { return name.trim(); });
    return lines.filter(Boolean).map(function (line) {
      var values = parseLine(line), row = {};
      headers.forEach(function (header, index) { row[header] = values[index] == null ? "" : values[index]; });
      return row;
    });
  }

  function number(value) {
    var parsed = Number(value);
    return value !== "" && Number.isFinite(parsed) ? parsed : null;
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function fmt(value, digits) {
    var parsed = number(value);
    return parsed == null ? "—" : parsed.toFixed(digits == null ? 2 : digits);
  }

  function getFilters() {
    return {
      query: document.getElementById("landscape-search").value.trim().toLowerCase(),
      mutant: document.getElementById("landscape-base").value,
      pairing: document.getElementById("landscape-pairing").value,
      posMin: number(document.getElementById("landscape-position-min").value),
      posMax: number(document.getElementById("landscape-position-max").value),
      mfeMin: number(document.getElementById("landscape-delta-min").value),
      mfeMax: number(document.getElementById("landscape-delta-max").value)
    };
  }

  function filteredRows() {
    var f = getFilters();
    return allRows.filter(function (row) {
      var pos = number(row.position_1based), mfe = number(row.delta_mfe_vs_wt);
      if (f.query && (String(row.variant_id).toLowerCase().indexOf(f.query) < 0 &&
          String(row.position_1based).indexOf(f.query) < 0)) return false;
      if (f.mutant !== "all" && row.mutant_base !== f.mutant) return false;
      if (f.pairing === "changed" && row.pairing_state_changed !== "1") return false;
      if (f.pairing === "same" && row.pairing_state_changed !== "0") return false;
      if (pos == null || mfe == null || (f.posMin != null && pos < f.posMin) ||
          (f.posMax != null && pos > f.posMax) ||
          (f.mfeMin != null && mfe < f.mfeMin) || (f.mfeMax != null && mfe > f.mfeMax)) return false;
      return true;
    });
  }

  function renderDetail(row) {
    if (!row) {
      detailNode.innerHTML = "<h4>Select a point</h4><p>Mutation details will appear here.</p>";
      return;
    }
    var key = row.position_1based + "|" + row.wt_base + "|" + row.mutant_base;
    var measured = experimental[key];
    var te = measured ? fmt(measured.experimental_TE_WT100) + " WT100 (n=" + esc(measured.n_experiments || "—") + ")" : "Not measured";
    detailNode.innerHTML =
      "<h4>" + esc(row.variant_id) + "</h4><p>Position " + esc(row.position_1based) + " · " +
      esc(row.wt_base) + " → " + esc(row.mutant_base) + "</p><dl>" +
      "<dt>ΔMFE</dt><dd>" + fmt(row.delta_mfe_vs_wt) + " kcal/mol</dd>" +
      "<dt>Mutant MFE</dt><dd>" + fmt(row.mfe_kcal_mol) + " kcal/mol</dd>" +
      "<dt>Pairing state</dt><dd>" + (row.pairing_state_changed === "1" ? "Changed" : "Unchanged") + "</dd>" +
      "<div class=\"detail-divider\"></div>" +
      "<dt>Structure difference · 5 nt</dt><dd>" + esc(row.structure_diff_5nt || "—") + "</dd>" +
      "<dt>Structure difference · 10 nt</dt><dd>" + esc(row.structure_diff_10nt || "—") + "</dd>" +
      "<dt>Structure difference · 20 nt</dt><dd>" + esc(row.structure_diff_20nt || "—") + "</dd>" +
      "<dt>Structure difference · 30 nt</dt><dd>" + esc(row.structure_diff_30nt || "—") + "</dd>" +
      "<div class=\"detail-divider\"></div>" +
      "<dt>Experimental TE</dt><dd>" + te + "</dd>" +
      "<dt class=\"detail-context\">Local sequence context</dt><dd class=\"detail-context\">" + esc(row.local_sequence_context || "—") + "</dd></dl>";
  }

  function renderChart(rows) {
    var width = 1000, height = 430, left = 66, right = 24, top = 20, bottom = 55;
    var plotW = width - left - right, plotH = height - top - bottom;
    var mfeValues = rows.map(function (row) { return number(row.delta_mfe_vs_wt); }).filter(function (v) { return v != null; });
    var min = mfeValues.length ? Math.min.apply(null, mfeValues) : -1;
    var max = mfeValues.length ? Math.max.apply(null, mfeValues) : 1;
    if (min === max) { min -= 1; max += 1; }
    var pad = (max - min) * 0.08;
    min -= pad; max += pad;
    function x(pos) { return left + ((pos - 1) / 649) * plotW; }
    function y(value) { return top + ((max - value) / (max - min)) * plotH; }
    var out = [];
    for (var tick = 0; tick <= 4; tick++) {
      var val = min + (max - min) * tick / 4, yy = y(val);
      out.push('<line class="landscape-gridline" x1="' + left + '" y1="' + yy + '" x2="' + (width - right) + '" y2="' + yy + '"/>');
      out.push('<text class="landscape-tick" x="' + (left - 9) + '" y="' + (yy + 3) + '" text-anchor="end">' + fmt(val, 1) + '</text>');
    }
    out.push('<line class="landscape-axis" x1="' + left + '" y1="' + top + '" x2="' + left + '" y2="' + (height - bottom) + '"/>');
    out.push('<line class="landscape-axis" x1="' + left + '" y1="' + (height - bottom) + '" x2="' + (width - right) + '" y2="' + (height - bottom) + '"/>');
    [1, 100, 200, 300, 400, 500, 600, 650].forEach(function (pos) {
      var xx = x(pos);
      out.push('<line class="landscape-gridline" x1="' + xx + '" y1="' + top + '" x2="' + xx + '" y2="' + (height - bottom) + '" opacity=".35"/>');
      out.push('<text class="landscape-tick" x="' + xx + '" y="' + (height - bottom + 18) + '" text-anchor="middle">' + pos + '</text>');
    });
    out.push('<text class="landscape-axis-title" x="' + (left + plotW / 2) + '" y="' + (height - 8) + '" text-anchor="middle">Mutation position (nt)</text>');
    out.push('<text class="landscape-axis-title" x="16" y="' + (top + plotH / 2) + '" text-anchor="middle" transform="rotate(-90 16 ' + (top + plotH / 2) + ')">ΔMFE (kcal/mol)</text>');
    rows.forEach(function (row) {
      var id = String(row.variant_id || "");
      var label = "Position " + row.position_1based + ", " + row.wt_base + " to " + row.mutant_base +
        ", delta MFE " + fmt(row.delta_mfe_vs_wt) + ", structure difference 20 nt " + (row.structure_diff_20nt || "not available");
      var selected = id === selectedId ? " is-selected" : "";
      out.push('<circle class="landscape-point' + selected + '" data-id="' + esc(id) + '" cx="' +
        x(number(row.position_1based)) + '" cy="' + y(number(row.delta_mfe_vs_wt)) +
        '" r="' + (selected ? "4.2" : "2.6") + '" fill="' + (colors[row.mutant_base] || "#777570") +
        '" aria-label="' + esc(label) + '"><title>' + esc(label) + '</title></circle>');
    });
    svg.innerHTML = out.join("");
    svg.querySelectorAll(".landscape-point").forEach(function (point) {
      point.addEventListener("click", function () {
        selectedId = point.getAttribute("data-id");
        render();
      });
    });
    if (selectedId && !rows.some(function (row) { return String(row.variant_id) === selectedId; })) {
      selectedId = null;
      renderDetail(null);
    }
  }

  function render() {
    var rows = filteredRows();
    countNode.textContent = rows.length.toLocaleString() + " of " + allRows.length.toLocaleString() + " mutations shown";
    renderChart(rows);
    var selected = rows.find(function (row) { return String(row.variant_id) === selectedId; });
    renderDetail(selected);
  }

  root.querySelectorAll(".landscape-controls input, .landscape-controls select").forEach(function (control) {
    control.addEventListener("input", render);
    control.addEventListener("change", render);
  });

  function fetchCSV(path) {
    return fetch(base + path + "?v=" + Date.now(), { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error("Could not load " + path);
      return response.text();
    }).then(parseCSV);
  }

  Promise.all([
    fetchCSV("results/feature_dataset_all_1950.csv"),
    fetchCSV("results/feature_dataset_training_9.csv")
  ]).then(function (tables) {
    allRows = tables[0];
    tables[1].forEach(function (row) {
      var key = row.position_1based + "|" + row.wt_base + "|" + row.mutant_base;
      experimental[key] = row;
    });
    liveNode.textContent = "LIVE PROJECT CSV · " + new Date().toLocaleDateString();
    render();
  }).catch(function (error) {
    liveNode.textContent = "DATA UNAVAILABLE";
    countNode.textContent = "Mutation landscape data could not be loaded.";
    detailNode.innerHTML = '<div class="landscape-error">' + esc(error.message) + "</div>";
  });
})();
