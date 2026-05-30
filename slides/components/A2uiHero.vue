<script setup lang="ts">
// Self-contained a2UI hero illustration with built-in (looping) animation:
// an agent prompt → schema → rendered components, with data "flowing" through
// and the live component visibly assembling — a nod to "UIs that transform".
</script>

<template>
  <div class="a2ui-hero">
    <svg viewBox="0 0 600 120" class="a2ui-svg">
      <defs>
        <linearGradient id="a2ui-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#e40035" />
          <stop offset="55%" stop-color="#c3147e" />
          <stop offset="100%" stop-color="#7c4dff" />
        </linearGradient>
        <marker id="a2ui-arrow" viewBox="0 0 10 10" refX="7" refY="5"
          markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#7c4dff" />
        </marker>
      </defs>

      <!-- Left: the agent's prompt -->
      <rect x="24" y="26" width="112" height="68" rx="14" fill="#15102b" stroke="#6b5fa0" stroke-width="2" />
      <line x1="46" y1="46" x2="116" y2="46" stroke="#9a8fc4" stroke-width="3" stroke-linecap="round" />
      <line x1="46" y1="60" x2="122" y2="60" stroke="#9a8fc4" stroke-width="3" stroke-linecap="round" />
      <line x1="46" y1="74" x2="90" y2="74" stroke="#9a8fc4" stroke-width="3" stroke-linecap="round" />
      <circle cx="126" cy="80" r="4" fill="url(#a2ui-grad)" />

      <!-- Flow in -->
      <line class="flow" x1="146" y1="60" x2="212" y2="60"
        stroke="url(#a2ui-grad)" stroke-width="3" stroke-linecap="round" />

      <!-- Middle: schema node -->
      <g class="schema">
        <rect x="224" y="40" width="64" height="40" rx="14" fill="#1b1340" stroke="url(#a2ui-grad)" stroke-width="2" />
        <rect x="238" y="52" width="26" height="6" rx="3" fill="url(#a2ui-grad)" />
        <rect x="238" y="64" width="36" height="6" rx="3" fill="#564c82" />
      </g>

      <!-- Flow out -->
      <line class="flow" x1="320" y1="60" x2="372" y2="60"
        stroke="url(#a2ui-grad)" stroke-width="3" stroke-linecap="round" marker-end="url(#a2ui-arrow)" />

      <!-- Right: rendered components, fanned, front one highlighted + assembling -->
      <rect x="406" y="18" width="150" height="84" rx="14" fill="#15102b" stroke="#3a3160" stroke-width="2" transform="rotate(-7 481 60)" />
      <rect x="418" y="18" width="150" height="84" rx="14" fill="#171030" stroke="#4a3f78" stroke-width="2" transform="rotate(4 493 60)" />
      <rect class="card-front" x="410" y="18" width="150" height="84" rx="14" fill="#1b1340" stroke="url(#a2ui-grad)" stroke-width="2.5" />
      <rect class="brick b1" x="428" y="34" width="60" height="9" rx="4.5" fill="url(#a2ui-grad)" />
      <rect class="brick b2" x="428" y="53" width="114" height="6" rx="3" fill="#564c82" />
      <rect class="brick b3" x="428" y="65" width="92" height="6" rx="3" fill="#564c82" />
      <rect class="brick b4" x="428" y="80" width="48" height="14" rx="7" fill="url(#a2ui-grad)" />
    </svg>

    <div class="a2ui-labels">
      <span style="left: 13.3%">prompt</span>
      <span style="left: 42.7%">schema</span>
      <span style="left: 80.8%">components</span>
    </div>
  </div>
</template>

<style scoped>
.a2ui-hero {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  filter: drop-shadow(0 16px 40px rgba(124, 77, 255, 0.25));
}
.a2ui-svg {
  width: 100%;
  height: auto;
  display: block;
}

/* Data flowing left → right along the connectors */
.flow {
  stroke-dasharray: 2 8;
  animation: a2ui-flow 1.3s linear infinite;
}
@keyframes a2ui-flow {
  to { stroke-dashoffset: -40; }
}

/* Schema node breathes gently */
.schema {
  transform-box: fill-box;
  transform-origin: center;
  animation: a2ui-breathe 3.2s ease-in-out infinite;
}
@keyframes a2ui-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}

/* Highlighted card glows softly */
.card-front {
  animation: a2ui-glow 3.2s ease-in-out infinite;
}
@keyframes a2ui-glow {
  0%, 100% { filter: drop-shadow(0 0 0 rgba(124, 77, 255, 0)); }
  50% { filter: drop-shadow(0 0 6px rgba(195, 20, 126, 0.55)); }
}

/* Front-card contents "assemble", staggered, then hold — the transform beat */
.brick {
  transform-box: fill-box;
  transform-origin: left center;
  animation: a2ui-assemble 4s ease-in-out infinite;
}
.b1 { animation-delay: 0s; }
.b2 { animation-delay: 0.15s; }
.b3 { animation-delay: 0.3s; }
.b4 { animation-delay: 0.45s; }
@keyframes a2ui-assemble {
  0% { opacity: 0; transform: translateX(-10px) scaleX(0.6); }
  18%, 82% { opacity: 1; transform: translateX(0) scaleX(1); }
  100% { opacity: 0; transform: translateX(-10px) scaleX(0.6); }
}

/* Zone labels, centered under each stage */
.a2ui-labels {
  position: relative;
  height: 1.4rem;
  margin-top: 0.4rem;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #8b80b5;
}
.a2ui-labels span {
  position: absolute;
  transform: translateX(-50%);
}

@media (prefers-reduced-motion: reduce) {
  .flow, .schema, .card-front, .brick { animation: none; }
  .brick { opacity: 1; }
}
</style>
