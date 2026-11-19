# Architecture

The whole model is procedural (no external 3D assets). Units are roughly centimetres. Axes: **x** = forward (toward the face), **y** = up, **z** = lateral. The midline is `z = 0`, and the cut-away keeps `z ≤ 0`.

## Parameter state

Everything that moves is driven by one parameter object (`cur`). It eases toward a target (`tgt`) every frame, so states and exercise phases blend smoothly.

| Param | Range | Meaning |
|---|---|---|
| `hf` | 0–1 | Forward head posture (head translates forward, chin rotates up) |
| `lx` | ≈ −1.2…1.5 | Larynx height offset (cm, + = pulled up) |
| `tr` | 0–1 | Tongue-root retraction into the oropharynx |
| `tf` | 0–1 | Tongue forward / out |
| `vel` | 0–1 | Soft palate elevation (0 = lowered, nose open; 1 = sealed) |
| `fvf` | 0–1 | False vocal fold constriction |
| `pw` | 0–1 | Pharyngeal wall (constrictor) squeeze |
| `jaw` | 0–1 | Jaw opening |
| `lipAp`, `lipRound` | 0–1 | Lip aperture and rounding |
| `straw`, `trill`, `ttrill` | 0/1 | Straw prop, lip trill, tongue trill |
| `phon` | 0/1 | Vocalising (folds adducted and vibrating) |
| `flow` | −1/0/1 | Inhale / hold / exhale |
| `breath` | 0–1 | Lung volume (lungs, ribs, diaphragm) |
| `press` | 0–1 | SOVT back-pressure tint |
| `ng` | 0–1 | Tongue back raised to meet the velum |
| `adenoid`, `tonsil`, `turb`, `septum` | 0–1 | Structural enlargement (user sliders) |

## Posture deformation

`deformXY(x, y, w, hf)` maps a neutral-pose point to the posed one. Head structures (`w = 1`) rotate about the atlanto-occipital pivot and translate forward. Neck structures blend in with `w = neckW(y)` (a smoothstep from the thorax up to the jaw line). The thorax stays fixed. The skin, pharyngeal wall, vertebrae, larynx, straps and air path all use the same function, so they stay consistent.

## Dynamic soft tissue

- **Tongue:** 11 control points (functions of `tr, tf, jaw, ng, lx`) → closed Catmull-Rom → extruded, tapered toward the tip, rebuilt only when the points change. A flat cap with genioglossus fibre lines shows the cut face.
- **Velum:** a 4-point centreline interpolated between lowered and raised poses, with tapering thickness, extruded and capped.
- **Pharyngeal wall:** a half-pipe sheet swept along the posterior wall, pushed forward and narrowed by `pw`.
- **Larynx:** a rigid group (thyroid, cricoid, arytenoids, epiglottis, hyoid, true and false folds) offset by `lx` and the posture deformation.

## Airflow

Each frame `computeGeometry()` measures the **gap** (open width) at control points along three routes:

- **Lower:** trachea → glottis → false folds → vestibule → aditus → oropharynx (3 levels, gap = tongue-back surface − wall)
- **Oral:** under the velum/palate and over the tongue → lips (or straw)
- **Nasal:** velopharyngeal port (velum dorsal surface ↔ wall) → nasopharynx → nasal cavity → nostril

Each point has a reference width (`ref`). Colour = gap/ref, so the naturally narrow nose isn't drawn as "pinched". Valves that are closed on purpose (lips, sealed port, ng contact) are drawn grey, not red. The tubes use a custom variable elliptical cross-section mesh. Particle speed ∝ flow / gap (continuity), and at the junction particles pick the oral or nasal route in proportion to how open each one is.

## Exercises

In `src/content.js`, each exercise has a `base` parameter set and `phases: [{ d, p, cap, sens }]`:

- `d`: duration in seconds
- `p`: target params for this phase (merged on top of `base`)
- `cap`: caption text
- `sens`: sensation markers to glow (`lips, mask, hardPalate, softPalate, larynx, tongueRoot, ribs, belly, neckBack, crown`)

To add an exercise, append an object to `EXERCISES` and rebuild.

## Warnings and meters

`WARN` in `main.js` is a list of `[text, condition, anchor]`. A tag appears at the anchor while its condition is true. The meters read `geo.oroMin`, `lx`, `fvf`, `vel`, `geo.nasalStruct` and `hf`.
