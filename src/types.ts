export interface WeekData {
  tri: string;
  fruit: string;
  size: string;
  baby: string;
  mom: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  week: number;
  mood: string;
  emoji: string;
  text: string;
  symptoms: string[];
  advice?: string;
  quick?: boolean;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  note?: string;
  done: boolean;
}

export interface VitalsProfile {
  hgb?: string; // Hemoglobin (10.5 - 16 g/dL)
  hct?: string; // Hematocrit (33 - 46 %)
  wbc?: string; // White blood cell (4.5 - 11 K/uL)
  plt?: string; // Platelets (150 - 400 K/uL)
  a1c?: string; // HbA1C (under 5.6%)
  glu?: string; // Fasting Glucose (60 - 95 mg/dL)
  wt?: string;  // Weight lbs
  ht?: string;  // Height inches
  bp?: string;  // BP systolic/diastolic
  fer?: string; // Ferritin (12 - 150 ng/mL)
}

export const WEEK_DETAILS: Record<number, WeekData> = {
  1: {
    tri: "First Trimester",
    fruit: "🌱",
    size: "poppy seed",
    baby: "A fertilized egg (blastocyst) is implanting into your rich uterine lining. The cells are dividing at lightspeed to lay the architecture of your future child.",
    mom: "Your cycle has concluded. Surges in estrogen and progesterone are priming your body, though physically you may feel no different yet."
  },
  2: {
    tri: "First Trimester",
    fruit: "🌱",
    size: "tiny seed",
    baby: "Amniotic fluid is forming. Major cells are organizing into layers that will yield organs, nervous system tissue, and skeletal structures.",
    mom: "Your uterine walls are thickening. Early signals of fatigue or mild ovulation sensations might be felt."
  },
  3: {
    tri: "First Trimester",
    fruit: "🌱",
    size: "vanilla seed",
    baby: "Implantation is completed. The embryonic disk is taking shape, and the early cell structure of the placenta starts developing to supply oxygen.",
    mom: "A home pregnancy test might turn positive soon! You may experience minor implantation spotting or light cramping."
  },
  4: {
    tri: "First Trimester",
    fruit: "🌱",
    size: "poppy seed",
    baby: "The neural tube — the precursor to the brain and spinal cord — is forming. The home of your baby's heart is starting to swell.",
    mom: "HCG hormone rises fast. Tender breasts, fatigue, and sensitivity to smells begin to surface. Some light spotting can occur."
  },
  5: {
    tri: "First Trimester",
    fruit: "🫘",
    size: "apple seed",
    baby: "Incredible milestone: the primitive heart begins its first rhythmic beats! Three primary layers of cells are now defining body organ systems.",
    mom: "Morning sickness might begin its onset. Heightened smell reflexes, fatigue, and frequent restroom visits are standard."
  },
  6: {
    tri: "First Trimester",
    fruit: "🫛",
    size: "sweet pea",
    baby: "Ears, eyes, and nostrils are budding. Arm and leg buds extend. The heart beats about 110-120 times a minute.",
    mom: "Nausea and salivary flow may peak. Mood swings, triggered by hormonal changes, might cause emotional swings."
  },
  7: {
    tri: "First Trimester",
    fruit: "🫐",
    size: "blueberry",
    baby: "The tiny brain is generating 100 new brain cells every minute! Tiny hand and foot paddles are beginning to emerge.",
    mom: "Your uterus has doubled in size. Fatigue and food aversions are common, making plain toast or simple foods more appealing."
  },
  8: {
    tri: "First Trimester",
    fruit: "🍒",
    size: "raspberry",
    baby: "Facial elements are sharpening. Tiny fingers and toes are unwebbing. The heart rate peaks at 150-170 beats per minute.",
    mom: "Morning sickness may reach its apex. Increased blood volume makes veins more visible, especially on breasts and legs."
  },
  9: {
    tri: "First Trimester",
    fruit: "🍇",
    size: "grape",
    baby: "Your baby is officially no longer an embryo — they are now a fetus! Essential muscles can twitch, allowing subtle, unseen movements.",
    mom: "Elevated progesterone can relax digestive muscles, prompting early heartburn, bloating, or constipation. Staying hydrated helps."
  },
  10: {
    tri: "First Trimester",
    fruit: "🍓",
    size: "strawberry",
    baby: "Joints can bend! Baby can bend their tiny wrists now. Fingernails and hair follicles emerge. The spine is visible on advanced ultrasound.",
    mom: "For many, nausea slowly begins to stabilize. Your heart pumps faster as total blood supply increases to nourish your womb."
  },
  11: {
    tri: "First Trimester",
    fruit: "🪵",
    size: "fig",
    baby: "Baby is fully active inside their sac, stretching and turning though it is still too early to feel. External ears are completely formed.",
    mom: "The placenta continues to assume hormone production. Bloating may be replaced by a small, firm baby bump starting to emerge."
  },
  12: {
    tri: "First Trimester",
    fruit: "🍋",
    size: "lime",
    baby: "Nail beds develop. Baby starts showing reflexes like sucking thumbs or curling toes. Unique, microscopic fingerprints are now set.",
    mom: "HCG peaks and starts to taper off, usually leading to renewed energy and a big drop in morning nausea. Your uterus moves out of the pelvis."
  },
  13: {
    tri: "First Trimester",
    fruit: "🍋",
    size: "large lemon",
    baby: "Vocal cords begin to form. Bones are starting to harden in the skull and limbs. The kidneys begin generating urine.",
    mom: "This is the final week of the 1st trimester! Your skin may look clearer, and libido may return as fatigue lessens."
  },
  14: {
    tri: "Second Trimester",
    fruit: "🍋",
    size: "nectarine",
    baby: "Welcome to the second trimester! Fine lanugo hair covers the baby’s body for thermal protection. Thyroid hormones are active.",
    mom: "Energy rebounds, and nausea typically recedes. You may feel round ligament pull — brief, sharp twinges in your sides as the uterus grows."
  },
  16: {
    tri: "Second Trimester",
    fruit: "🥑",
    size: "avocado",
    baby: "Baby can hear! Low vibrations from your heart and outer music are audible. Eyes detect light filtering through the abdomen.",
    mom: "Quickening (the first butterfly-like fetal kicks) might be felt between weeks 16-22, particularly for second-time mothers."
  },
  18: {
    tri: "Second Trimester",
    fruit: "🍠",
    size: "sweet potato",
    baby: "Myelin sheathing is wrapping around nerves to coordinate reflexes. A protective waxy coating (vernix caseosa) shields baby's skin.",
    mom: "Your uterus is right below your navel. Heartburn or dry eyes may persist. Sleeping on your side (especially the left side) is recommended."
  },
  20: {
    tri: "Second Trimester",
    fruit: "🍌",
    size: "banana",
    baby: "You are halfway there! The baby’s sensory areas are maturing. Digestion produce meconium (early stool) in the infant's bowels.",
    mom: "A routine anatomy scan takes place around now. You should be gaining weight steadily. Backaches might present due to posture shifts."
  },
  22: {
    tri: "Second Trimester",
    fruit: "🥥",
    size: "coconut",
    baby: "The brain is developing rapidly. Clear eyebrows and lashes are visible. Lungs begin building air sacs.",
    mom: "Belly expands quickly. Keep skin hydrated with natural cocoa butter to comfort stretching skin. Muscle cramps can arise in calf muscles."
  },
  24: {
    tri: "Second Trimester",
    fruit: "Corn",
    size: "ear of corn",
    baby: "Baby reaches the threshold of viability. Lung cells begin making surfactant, a vital substance for filling air sacs after delivery.",
    mom: "A gestational diabetes screening (glucose test) is normally scheduled. Watch for swelling in extreme heat. Keep water nearby."
  },
  26: {
    tri: "Second Trimester",
    fruit: "🥬",
    size: "scallion",
    baby: "The eyes can open and blink! Brainwave recordings display responsiveness to sound, light, and maternal heart rhythms.",
    mom: "Mild practice contractions (Braxton Hicks) may occasionally tighten your belly. These are normal, painless, and irregular."
  },
  28: {
    tri: "Third Trimester",
    fruit: " eggplant",
    size: "eggplant",
    baby: "Entering the final trimester! Baby opens wide, blinks, and can see. Fat layers are filing out to keep them cozy at birth.",
    mom: "You may feel breathless easily as the diaphragm is compressed. Track baby's movements (aim for 10 kicks within 2 hours of resting)."
  },
  30: {
    tri: "Third Trimester",
    fruit: "🥬",
    size: "cabbage",
    baby: "Bone marrow completely takes over red blood cell manufacture. Baby's brain surface shows complex folds.",
    mom: "Insomnia or weird dreams can happen. Warm baths or pregnancy pillows can facilitate sleep posture comfort."
  },
  32: {
    tri: "Third Trimester",
    fruit: "🥥",
    size: "large coconut",
    baby: "The baby is practicing respiratory intake using amniotic fluid. Skin layers are glowing pink and plump due to white fat.",
    mom: "Baby starts pivoting head-down to prep for delivery. Heartburn, back pressure, and frequent urination increase."
  },
  34: {
    tri: "Third Trimester",
    fruit: "🍍",
    size: "pineapple",
    baby: "Immune systems are strengthening as antibodies transfer from mother. Lungs are nearly completely developed.",
    mom: "Colostrum (rich early milk) might leak from your breasts. Swelling in feet is common; elevate your legs when sitting."
  },
  36: {
    tri: "Third Trimester",
    fruit: "🍈",
    size: "cantaloupe",
    baby: "Baby's digest system is ready. The skull remains highly pliable to ease navigation through the birth canal.",
    mom: "You may undergo Group B Strep testing. In addition, the baby may 'drop' lower into your pelvis, enhancing breathing comfort but pelvic pressure."
  },
  38: {
    tri: "Third Trimester",
    fruit: "🍉",
    size: "honeydew",
    baby: "Organ systems are mature and strong. Fetal fat accounts for 15% of body weight. Safe and sound, ready to meet you.",
    mom: "OB checkups happen weekly now. Watch closely for labor signals: regular tightening, rupture of membranes, or loss of mucus plug."
  },
  40: {
    tri: "Third Trimester",
    fruit: "🍉",
    size: "watermelon",
    baby: "Happy due date! Your baby is fully grown, alert, and equipped for the outside world. Average newborns weight 7.5 pounds.",
    mom: "Due date has arrived! Try to relax; only a fraction of babies arrive exactly scheduled. Breathe, walk, and rest."
  }
};

export function getWeekData(w: number): WeekData {
  const ks = Object.keys(WEEK_DETAILS).map(Number).sort((a, b) => a - b);
  let resolved = ks[0];
  for (const k of ks) {
    if (k <= w) resolved = k;
  }
  return WEEK_DETAILS[resolved];
}
