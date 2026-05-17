export type Topic = { name: string; points: string[] };
export type Section = {
  id: string;
  num: number;
  title: string;
  core: Topic[];
  special: Topic[];
};

export const syllabus: Section[] = [
  {
    id: "aptitude",
    num: 0,
    title: "General Aptitude",
    core: [
      {
        name: "Verbal Aptitude",
        points: [
          "Basic English grammar: tenses, articles, adjectives, prepositions",
          "Conjunctions, verb-noun agreement, word order",
          "Vocabulary: meaning, context, antonyms, synonyms",
          "Reading & comprehension, narrative sequencing",
        ],
      },
      {
        name: "Quantitative Aptitude",
        points: [
          "Data interpretation: tables, graphs (bar, pie, line)",
          "2/3-D plots, maps",
          "Numerical computation & estimation",
          "Ratios, percentages, powers, exponents, logarithms",
          "Permutations & combinations, series",
          "Mensuration & geometry, elementary statistics & probability",
        ],
      },
      {
        name: "Analytical Aptitude",
        points: [
          "Logic: deduction and induction",
          "Analogy, numerical relations & reasoning",
        ],
      },
      {
        name: "Spatial Aptitude",
        points: [
          "Transformation of shapes: translation, rotation, scaling",
          "Mirroring, assembling, grouping",
          "Paper folding, cutting, patterns in 2D and 3D",
        ],
      },
    ],
    special: [],
  },
  {
    id: "math",
    num: 1,
    title: "Engineering Mathematics",
    core: [
      {
        name: "Linear Algebra",
        points: [
          "Vector algebra",
          "Matrix algebra",
          "Systems of linear equations",
          "Rank of a matrix",
          "Eigenvalues and eigenvectors",
        ],
      },
      {
        name: "Calculus",
        points: [
          "Functions of single variable, limits, continuity, differentiability",
          "Mean value theorem, chain rule",
          "Partial derivatives, maxima and minima",
          "Gradient, divergence, curl, directional derivatives",
          "Integration: line, surface, volume integrals",
          "Stokes, Gauss, Green theorems",
        ],
      },
      {
        name: "Differential Equations",
        points: [
          "First order linear and nonlinear ODEs",
          "Higher order linear ODEs with constant coefficients",
          "PDEs and separation of variables",
        ],
      },
    ],
    special: [
      {
        name: "Special",
        points: [
          "Fourier Series",
          "Laplace Transforms",
          "Numerical methods (linear & nonlinear algebraic eqs)",
          "Numerical integration and differentiation",
          "Complex analysis",
          "Probability and statistics",
        ],
      },
    ],
  },
  {
    id: "flight",
    num: 2,
    title: "Flight Mechanics",
    core: [
      {
        name: "Basics",
        points: [
          "Atmosphere: properties, standard atmosphere",
          "Aircraft classification, airplane configuration & parts",
          "Pressure altitude; EAS, CAS, IAS",
          "Primary flight instruments: altimeter, ASI, VSI, turn-bank",
          "AoA, sideslip; roll, pitch, yaw controls",
          "Aerodynamic forces and moments",
        ],
      },
      {
        name: "Airplane performance",
        points: [
          "Drag polar; take-off and landing",
          "Steady climb and descent; absolute & service ceiling",
          "Range and endurance, load factor, turning flight",
          "V-n diagram",
          "Head, tail, cross winds",
        ],
      },
      {
        name: "Static stability",
        points: [
          "Stability and control derivatives",
          "Longitudinal stick fixed & free stability",
          "Horizontal tail position and size",
          "Directional stability, vertical tail position & size",
          "Lateral stability: dihedral, sweep, position",
          "Hinge moments, stick forces",
        ],
      },
    ],
    special: [
      {
        name: "Dynamic stability",
        points: [
          "Euler angles; equations of motion",
          "Decoupling of longitudinal and lateral-directional dynamics",
          "Longitudinal modes; lateral-directional modes",
        ],
      },
    ],
  },
  {
    id: "space",
    num: 3,
    title: "Space Dynamics",
    core: [
      {
        name: "Orbital mechanics",
        points: [
          "Central force motion",
          "Trajectory and orbital period (simple cases)",
          "Kepler's laws",
          "Escape velocity",
        ],
      },
    ],
    special: [],
  },
  {
    id: "aero",
    num: 4,
    title: "Aerodynamics",
    core: [
      {
        name: "Basic Fluid Mechanics",
        points: [
          "Conservation laws: mass, momentum, energy (integral & differential)",
          "Dimensional analysis and dynamic similarity",
        ],
      },
      {
        name: "Potential flow theory",
        points: [
          "Sources, sinks, doublets, line vortex and superposition",
          "Elementary viscous flows including boundary layers",
        ],
      },
      {
        name: "Airfoils and wings",
        points: [
          "Airfoil nomenclature",
          "Lift, drag, moment coefficients",
          "Kutta-Joukowski theorem",
          "Thin airfoil theory, Kutta condition, starting vortex",
          "Finite wing theory: induced drag, Prandtl lifting line",
          "Critical and drag divergence Mach number",
        ],
      },
      {
        name: "Compressible Flows",
        points: [
          "Basic compressibility concepts",
          "1D compressible flows, isentropic flows",
          "Fanno flow, Rayleigh flow",
          "Normal and oblique shocks, Prandtl-Meyer flow",
          "Flow through nozzles and diffusers",
        ],
      },
    ],
    special: [
      {
        name: "Special",
        points: [
          "Wind tunnel testing: measurement & visualization",
          "Shock-boundary layer interaction",
        ],
      },
    ],
  },
  {
    id: "structures",
    num: 5,
    title: "Structures",
    core: [
      {
        name: "Strength of Materials",
        points: [
          "Stress & strain: 3D transformations, Mohr's circle, principal stresses",
          "3D Hooke's law, plane stress & strain",
          "Failure theories: Max stress, Tresca, von Mises",
          "Strain energy, Castigliano's principles",
          "Statically determinate & indeterminate trusses and beams",
          "Elastic flexural buckling of columns",
        ],
      },
      {
        name: "Flight vehicle structures",
        points: [
          "Aircraft structures & materials",
          "Torsion, bending, shear of thin-walled sections",
          "Loads on aircraft",
        ],
      },
      {
        name: "Structural Dynamics",
        points: [
          "Free & forced vibrations of undamped/damped SDOF",
          "Free vibrations of undamped 2-DOF systems",
        ],
      },
    ],
    special: [
      {
        name: "Special",
        points: [
          "Vibration of beams",
          "Theory of elasticity: equilibrium & compatibility equations",
          "Airy's stress function",
        ],
      },
    ],
  },
  {
    id: "propulsion",
    num: 6,
    title: "Propulsion",
    core: [
      {
        name: "Basics",
        points: [
          "Thermodynamics, boundary layers, heat transfer",
          "Combustion and thermochemistry",
        ],
      },
      {
        name: "Aerothermodynamics of aircraft engines",
        points: ["Thrust, efficiency, range", "Brayton cycle"],
      },
      {
        name: "Engine performance",
        points: [
          "Ramjet, turbojet, turbofan, turboprop, turboshaft",
          "Afterburners",
        ],
      },
      {
        name: "Turbomachinery",
        points: [
          "Axial compressors: angular momentum, work, compression",
          "Single stage performance, efficiency, degree of reaction, multi-staging",
          "Centrifugal compressor: inducer, impeller, diffuser",
          "Axial turbines: stage performance",
        ],
      },
      {
        name: "Rockets",
        points: [
          "Thrust equation, specific impulse",
          "Rocket performance, multi-staging",
          "Chemical rockets: solid & liquid propellant performance",
        ],
      },
    ],
    special: [
      {
        name: "Special",
        points: [
          "Aerothermodynamics of intakes, combustor, nozzle",
          "Turbine blade cooling",
          "Compressor-turbine matching, surge and stall",
        ],
      },
    ],
  },
];
