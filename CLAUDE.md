# CLAUDE.md: Open Voice project handoff

## What this is
An interactive 3D vocal-tract trainer (Three.js, procedural geometry) built for Ulaş, who is learning to sing and wants an open, resonant voice instead of a throat-dominant one. He learns visually and uses the model to find the right internal sensations. Originally built in a claude.ai chat on 2026-11-19 and handed off to Claude Code.

## Owner context (relevant to the project)
- No structural blockage: he breathes freely through his nose and his tonsils were removed in infancy.
- The cause is muscular: habitual throat tension plus forward head posture.
- His singing teacher's cue (head back against a wall, neck lengthening up) made his voice strong, echoing and open. He has a deep, "stone-like" bass.
- Priorities: (1) make the alignment automatic without the wall, (2) release throat tension (silent laugh, tongue-root release, yawn onset), (3) daily SOVT (straw / lip trills), (4) let resonance come from length and space, not force.

## Working preferences
- Concise, neutral, direct answers; no filler. Don't end with follow-up questions or offers.
- He doesn't enjoy coding. Do the technical work end to end and explain only what he needs to act on.

## Repo layout & workflow
- `src/` is the source: `anatomy.js` (geometry, posture deformation), `main.js` (scene, airflow, UI, exercise engine) and `content.js` (all text, states, exercises).
- `index.html` is the **built** single-file site that GitHub Pages serves. Always run `npm install && npm run build` after editing `src/` and commit the rebuilt `index.html`.
- `docs/ARCHITECTURE.md` explains the parameter system and airflow; `docs/PRACTICE_LOG.md` is his practice tracker.
- Hosting: GitHub Pages from `main` / root → https://ulasayyilmaz.github.io/open-voice/
- Git identity: Ulas Ayyilmaz <98058432+ulasayyilmaz@users.noreply.github.com>

## Open tasks
- Confirm GitHub Pages is enabled (Settings → Pages → Deploy from branch → main, root). If not, enable it with `gh api -X POST repos/ulasayyilmaz/open-voice/pages -f 'source[branch]=main' -f 'source[path]=/'`.
- Verify the live site loads without console errors.
