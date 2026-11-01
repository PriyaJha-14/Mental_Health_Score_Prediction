(() => {
  "use strict";

  // Keep this URL aligned with the port used to start FastAPI.
  const API_BASE = "https://mental-health-score-prediction-05w7.onrender.com";

  const form = document.getElementById("predict-form");
  const submitBtn = document.getElementById("submit-btn");
  const resetBtn = document.getElementById("reset-btn");
  const errorRetryBtn = document.getElementById("error-retry-btn");
  const stateIdle = document.getElementById("state-idle");
  const stateLoading = document.getElementById("state-loading");
  const stateResult = document.getElementById("state-result");
  const stateError = document.getElementById("state-error");
  const scoreNumberEl = document.getElementById("score-number");
  const scoreBandEl = document.getElementById("score-band");
  const scoreContextEl = document.getElementById("score-context");
  const gaugeFill = document.getElementById("gauge-fill");
  const errorCopyEl = document.getElementById("error-copy");
  const stressHiddenInput = document.getElementById("stress_level");
  const segGroup = document.getElementById("stress_level_group");
  const GAUGE_ARC_LENGTH = 314;

  function drawTicks() {
    document.querySelectorAll(".gauge-ticks").forEach((group) => {
      group.innerHTML = "";
      const cx = 120, cy = 140, rOuter = 100, rInner = 90;
      for (let i = 0; i <= 10; i += 2) {
        const angle = Math.PI - (i / 10) * Math.PI;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", (cx + rOuter * Math.cos(angle)).toFixed(1));
        line.setAttribute("y1", (cy - rOuter * Math.sin(angle)).toFixed(1));
        line.setAttribute("x2", (cx + rInner * Math.cos(angle)).toFixed(1));
        line.setAttribute("y2", (cy - rInner * Math.sin(angle)).toFixed(1));
        group.appendChild(line);
      }
    });
  }
  drawTicks();

  segGroup.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      segGroup.querySelectorAll(".seg-btn").forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      stressHiddenInput.value = btn.dataset.value;
      clearFieldError(stressHiddenInput);
    });
  });

  function fieldWrapper(input) { return input ? input.closest(".field") : null; }
  function setFieldError(input, message) {
    const wrap = fieldWrapper(input);
    if (!wrap) return;
    wrap.classList.add("field-error");
    const msg = wrap.querySelector(".error-msg");
    if (msg) msg.textContent = message;
  }
  function clearFieldError(input) {
    const wrap = fieldWrapper(input);
    if (!wrap) return;
    wrap.classList.remove("field-error");
    const msg = wrap.querySelector(".error-msg");
    if (msg) msg.textContent = "";
  }
  function clearAllErrors() {
    form.querySelectorAll(".field").forEach((field) => field.classList.remove("field-error"));
    form.querySelectorAll(".error-msg").forEach((msg) => { msg.textContent = ""; });
  }

  function collectPayload() {
    const fd = new FormData(form);
    return {
      age: fd.get("age") === "" ? NaN : parseInt(fd.get("age"), 10),
      gender: fd.get("gender") || "",
      country: (fd.get("country") || "").trim(),
      academic_level: fd.get("academic_level") || "",
      most_used_platform: fd.get("most_used_platform") || "",
      purpose_of_use: fd.get("purpose_of_use") || "",
      avg_daily_usage_hours: fd.get("avg_daily_usage_hours") === "" ? NaN : parseFloat(fd.get("avg_daily_usage_hours")),
      daily_unlocks: fd.get("daily_unlocks") === "" ? NaN : parseInt(fd.get("daily_unlocks"), 10),
      study_hours: fd.get("study_hours") === "" ? NaN : parseFloat(fd.get("study_hours")),
      physical_activity_hours: fd.get("physical_activity_hours") === "" ? NaN : parseFloat(fd.get("physical_activity_hours")),
      sleep_hours_per_night: fd.get("sleep_hours_per_night") === "" ? NaN : parseFloat(fd.get("sleep_hours_per_night")),
      stress_level: fd.get("stress_level") || ""
    };
  }

  function validate(payload) {
    const errors = [];
    const numericChecks = [
      ["age", 10, 100],
      ["avg_daily_usage_hours", 0, 24],
      ["daily_unlocks", 0, Infinity],
      ["study_hours", 0, 24],
      ["physical_activity_hours", 0, 24],
      ["sleep_hours_per_night", 0, 24]
    ];
    numericChecks.forEach(([key, min, max]) => {
      const input = document.getElementById(key);
      const value = payload[key];
      if (value === "" || value === null || Number.isNaN(value)) errors.push([input, "This field is required."]);
      else if (value < min || value > max) errors.push([input, `Must be between ${min} and ${max === Infinity ? "0+" : max}.`]);
    });
    ["gender", "country", "academic_level", "most_used_platform", "purpose_of_use"].forEach((key) => {
      const input = document.getElementById(key);
      if (!payload[key] || !String(payload[key]).trim()) errors.push([input, "This field is required."]);
    });
    if (!payload.stress_level) errors.push([stressHiddenInput, "Choose a stress level."]);
    return errors;
  }

  function showState(name) {
    [stateIdle, stateLoading, stateResult, stateError].forEach((el) => { el.hidden = true; });
    ({ idle: stateIdle, loading: stateLoading, result: stateResult, error: stateError }[name]).hidden = false;
  }
  function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    submitBtn.classList.toggle("loading", isSubmitting);
  }
  function renderResult(score) {
    const clamped = Math.max(0, Math.min(10, score));
    scoreNumberEl.textContent = score.toFixed(2);
    scoreBandEl.textContent = "Prediction generated";
    scoreContextEl.textContent = "This is the score returned by your trained model. It is an estimate, not a diagnosis or a measure of your worth.";
    gaugeFill.style.transition = "none";
    gaugeFill.style.strokeDashoffset = String(GAUGE_ARC_LENGTH);
    requestAnimationFrame(() => {
      gaugeFill.style.transition = "";
      gaugeFill.style.strokeDashoffset = String(GAUGE_ARC_LENGTH * (1 - clamped / 10));
    });
    showState("result");
  }
  function renderError(label, copy) {
    errorCopyEl.textContent = `${label}: ${copy}`;
    showState("error");
  }
  function applyServerValidationErrors(detail) {
    if (!Array.isArray(detail)) return false;
    let matched = false;
    detail.forEach((err) => {
      const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : null;
      const input = field ? document.getElementById(field) : null;
      const target = field === "stress_level" ? stressHiddenInput : input;
      if (target) {
        setFieldError(target, err.msg || "Invalid value.");
        matched = true;
      }
    });
    return matched;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAllErrors();
    const payload = collectPayload();
    const clientErrors = validate(payload);
    if (clientErrors.length) {
      clientErrors.forEach(([input, message]) => setFieldError(input, message));
      clientErrors[0][0]?.focus?.();
      return;
    }
    setSubmitting(true);
    showState("loading");
    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.status === 422) {
        const body = await response.json().catch(() => null);
        const matched = body && applyServerValidationErrors(body.detail);
        renderError("Check your inputs", matched ? "The API rejected a few fields; details are marked on the form." : "The API rejected this submission. Please review your inputs and try again.");
        return;
      }
      if (!response.ok) {
        let detail = `The API responded with status ${response.status}.`;
        const body = await response.json().catch(() => null);
        if (body && typeof body.detail === "string") detail = body.detail;
        renderError("Prediction failed", detail);
        return;
      }
      const data = await response.json();
      if (typeof data.predicted_mental_health_score !== "number" || !Number.isFinite(data.predicted_mental_health_score)) {
        renderError("Unexpected response", "The API responded, but the predicted score was missing or malformed.");
        return;
      }
      renderResult(data.predicted_mental_health_score);
    } catch (error) {
      renderError("Can't reach the server", `Couldn't connect to ${API_BASE}. Start FastAPI on port 8000 and make sure the API is reachable from this page.`);
    } finally {
      setSubmitting(false);
    }
  });

  form.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("input", () => clearFieldError(el));
    el.addEventListener("change", () => clearFieldError(el));
  });
  resetBtn.addEventListener("click", () => showState("idle"));
  errorRetryBtn.addEventListener("click", () => showState("idle"));
})();