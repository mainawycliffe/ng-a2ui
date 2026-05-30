<script setup lang="ts">
// The pattern, generically: a user prompt flows to an LLM, which emits component JSON
// that a renderer turns into UI. A schema sits underneath — validating the LLM's output
// and typing the renderer. Glowing packets show the data flowing through, live.
</script>

<template>
  <div class="arch-flow">
    <svg viewBox="0 0 900 300" class="arch-svg">
      <defs>
        <linearGradient id="arch-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#e40035" />
          <stop offset="55%" stop-color="#c3147e" />
          <stop offset="100%" stop-color="#7c4dff" />
        </linearGradient>
        <marker id="arch-arrow" viewBox="0 0 10 10" refX="8" refY="5"
          markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#7c4dff" />
        </marker>
      </defs>

      <!-- Wires (faint rails) -->
      <path class="wire" d="M180 60 L369 60" marker-end="url(#arch-arrow)" />
      <path class="wire" d="M545 60 L679 60" marker-end="url(#arch-arrow)" />
      <path class="wire feed" d="M440 200 C 432 158 448 112 460 90" marker-end="url(#arch-arrow)" />
      <path class="wire feed" d="M505 200 C 590 158 700 112 778 90" marker-end="url(#arch-arrow)" />

      <!-- Traveling data packets -->
      <circle r="5" fill="#e40035" class="packet">
        <animateMotion dur="1.7s" repeatCount="indefinite" path="M180 60 L369 60" />
      </circle>
      <circle r="5" fill="#7c4dff" class="packet">
        <animateMotion dur="1.9s" begin="-0.5s" repeatCount="indefinite" path="M545 60 L679 60" />
      </circle>
      <circle r="4" fill="#9b51e0" class="packet">
        <animateMotion dur="1.8s" repeatCount="indefinite" path="M440 200 C 432 158 448 112 460 90" />
      </circle>
      <circle r="4" fill="#9b51e0" class="packet">
        <animateMotion dur="1.8s" begin="-0.7s" repeatCount="indefinite" path="M505 200 C 590 158 700 112 778 90" />
      </circle>

      <!-- Labels -->
      <text class="elabel" x="276" y="42" text-anchor="middle">prompt</text>
      <text class="elabel" x="612" y="42" text-anchor="middle">component JSON</text>
      <text class="flabel" x="372" y="150" text-anchor="middle">validates output</text>
      <text class="flabel" x="660" y="150" text-anchor="middle">types the UI</text>

      <!-- Nodes -->
      <g class="node">
        <rect x="40" y="34" width="140" height="52" rx="26" />
        <text x="110" y="64" text-anchor="middle">User</text>
      </g>
      <g class="node">
        <rect x="375" y="34" width="170" height="52" rx="12" />
        <text x="460" y="64" text-anchor="middle">LLM (Gemini)</text>
      </g>
      <g class="node">
        <rect x="685" y="34" width="200" height="52" rx="12" />
        <text x="785" y="64" text-anchor="middle">Renderer</text>
      </g>

      <!-- The contract -->
      <g class="contract">
        <rect x="365" y="200" width="170" height="56" rx="14" />
        <text x="450" y="233" text-anchor="middle">Schema (Zod)</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.arch-flow {
  width: 100%;
  max-width: 860px;
  margin: 1.5rem auto 0;
}
.arch-svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}

/* Faint rails */
.wire {
  fill: none;
  stroke: url(#arch-grad);
  stroke-width: 2.5;
  stroke-linecap: round;
  opacity: 0.35;
}
.feed {
  stroke-width: 2;
  stroke-dasharray: 5 5;
}

/* Glowing data packets */
.packet {
  filter: drop-shadow(0 0 5px currentColor);
}

/* Pipeline nodes */
.node rect {
  fill: #f0ecfe;
  stroke: #b3a7e8;
  stroke-width: 2;
}
.node text {
  fill: #2a2150;
  font-family: 'Inter', ui-sans-serif, sans-serif;
  font-size: 19px;
  font-weight: 600;
}

/* The shared contract — dashed, breathing */
.contract rect {
  fill: #f5f2ff;
  stroke: url(#arch-grad);
  stroke-width: 2.5;
  stroke-dasharray: 6 5;
  animation: arch-glow 3s ease-in-out infinite;
}
.contract text {
  fill: #2a2150;
  font-family: 'Fira Code', ui-monospace, monospace;
  font-size: 16px;
  font-weight: 600;
}
@keyframes arch-glow {
  0%, 100% { filter: drop-shadow(0 0 0 rgba(124, 77, 255, 0)); }
  50% { filter: drop-shadow(0 0 8px rgba(195, 20, 126, 0.55)); }
}

.elabel {
  fill: #3a3358;
  font-family: 'Fira Code', ui-monospace, monospace;
  font-size: 15px;
}
.flabel {
  fill: #8b80b5;
  font-family: 'Inter', ui-sans-serif, sans-serif;
  font-size: 13px;
  font-style: italic;
}
</style>
