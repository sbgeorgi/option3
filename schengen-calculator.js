// Schengen short stay: at most 90 days of stay in any 180-day window.
// Entry and exit days both count. Dates are YYYY-MM-DD, math uses whole UTC days, so DST cannot shift a count.
(function () {
  var DAY = 86400000, WINDOW = 180, LIMIT = 90, MAX_TRIP_DAYS = 3660;

  function toNum(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    if (!m) return null;
    var t = Date.UTC(+m[1], +m[2] - 1, +m[3]), d = new Date(t);
    if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
    return t / DAY;
  }

  function toIso(n) { return new Date(n * DAY).toISOString().slice(0, 10); }

  // Sorted, de-duplicated stay days (day numbers) for trips [{entry, exit}]. Overlapping trips merge; input order does not matter.
  function stayDays(trips) {
    var seen = {}, list = [];
    trips.forEach(function (t) {
      var a = toNum(t.entry), b = toNum(t.exit);
      if (a === null || b === null) throw new Error("Use valid dates for every trip.");
      if (b < a) throw new Error("A trip's exit date is before its entry date.");
      if (b - a > MAX_TRIP_DAYS) throw new Error("A single trip can be at most 10 years long.");
      for (var d = a; d <= b; d++) if (!seen[d]) { seen[d] = true; list.push(d); }
    });
    return list.sort(function (x, y) { return x - y; });
  }

  // Stay days inside the 180-day window ending on day `end` (inclusive).
  function countWindow(days, end) {
    return days.filter(function (d) { return d <= end && d > end - WINDOW; }).length;
  }

  // Earliest date on which the 90-in-180 limit is exceeded by the given stay days, or null.
  function firstViolation(days) {
    var j = 0;
    for (var i = 0; i < days.length; i++) {
      while (days[j] <= days[i] - WINDOW) j++;
      if (i - j + 1 > LIMIT) return toIso(days[i]);
    }
    return null;
  }

  // Status as of `asOf`: counts only stays on or before that date; checks the whole itinerary for violations.
  function check(trips, asOf) {
    var day = toNum(asOf);
    if (day === null) throw new Error("Pick a valid check date.");
    var all = stayDays(trips), past = all.filter(function (d) { return d <= day; });
    var used = countWindow(past, day), r = { used: used, remaining: Math.max(0, LIMIT - used), freeOn: null, violation: firstViolation(all) };
    // With no free day now, the first later date whose window holds fewer than 90 past stays.
    for (var x = day + 1; r.remaining === 0 && x <= day + WINDOW; x++) {
      if (countWindow(past, x) < LIMIT) r.freeOn = toIso(x);
      if (r.freeOn) break;
    }
    return r;
  }

  var api = { toNum: toNum, toIso: toIso, stayDays: stayDays, countWindow: countWindow, firstViolation: firstViolation, check: check };
  if (typeof module !== "undefined" && module.exports) module.exports = api;

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
      var list = document.getElementById("trips"), out = document.getElementById("result"), asOf = document.getElementById("asof");
      var pad = function (n) { return (n < 10 ? "0" : "") + n; }, now = new Date();
      asOf.value = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());

      function row(entry, exit) {
        var div = document.createElement("div");
        div.className = "trip";
        div.innerHTML = '<label>Entry <input type="date" class="in"></label>' +
          '<label>Exit <input type="date" class="out"></label>' +
          '<button type="button" class="rm">Remove</button>';
        div.querySelector(".in").value = entry || "";
        div.querySelector(".out").value = exit || "";
        div.querySelector(".rm").onclick = function () { div.remove(); update(); };
        list.appendChild(div);
      }

      function update() {
        var rows = Array.prototype.map.call(list.querySelectorAll(".trip"), function (r) {
          return { entry: r.querySelector(".in").value, exit: r.querySelector(".out").value };
        });
        var trips = rows.filter(function (t) { return t.entry && t.exit; });
        if (rows.some(function (t) { return !!t.entry !== !!t.exit; })) {
          out.innerHTML = '<p class="err">Fill in both dates for each trip.</p>';
          return;
        }
        if (!trips.length) { out.innerHTML = '<p class="meta">Add an entry and exit date to start.</p>'; return; }
        try {
          var r = check(trips, asOf.value);
          var free = r.remaining > 0
            ? "<p>You have <strong>" + r.remaining + " day" + (r.remaining === 1 ? "" : "s") + " free</strong> on this date.</p>"
            : "<p>No day is free on this date. The next day frees up on <strong>" + (r.freeOn || "after 180 days") + "</strong>.</p>";
          var plan = r.violation
            ? '<p class="err">Your planned trips go over 90 days in a 180-day window on ' + r.violation + '. Shorten a trip or move its dates.</p>'
            : '<p class="ok">Your planned trips stay within 90 days in every 180-day window.</p>';
          out.innerHTML = "<p><strong>Used in the 180 days up to " + asOf.value + ":</strong> " + r.used + " of 90</p>" + free + plan;
        } catch (e) {
          out.innerHTML = "";
          out.appendChild(Object.assign(document.createElement("p"), { className: "err", textContent: e.message }));
        }
      }

      document.getElementById("add-trip").onclick = function () { row(); update(); };
      list.addEventListener("input", update);
      asOf.addEventListener("input", update);
      row(); update();
    });
  }
})();
