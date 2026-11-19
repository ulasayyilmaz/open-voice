// Text content, states and exercise choreography.

export const BASE = {
  hf: 0, lx: 0, tr: 0.1, tf: 0, vel: 0, fvf: 0.05, pw: 0.05, jaw: 0.08, lipAp: 0, lipRound: 0,
  straw: 0, trill: 0, phon: 0, flow: 0, auto: 1, press: 0, ng: 0, breath: 0.5, water: 0, ttrill: 0,
};
export const OPEN = { hf: 0, lx: -0.25, tr: 0, tf: 0.15, vel: 1, fvf: 0, pw: 0, jaw: 0.42, lipAp: 0.6, lipRound: 0, phon: 1, flow: 1, auto: 0, ng: 0, press: 0, straw: 0, trill: 0 };
export const THROATY = { hf: 0.9, lx: 1.35, tr: 0.95, tf: 0, vel: 0.75, fvf: 0.85, pw: 0.8, jaw: 0.14, lipAp: 0.35, lipRound: 0, phon: 1, flow: 1, auto: 0, ng: 0, press: 0, straw: 0, trill: 0 };

export const STRUCTS = {
  nasal: ['Nasal cavity', 'Two passages split by the septum, running from the nostrils back to the choanae (the back openings into the throat). You breathe through it, and sound passes through it on m, n and ng. On sung vowels very little air flows here; it acts more like a side chamber. On "mm" or "ng" you feel it as a buzz on the bridge of the nose.'],
  turb: ['Turbinates (nasal conchae)', 'Scroll-shaped bones lined with mucosa on the side walls of the nose. They warm and humidify air and swell and shrink in a normal nasal cycle. With allergies, colds or chronic rhinitis they can stay swollen and block the nose. <b>No voice exercise shrinks them.</b> An ENT can.'],
  septum: ['Nasal septum', 'The midline wall of cartilage and bone between the two nasal passages. A deviated (bent) septum can narrow one or both sides. If you rarely breathe freely through your nose, have an ENT check it.'],
  palate: ['Hard palate', 'The bony roof of the mouth, which is also the floor of the nose. Bright vowels and "forward" placement are often felt as vibration behind the upper front teeth and here.'],
  velum: ['Soft palate (velum)', 'The muscular valve between the mouth and the nose. <b>Lowered:</b> air and sound go into the nose (breathing, m, n, ng). <b>Raised:</b> it seals the nose so sound leaves through the mouth, as on most sung vowels. It is lifted mainly by the <i>levator veli palatini</i>. You feel it lift as a cool, domed space at the back of the mouth at the start of a yawn or a surprised inhale.'],
  uvula: ['Uvula', 'The small tip that hangs from the soft palate. It rises and shortens when the velum lifts.'],
  adenoid: ['Adenoids (pharyngeal tonsil)', 'Lymphoid tissue on the back wall of the nasopharynx. It is large in childhood and usually shrinks by adulthood. When it stays enlarged it causes mouth breathing, snoring and a "stuffy" (hyponasal) sound. This is a medical issue, not a trainable one.'],
  tonsil: ['Palatine tonsils', 'Lymphoid tissue on the side walls of the oropharynx. Very large tonsils narrow the throat and can make it harder to lift the palate. ENT territory.'],
  naso: ['Nasopharynx', 'The upper throat, behind the nose and above the soft palate. The velopharyngeal port, the opening between the palate and this back wall, connects the mouth-throat to the nose.'],
  oro: ['Oropharynx', 'The throat behind the tongue, and the main resonating space for singing. Its front wall is the <b>tongue root</b> and its back and side walls are the <b>pharyngeal constrictor muscles</b>. "Open throat" in pedagogy means this space is wide and relaxed, not forced.'],
  laryngo: ['Laryngopharynx', 'The lowest part of the throat, just above and behind the larynx, which leads into the esophagus at the bottom.'],
  tongue: ['Tongue', 'A large muscle mass (intrinsic muscles plus genioglossus, hyoglossus, styloglossus and palatoglossus). Its front shapes vowels. Its back is the front wall of your throat, so where the tongue sits decides how much throat space you have.'],
  root: ['Tongue root', 'When the base of the tongue is pulled back and down (mainly by the hyoglossus), it crowds the oropharynx and presses toward the larynx. The result is a swallowed, "stuck in the throat" sound. To check: press a thumb gently into the soft spot under your chin while you sing. If it hardens or pushes down, the tongue root is working.'],
  epiglottis: ['Epiglottis', 'A leaf of cartilage that folds over the larynx when you swallow. The rim around it (the aryepiglottic folds) can narrow. Some styles do this deliberately ("twang"), but a constant squeeze is part of constriction.'],
  hyoid: ['Hyoid bone', 'A floating U-shaped bone that the larynx hangs from and the tongue sits on. Jaw, tongue and neck muscles all pull on it, so tension in any of them moves your larynx.'],
  larynx: ['Larynx (thyroid cartilage)', 'The voice box; its front point is the Adam\'s apple. It rises when you swallow. A larynx that is habitually held high shortens the vocal tract (thinner, brighter, tighter) and stiffens the folds. Rest your fingers lightly on the Adam\'s apple while you sing a scale: big jumps upward mean it is being pulled up.'],
  fvf: ['False vocal folds (ventricular folds)', 'Two folds just above the true vocal folds. They squeeze when you lift something, strain, grunt or hold your breath, and often under stress. When they are squeezed, the voice sounds gritty, effortful and "throaty". When they are retracted (as in a silent laugh), the true folds vibrate freely and the sound is clean.'],
  tvf: ['True vocal folds', 'The two folds that vibrate to make sound, about 100–200 times per second in a male speaking voice. They are apart when you breathe and come together when you voice. Look at the top-down view in the bottom-left panel.'],
  trachea: ['Trachea', 'The windpipe from the larynx to the lungs, kept open by C-shaped rings of cartilage.'],
  esoph: ['Esophagus', 'The food tube behind the trachea. It is collapsed except when you swallow.'],
  spine: ['Cervical spine', 'The pharynx and larynx hang directly in front of these vertebrae. When the head pokes forward, the neck flexes at the bottom and extends at the top, which changes how the larynx is suspended and makes the neck muscles brace.'],
  mandible: ['Jaw (mandible)', 'It hinges just in front of the ears. A clenched or jutting jaw drags the tongue and hyoid with it. In singing, the jaw is released downward rather than pushed.'],
  lips: ['Lips', 'The outlet of the vocal tract. Narrowing them (straw, lip trill, "oo") creates the semi-occlusion that SOVT exercises use.'],
  constrictor: ['Pharyngeal constrictors', 'Three overlapping muscles that wrap the back and sides of the throat. They squeeze food down when you swallow. If they are overactive while you sing, the walls of the throat move inward and the resonating tube narrows.'],
  levator: ['Levator veli palatini', 'Runs from the skull base down into the soft palate, one on each side. It lifts the velum. You can train awareness of it with ng→ah and with yawn-onset inhales.'],
  scm: ['Sternocleidomastoid', 'The large diagonal neck muscle. With forward head posture it works constantly, and the bracing spreads to the muscles around the larynx.'],
  supra: ['Suprahyoid muscles', 'Run from the jaw and skull to the hyoid and lift the larynx. They are overactive in throaty singing. You can feel them under the chin.'],
  infra: ['Infrahyoid ("strap") muscles', 'Run from the sternum to the hyoid and larynx and pull the larynx down. They balance the suprahyoids.'],
  masseter: ['Masseter', 'The jaw-closing muscle. Clenching here usually comes with tongue and throat tension.'],
  lungs: ['Lungs', 'The air supply. Steady, regulated airflow from below means the throat does not need to clamp to control pressure.'],
  diaphragm: ['Diaphragm', 'A dome-shaped muscle. It flattens downward when you inhale, so the belly and lower ribs expand. It is passive on the exhale: support while you sing comes from the abdominal and rib muscles managing how fast it rises.'],
  ribs: ['Rib cage / intercostals', 'The ribs swing outward when you inhale. In appoggio-style support, singers keep the ribs comfortably open while they sing so the exhale is metered smoothly.'],
};

export const STATES = [
  {
    id: 'rest', name: 'Resting breath (nose)', cam: 'head', params: { ...BASE },
    text: 'Quiet nasal breathing. The soft palate hangs <b>down</b>, so air takes the nasal route (blue particles through the nose). This is the normal open mouth-to-nose path. Compare it with the singing states.',
  },
  {
    id: 'open', name: '✅ Open singing (target)', cam: 'throat', params: { ...OPEN },
    text: 'The head is balanced over the spine, the larynx is comfortably low and stable, the tongue root is forward, the throat walls are relaxed, the false folds are retracted and the soft palate is lifted. The long, wide pharynx is the "open" sound you hear in good singers. The nasal port is mostly closed on vowels; the "mask" buzz is vibration, not airflow.',
  },
  {
    id: 'throaty', name: '⚠️ Throat-dominant (your description)', cam: 'throat', params: { ...THROATY },
    text: 'Several habits stack up: the <b>head is forward</b>, the <b>larynx is pulled up</b>, the <b>tongue root is pulled back</b> into the throat, the <b>throat walls squeeze</b> and the <b>false folds narrow</b>. The red zones in the air column show where the tube is pinched. All of these are <b>muscular habits, so they are trainable</b>.',
  },
  {
    id: 'fhp', name: 'Forward head only', cam: 'head', params: { ...OPEN, hf: 1, lx: 0.9, pw: 0.35, tr: 0.3, fvf: 0.25 },
    text: 'This is the habit your teacher pointed out. When the chin juts forward, the upper neck extends and the muscles that suspend the larynx brace. The larynx rides up and the throat tension spreads. Standing against the wall resets the alignment.',
  },
  {
    id: 'tongue', name: 'Tongue-root crowding only', cam: 'throat', params: { ...OPEN, tr: 1, jaw: 0.25 },
    text: 'The tongue base retracts into the oropharynx. This is the most common cause of a "swallowed" or "stuck" tone. Compare the red pinch behind the tongue with the open state.',
  },
  {
    id: 'ffold', name: 'Squeezed false folds only', cam: 'larynx', params: { ...OPEN, fvf: 1 },
    text: 'The ventricular folds close in over the true folds (see the top-down view at the bottom left). The sound gets gritty and effortful and tires you quickly.',
  },
  {
    id: 'velo', name: 'Soft palate passive (nasal leak)', cam: 'nose', params: { ...OPEN, vel: 0.15 },
    text: 'If the palate does not lift on vowels, sound leaks into the nose and the tone turns twangy or nasal. This is the <i>opposite</i> of a blocked nose. Pinch your nose while you sing "ah": if the sound changes a lot, this is happening.',
  },
];

export const STRUCT_TOGGLES = [
  { id: 'adenoid', name: 'Enlarged adenoids', text: 'Blocks the nasopharynx above the palate, so the nasal route closes. Typical signs are mouth breathing, snoring and a stuffy "mm".' },
  { id: 'tonsil', name: 'Enlarged tonsils', text: 'Narrows the oropharynx from the sides and can make it harder to lift the palate.' },
  { id: 'turb', name: 'Swollen turbinates', text: 'Allergies or chronic rhinitis. The nasal passages narrow and nose breathing feels blocked.' },
  { id: 'septum', name: 'Deviated septum', text: 'A bent midline wall narrows one side of the nose.' },
];

// Each phase: d = seconds, p = target params (merged on top of exercise base), cap = caption, sens = sensation markers
export const EXERCISES = [
  {
    id: 'posture', name: 'Wall alignment', tag: 'Posture · your teacher\'s cue', cam: 'head',
    base: { ...OPEN },
    goal: 'Stack the head over the spine so the larynx can hang freely and the throat can lengthen. This undoes the forward-head pull on the larynx.',
    how: ['Stand with your heels about 5 cm from a wall. Let the back of your head, your shoulder blades and your sacrum touch the wall.', 'Keep the chin <b>level</b>. Don\'t tilt it up and don\'t tuck it hard.', 'Think "the back of my neck gets long and the crown floats up". The front of the neck stays soft.', 'Sing a 5-note scale on "ah", then step away from the wall and keep the same alignment.'],
    feel: 'The head feels weightless, balanced between the ears. The front of the throat feels quiet, and nothing under the chin is working.',
    mistakes: ['Pressing the head back hard into the wall, which is a new tension.', 'Lifting the chin, which tightens the front of the neck.', 'A military, rigid chest.'],
    dose: '1–2 min at the start of every session, then side-view checks in a mirror or phone camera between songs. Reset during screen work as well, because the habit forms there.',
    evidence: 'Forward head posture is linked to vocal fatigue and to raised hyoid/larynx position. High larynx, pharyngeal constriction and laryngeal compression are classic signs of hyperfunctional voice.',
    phases: [
      { d: 3.5, p: { hf: 1, lx: 1.1, pw: 0.45, tr: 0.35, fvf: 0.35 }, cap: 'Habit: the head pokes forward and the chin juts. The larynx is pulled up and the throat shortens and tightens.', sens: ['neckBack', 'larynx'] },
      { d: 3.5, p: { hf: 0.4, lx: 0.5, pw: 0.25, tr: 0.2, fvf: 0.15 }, cap: 'Back of the head, shoulder blades and sacrum touch the wall. The chin stays level.', sens: ['neckBack'] },
      { d: 3.5, p: { hf: 0, lx: -0.2, pw: 0, tr: 0, fvf: 0 }, cap: 'The back of the neck lengthens upward. The head floats over the spine and the larynx settles lower.', sens: ['crown'] },
      { d: 4, p: { hf: 0, phon: 1 }, cap: 'Sing a 5-note scale on "ah" in this alignment. The throat stays quiet.', sens: ['crown', 'softPalate'] },
    ],
  },
  {
    id: 'straw', name: 'Straw phonation (SOVT)', tag: 'Semi-occluded vocal tract', cam: 'head',
    base: { ...OPEN, straw: 1, lipAp: 0.15, lipRound: 1, jaw: 0.18, press: 1 },
    goal: 'Phonating through a narrow straw sends pressure back into the whole tract. That back-pressure helps the vocal folds vibrate with less squeeze and less effort, tends to lower the larynx and widen the throat, and trains efficient coordination you then carry into open vowels.',
    how: ['Seal your lips around a straw (a stirring straw gives more resistance than a drinking straw). The soft palate stays up, so no air comes out of the nose.', 'Hum "oo" through the straw on a comfortable pitch. Keep the airflow gentle and steady.', 'Slide up and down (sirens), then do 5-note scales and simple song melodies through the straw.', 'Take the straw out and sing the same phrase on "oo", then "ah". Copy the ease you just felt.', 'Variation: a straw 2–5 cm deep in a cup of water. Steady bubbles show steady airflow.'],
    feel: 'A gentle buzz at the lips. The throat feels effortless and "puffed" open, as if there is air pressure in the mouth and cheeks.',
    mistakes: ['Air leaking through the nose (pinch it to test: nothing should change).', 'Pushing a lot of air.', 'Clenching the jaw on the straw.'],
    dose: 'About 5 min, 2–4× a day. One study had singers do four 5-minute sessions a day for 21 days.',
    evidence: 'SOVT exercises are among the best-studied tools in voice training. They are used in both voice clinics and singing studios and were compared in a randomized trial against Vocal Function Exercises.',
    phases: [
      { d: 2.5, p: { phon: 0, flow: -1, breath: 1 }, cap: 'Lips around the straw. Breathe in low and calm.', sens: ['ribs'] },
      { d: 4, p: { phon: 1, flow: 1, breath: 0.6, lx: -0.5, pw: 0, fvf: 0 }, cap: 'Hum "oo" into the straw. Back-pressure (violet) fills the tract; the folds work with less squeeze and the larynx settles.', sens: ['lips', 'softPalate'] },
      { d: 4, p: { phon: 1, lx: -0.35, tr: 0 }, cap: 'Sirens low to high and back. The pressure stops the throat from clamping as the pitch rises.', sens: ['lips', 'mask'] },
      { d: 4, p: { straw: 0, press: 0, lipAp: 0.6, lipRound: 0.2, jaw: 0.4 }, cap: 'Take the straw away and sing "oo" to "ah". Keep the same easy, open feeling.', sens: ['mask', 'softPalate'] },
    ],
  },
  {
    id: 'trill', name: 'Lip & tongue trills', tag: 'SOVT · release', cam: 'head',
    base: { ...OPEN, trill: 1, lipAp: 0.12, jaw: 0.15, press: 0.7 },
    goal: 'Same back-pressure benefit as the straw. In addition, the trill only works if the lips, jaw and breath are loose and the airflow is steady, so it gives you built-in feedback on tension.',
    how: ['Loose lips, then blow a "brrr" (motorboat) on breath only.', 'Add voice on a low, easy pitch.', 'Do 5-note scales, then octave sirens. The trill must not stop on the high notes.', 'Tongue trill ("rrr") is the same idea and also loosens the tongue.', 'If your lips won\'t trill, press your fingertips lightly into your cheeks at the corners of the mouth.'],
    feel: 'Tickling buzz in the lips and nose. No effort in the throat.',
    mistakes: ['The trill stalls on high notes. That means you are pushing or squeezing, so back off.', 'Puffed, tense cheeks.'],
    dose: '3–5 min in every warm-up.',
    evidence: 'In one study comparing /m/, lip trill and straw phonation, singers rated the lip trill as having the most robust overall effect.',
    phases: [
      { d: 3, p: { phon: 0, flow: 1, trill: 1 }, cap: 'Trill on breath alone: loose lips, steady airflow.', sens: ['lips'] },
      { d: 4, p: { phon: 1, lx: -0.4 }, cap: 'Add voice on an easy low pitch. The trill makes the back-pressure for you.', sens: ['lips', 'mask'] },
      { d: 4, p: { phon: 1, ttrill: 1, tf: 0.3 }, cap: 'Switch to a tongue trill ("rrr"). The front of the tongue flutters and the root releases forward.', sens: ['hardPalate', 'mask'] },
      { d: 3.5, p: { trill: 0, ttrill: 0, press: 0, lipAp: 0.6, jaw: 0.42 }, cap: 'Open to "ah" on the same pitch. Keep the looseness.', sens: ['mask', 'softPalate'] },
    ],
  },
  {
    id: 'ng', name: 'Hum & NG → vowel', tag: 'Resonance · soft-palate control', cam: 'nose',
    base: { ...OPEN },
    goal: 'This is the exercise for the <b>mouth-to-nose feeling</b>. It trains conscious control of the soft palate (down for "ng", up for vowels) and the forward resonance sensations that resonant-voice therapy relies on. You learn to keep the buzz while the palate lifts.',
    how: ['Say "sing" and hold the "ng". The back of the tongue touches the lowered soft palate, so all the sound goes through the nose.', 'Feel the buzz on the bridge of your nose and your cheekbones. Pinch your nose and the sound stops, which proves the nasal route is open.', 'Slowly open "ng→ah". The tongue drops forward and the palate lifts. Try to keep the buzzy "ring" as the vowel opens.', 'Also do "mm-ah" and "mm-hmm" glides with easy forward vibration, then "nya-nya-nya" on 5-note scales.'],
    feel: 'A buzz in the nose and face ("mask") on ng and mm. On "ah", a lifted dome at the back of the mouth while some of the ring stays forward.',
    mistakes: ['Squeezing the nose or forcing the hum (it should be easy and buzzy, not pressed).', 'Letting "ah" stay nasal. Pinch your nose on the "ah": it should barely change.'],
    dose: '4–5 min daily. Use this whenever the voice feels stuck in the throat.',
    evidence: 'Resonant voice therapy uses humming and forward vibrations to get maximum sound with minimal effort. Studies show singers do adjust the velopharyngeal port, and some trained singers leave a small opening on vowels.',
    phases: [
      { d: 4, p: { vel: 0, ng: 1, jaw: 0.3, lipAp: 0.45, phon: 1 }, cap: '"ng": the tongue back meets the lowered velum. Sound and air go out through the nose. Feel the buzz.', sens: ['mask', 'softPalate'] },
      { d: 2.5, p: { vel: 0, ng: 0, lipAp: 0, jaw: 0.15, phon: 1 }, cap: '"mm": lips closed, palate low. Pure nasal hum with forward vibration.', sens: ['lips', 'mask'] },
      { d: 4.5, p: { vel: 1, ng: 0, jaw: 0.42, lipAp: 0.6, phon: 1 }, cap: 'Open to "ah": the palate lifts and seals the nose, and the tongue drops forward. Keep the forward buzz.', sens: ['mask', 'softPalate', 'hardPalate'] },
      { d: 3.5, p: { vel: 0.15, ng: 0, phon: 1 }, cap: 'Check: if "ah" drifts nasal (palate sagging), pinch your nose. The sound should barely change.', sens: ['mask'] },
    ],
  },
  {
    id: 'yawn', name: 'Yawn-onset inhale & sigh', tag: 'Throat space · larynx height', cam: 'throat',
    base: { ...OPEN },
    goal: 'Use the <i>beginning</i> of a yawn to lift the soft palate, lower the larynx and widen the pharynx, then sing out of that space. This is a classic tool for lowering a high larynx.',
    how: ['Inhale as if you are pleasantly surprised or just beginning a yawn. Feel cool air at the back of the mouth and the palate rising.', '<b>Stop before the full yawn.</b> A full yawn pushes the tongue root down and back.', 'Sigh from high to low on "ha" and keep the space as the pitch falls.', 'Then sing a 5-note scale on "ah" with that inhale before each phrase.'],
    feel: 'A cool, tall dome at the back of the mouth. The larynx settles slightly lower, which you can feel under your fingers. The throat feels wide, not pushed.',
    mistakes: ['A full, forced yawn, which gives a hooty, dark, swallowed tone and tongue-root tension.', 'Pressing the larynx down with the tongue.'],
    dose: '2–3 min daily, plus one yawn-onset breath before each phrase in songs.',
    evidence: 'The yawn-sigh is listed among exercises used to lower the larynx. Pedagogy sources also warn that the yawn cue can cause tongue-root tension in many singers.',
    phases: [
      { d: 3.5, p: { phon: 0, flow: -1, breath: 1, vel: 1, lx: -0.9, pw: 0, tr: 0, jaw: 0.5, lipAp: 0.6 }, cap: 'Yawn-onset inhale: the palate lifts, the larynx drops and the throat widens.', sens: ['softPalate', 'larynx'] },
      { d: 3, p: { phon: 0, flow: 0, tr: 0.75, lx: -1.2, jaw: 0.75 }, cap: 'Too far: in a full yawn the tongue root presses back and down. Avoid this.', sens: ['tongueRoot'] },
      { d: 4, p: { phon: 1, flow: 1, breath: 0.4, tr: 0, lx: -0.5, jaw: 0.45 }, cap: 'Sigh high to low on "ha", keeping the space but staying free.', sens: ['softPalate', 'mask'] },
      { d: 3.5, p: { phon: 1, lx: -0.3 }, cap: 'Sing "ah" from the same space: tall, but not forced.', sens: ['softPalate'] },
    ],
  },
  {
    id: 'tongue', name: 'Tongue-root release', tag: 'Tongue · jaw', cam: 'throat',
    base: { ...OPEN },
    goal: 'Move the tongue base forward out of the throat and teach the tongue and jaw to move independently of the larynx.',
    how: ['Rest the tip of your tongue against your lower front teeth.', '<b>Tongue-out "ah":</b> let the tongue rest on the lower lip (relaxed, not stuck out hard) and sing "ah" on 5-note scales. This pulls the root forward.', 'Slowly bring the tongue back in while keeping the root forward. Thumb under the chin: it should stay soft.', '"Yah-yah-yah" on scales: the tongue moves and the jaw stays still and released.', 'Chewing hum: hum while chewing loosely (the Froeschels chewing method) to free the jaw and tongue.'],
    feel: 'Space and coolness behind the tongue, and a soft area under the chin. The sound becomes brighter and more forward.',
    mistakes: ['Forcing the tongue far out (that is new tension).', 'A depressed, grooved tongue to "make space".'],
    dose: '3 min daily, plus thumb-under-chin checks while you sing songs.',
    evidence: 'Chronic tongue tension usually means the hyoglossus is retracting and depressing the tongue base. Retraining starts by recognizing the relaxed state of that area and monitoring it while singing.',
    phases: [
      { d: 3.5, p: { tr: 0.95, tf: 0, jaw: 0.25 }, cap: 'Before: the tongue root is pulled back into the throat (red pinch).', sens: ['tongueRoot'] },
      { d: 4, p: { tr: 0, tf: 1, jaw: 0.45, lipAp: 0.75 }, cap: 'Tongue-out "ah": the root is pulled forward and the throat opens wide.', sens: ['tongueRoot', 'softPalate'] },
      { d: 4, p: { tr: 0, tf: 0.25, jaw: 0.42 }, cap: 'Bring the tongue back in and keep the root forward. The tip rests at the lower teeth.', sens: ['tongueRoot', 'hardPalate'] },
      { d: 3, p: { tr: 0, tf: 0.2, jaw: 0.42 }, cap: 'Thumb under the chin stays soft while you sing.', sens: ['tongueRoot'] },
    ],
  },
  {
    id: 'laugh', name: 'Silent laugh (false-fold retraction)', tag: 'Larynx · Estill-style', cam: 'larynx',
    base: { ...OPEN },
    goal: 'Pull the false vocal folds away from the true folds so the true folds can vibrate freely. This removes the "grit" and effort from a throat-dominant voice.',
    how: ['Breathe in and out noisily through an open mouth and notice the friction noise. That is constriction.', 'Now laugh silently, or think of something very funny or a happy surprise, and breathe through that smile. The noise disappears: that is retraction.', 'Keep that inner feeling and start an easy "ah". Then do sirens and 5-note scales.', 'Check yourself by breathing silently before each phrase.'],
    feel: 'A widening, "smiling" sensation inside the throat, quiet breathing and a clean sound with less effort.',
    mistakes: ['Grinning hard with the face instead of the inside.', 'Holding the breath.'],
    dose: '2 min daily, then a silent breath before every phrase.',
    evidence: 'Laryngoscopy grading of hyperfunction looks for squeezing of the false folds over the true folds. Retraction exercises such as the silent laugh are standard in Estill-based teaching.',
    phases: [
      { d: 3.5, p: { phon: 0, flow: 1, fvf: 1, pw: 0.4 }, cap: 'Noisy breath: the false folds are squeezed (see the top-down view).', sens: ['larynx'] },
      { d: 3.5, p: { phon: 0, flow: -1, fvf: 0, pw: 0 }, cap: 'Silent laugh: the false folds pull apart and the breath goes quiet.', sens: ['larynx', 'softPalate'] },
      { d: 4, p: { phon: 1, flow: 1, fvf: 0 }, cap: 'Start "ah" with the retraction. The true folds vibrate freely.', sens: ['larynx', 'mask'] },
      { d: 3, p: { phon: 1, fvf: 0.05 }, cap: 'Sirens and scales while keeping the inner smile.', sens: ['mask'] },
    ],
  },
  {
    id: 'breath', name: 'Breath management (appoggio)', tag: 'Support · whole body', cam: 'context',
    base: { ...OPEN },
    goal: 'Make the air pressure and flow with the ribs and abdominals so the throat doesn\'t have to clamp to control them.',
    how: ['Inhale low and wide: the belly releases, the lower ribs swing out sideways and to the back, and the shoulders stay still.', 'Exhale on a steady "sss" for 15–25 s. Keep the ribs comfortably open for as long as you can while the lower abdominals slowly take over.', 'Repeat on "zzz" (voiced), then on a sung "ah". The steadiness should come from below, not from the throat.'],
    feel: 'Expansion around the waist and lower back, and a quiet, passive throat.',
    mistakes: ['Lifting the shoulders and chest.', 'Locking the belly rigid.', 'Taking huge breaths for short phrases.'],
    dose: '3 min daily.',
    evidence: 'Breath management is the foundation of all major schools of singing. It works together with the other exercises rather than replacing them.',
    phases: [
      { d: 4, p: { phon: 0, flow: -1, breath: 1, vel: 0, jaw: 0.15, lipAp: 0.3 }, cap: 'Low, wide inhale: the diaphragm flattens and the ribs swing out.', sens: ['ribs', 'belly'] },
      { d: 5, p: { phon: 0, flow: 1, breath: 0.35, vel: 1, lipAp: 0.15 }, cap: 'Steady "sss" exhale. The ribs stay open and the abdominals meter the air.', sens: ['ribs', 'belly'] },
      { d: 5, p: { phon: 1, flow: 1, breath: 0.1, lipAp: 0.6, jaw: 0.42 }, cap: 'Sung "ah": support from below, with a free, open throat.', sens: ['belly', 'mask'] },
    ],
  },
];

export const CHECKS = [
  ['Nose-breathing test', 'Close one nostril and breathe in through the other, then switch sides. If one or both sides are often hard to breathe through, or you snore, mouth-breathe or often have a "cold" sound, there may be a structural or inflammatory blockage (septum, turbinates, adenoids, allergy). See an ENT or phoniatrician. Exercises won\'t fix this.'],
  ['Hum test', 'Hum "mmm" and then pinch your nose: the sound should stop almost completely. If humming feels muffled or effortful even before you pinch, the nasal route is restricted.'],
  ['Vowel pinch test', 'Sing a sustained "ah" and pinch your nose for a moment. A <b>small</b> change is normal (the palate is mostly up). A <b>big</b> change means the palate isn\'t lifting and sound is leaking into the nose.'],
  ['Larynx check', 'Rest your fingertips lightly on the Adam\'s apple and sing a 5-note scale up. A little movement is normal; a big upward jump means the larynx is being pulled up.'],
  ['Thumb-under-chin check', 'Press your thumb gently into the soft area behind your chin while you sing. If it hardens or pushes down, the tongue root or the suprahyoid muscles are working.'],
  ['Side-view video', 'Film yourself singing from the side. If the ear sits well in front of the shoulder or the chin juts on high notes, that is the forward-head habit.'],
  ['Silent-breath check', 'Breathe in through an open mouth before a phrase. Audible friction means the false folds or throat are narrowed.'],
];

export const PLAN = `
<h4>Daily routine (20–30 min, 5–6 days/week)</h4>
<ol>
<li><b>Align & release (3 min):</b> wall alignment, gentle jaw and neck massage, tongue-out stretches.</li>
<li><b>Breath (3 min):</b> low and wide inhale, then "sss" and "zzz" exhales.</li>
<li><b>SOVT (5 min):</b> straw or lip trills: sirens, 5-note scales, and the melody of a song you're learning.</li>
<li><b>Resonance (5 min):</b> ng→ah, mm-ah, "nya-nya" scales. Find the buzz and keep it as vowels open.</li>
<li><b>Space & release (4 min):</b> yawn-onset inhales, tongue-out "ah", silent-laugh onsets.</li>
<li><b>Apply (5–10 min):</b> one song phrase, first on a lip trill or straw, then on "ng", then on vowels only, then with the words. Keep the same sensation at each step.</li>
</ol>
<h4>Progression</h4>
<ul>
<li><b>Weeks 1–4 · Awareness:</b> find each sensation slowly in your low-middle range. Use the self-checks often. Expect it to feel strange at first.</li>
<li><b>Months 2–3 · Coordination:</b> combine the elements (aligned + released + supported). Sirens through your whole range. Keep the alignment without the wall.</li>
<li><b>Months 4–6 · Automaticity:</b> fewer cues and more repertoire. Extend the range upward without the larynx jumping.</li>
<li><b>6–12+ months · Artistry:</b> style, dynamics, longer songs. The open sound becomes your default.</li>
</ul>
<h4>What actually accelerates progress</h4>
<ul>
<li><b>A good teacher</b>, weekly or at least every 2 weeks. Your own sensations can mislead you, and a trained ear catches compensations early.</li>
<li><b>Record yourself</b> weekly on the same exercise and the same song, and compare month to month.</li>
<li><b>Short, frequent practice</b> beats long sessions for motor learning. Stop when the voice feels tired.</li>
<li><b>Voice hygiene:</b> hydration, sleep, avoid shouting over noise and constant throat clearing. Manage reflux and allergies if you have them.</li>
<li><b>Medical check if:</b> you have chronic nasal blockage, hoarseness for more than 2–3 weeks, pain when singing, or a voice that never gets easier. A phoniatrician (Phoniatrie) or ENT can look at your nose, palate and vocal folds with an endoscope. In Berlin, the large clinics have phoniatrics departments, and a speech therapist (Logopädie) with a voice focus can work with you on a prescription.</li>
</ul>`;

export const SOURCES = [
  ['Kapsner-Smith et al. – RCT of two SOVT voice therapy protocols', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4610291'],
  ['Maxfield et al. – Intraoral pressures of 13 SOVT gestures', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4970513'],
  ['NATS Journal of Singing – A reflection on SOVT research', 'https://www.nats.org/_Library/JOS_On_Point/JOS_077_03_2021_333.pdf'],
  ['Voice Foundation 2025 – Straw phonation vs lip trill in singers', 'https://voicefoundation.org/view/2025-abstracts/entry/3014/'],
  ['Perceptual/acoustic effects of /m/, lip trill, straws (2020)', 'https://informahealthcare.com/doi/full/10.1080/23268263.2020.1781373'],
  ['Guzman et al. – Larynx height, pharyngeal width & SOVT postures', 'https://pubmed.ncbi.nlm.nih.gov/24075912/'],
  ['Austin – Velopharyngeal port status during classical singing (JSLHR 2005)', 'https://pubs.asha.org/doi/10.1044/1092-4388(2005/091)'],
  ['Sundberg et al. – Resonatory effects of a velopharyngeal opening', 'https://archive.ncvs.org/pas/2004/pres/sundberg/SundbergNotes.pdf'],
  ['Aura et al. – Nasoendoscopic study of "head resonance" in singing', 'https://trepo.tuni.fi/bitstream/10024/132819/1/A_nasoendoscopic_study_of_head_resonance_2020.pdf'],
  ['Classical Singer – Hyoglossus & tongue tension (Parts 1–2)', 'https://www.csmusic.net/content/articles/musings-on-mechanics-15'],
  ['Classical Singer – Singing and the nose (ENT perspective)', 'https://csmusic.net/content/articles/singing-and-the-nose'],
  ['Classical Singer – Uncovering your voice (tonsils, adenoids)', 'https://csmusic.net/content/articles/uncovering-your-voice'],
  ['Barbershop Harmony Society – Voice production & resonance myths', 'https://www.barbershop.org/vocal-health-voice-production-and-resonance'],
  ['Rubin et al. – Laryngeal hyperfunction (false-fold compression grading)', 'https://andymatuschak.org/files/papers/Rubin%20et%20al%20-%202006%20-%20Laryngeal%20Hyperfunction%20During%20Whispering.pdf'],
  ['Physiopedia – Postural principles in voice production', 'https://www.physio-pedia.com/Postural_Principles_Useful_in_Speech_Therapy_-_Part_2'],
  ['Effect of forward head posture on vocal fatigue', 'https://www.jnujaipur.ac.in/research-details/school-of-allied-health-sciences/effect-of-forward-head-posture-on-vocal-fatigue-/216/216/28/15'],
  ['Estill Voice Training (overview)', 'https://www.wikipedia.org/wiki/Estill_Voice_Training'],
];
