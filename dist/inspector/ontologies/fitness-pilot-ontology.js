/**
 * Semantic clusters inferred autonomously from source/wiki content (no `AGENTS.md` required).
 */
export const FITNESS_PILOT_SEMANTIC_CLUSTERS = [
    {
        id: "medical_rehab_specialist",
        title: "Medical, Biomechanics & Rehab Specialist",
        boundedContext: "Biomechanical Rehab & Injury Prevention",
        keywords: [
            "rehab",
            "prehab",
            "injury",
            "infortuni",
            "medicalcircuitbreaker",
            "circuit_breaker",
            "biomeccanica",
            "joint",
            "pain",
        ],
        regexTriggers: [
            /\bMedicalCircuitBreaker\b/i,
            /\brehab_protocols\b/i,
            /\binjury\b/i,
            /\bcircuit_breaker\b/i,
        ],
        invariants: [
            "Zero esercizi ad alto carico articolare su distretti corporei segnalati come infortunati (MedicalCircuitBreaker attivo).",
            "Ogni sostituzione d'esercizio per infortunio deve rispettare i protocolli biomeccanici in docs/wiki/science/rehab_protocols.md.",
        ],
        microRoleCard: "[RING-2: medical_rehab_specialist] Custode della sicurezza biomeccanica e del MedicalCircuitBreaker. Vieta esercizi incompatibili con infortuni attivi e impone protocolli Rehab/Prehab.",
    },
    {
        id: "nutrition_metabolic_specialist",
        title: "Clinical & Therapeutic Nutrition Specialist",
        boundedContext: "Clinical Nutrition, TDEE & Anti-Inflammatory Recovery",
        keywords: [
            "nutrition",
            "nutrizione",
            "tdee",
            "macro",
            "protein",
            "proteico",
            "collagen",
            "therapeutic_nutrition",
            "weight_kg",
        ],
        regexTriggers: [
            /\bnutrition_protocols\b/i,
            /\btherapeutic_nutrition\b/i,
            /\bTDEE\b/,
            /\bepic2_nutrition_spec\b/i,
        ],
        invariants: [
            "Il calcolo TDEE e dei macronutrienti deve adattarsi dinamicamente al carico del workout giornaliero e allo stato di infortunio.",
            "Preservare il target proteico anti-catabolico durante le fasi di Recovery Mode documentate in docs/wiki/science/nutrition_protocols.md.",
        ],
        microRoleCard: "[RING-2: nutrition_metabolic_specialist] Esperto di nutrizione clinica, TDEE dinamico e Nutrient Timing per il recupero muscolare e tendineo.",
    },
    {
        id: "ai_coaching_specialist",
        title: "Adaptive AI Coaching & Workout Recommendation Specialist",
        boundedContext: "Adaptive AI Workout Generation & Intra-Workout RPE",
        keywords: [
            "workoutgenerator",
            "decision_engine",
            "recommendation_algorithm",
            "rpe",
            "bandit",
            "workout",
            "coaching",
            "epic3_training_ai_spec",
        ],
        regexTriggers: [
            /\bWorkoutGenerator\b/i,
            /\bdecision_engine\b/i,
            /\brecommendation_algorithm\b/i,
            /\bRPE\b/,
        ],
        invariants: [
            "Il motore AI (WorkoutGenerator / decision_engine.py) deve sempre invocare il filtro infortuni prima di restituire qualsiasi piano di allenamento.",
            "Il micro-adattamento intra-workout deve fornire regressioni deterministiche basate sul feedback RPE dell'utente.",
        ],
        microRoleCard: "[RING-2: ai_coaching_specialist] Architetto del motore adattivo di allenamento (Decision Trees + RL) e calibrazione RPE intra/post-workout.",
    },
];
/**
 * Preserved-role mappings for a brownfield repo whose `AGENTS.md` already declares
 * the legacy `medical_manager` / `nutrition_manager` / `ai_manager` agents.
 */
export const FITNESS_PILOT_PRESERVED_MAPPINGS = [
    {
        triggerRegex: /\bmedical_manager\b/i,
        id: "medical_rehab_specialist",
        title: "Medical & Biomechanical Rehab Specialist (medical_manager)",
        boundedContext: "Biomechanical Rehab & Injury Prevention",
        scopeFilterRegex: /rehab|circuit_breaker|decision_engine|science/i,
        fallbackScope: ["docs/wiki/science/rehab_protocols.md"],
        domainKeywords: [
            "rehab",
            "prehab",
            "injury",
            "medical_manager",
            "medicalcircuitbreaker",
            "circuit_breaker",
        ],
        domainInvariants: [
            "Escludere deterministicamente esercizi incompatibili con infortuni attivi tramite MedicalCircuitBreaker.",
            "Validare ogni modifica algoritmica contro docs/wiki/science/rehab_protocols.md.",
        ],
        microRoleCard: "[RING-2: medical_rehab_specialist] Presidio medico-biomeccanico e validazione MedicalCircuitBreaker su infortuni e riabilitazione.",
    },
    {
        triggerRegex: /\bnutrition_manager\b/i,
        id: "nutrition_metabolic_specialist",
        title: "Clinical & Therapeutic Nutrition Specialist (nutrition_manager)",
        boundedContext: "Clinical Nutrition, TDEE & Anti-Inflammatory Recovery",
        scopeFilterRegex: /nutrition|epic2/i,
        fallbackScope: ["docs/wiki/science/nutrition_protocols.md"],
        domainKeywords: [
            "nutrition",
            "nutrition_manager",
            "tdee",
            "macro",
            "therapeutic_nutrition",
        ],
        domainInvariants: [
            "Calibrare TDEE e macronutrienti in base al carico di allenamento e allo stato infiammatorio/infortunio.",
        ],
        microRoleCard: "[RING-2: nutrition_metabolic_specialist] Presidio nutrizionale clinico, TDEE adattivo e Nutrient Timing.",
    },
    {
        triggerRegex: /\bai_manager\b/i,
        id: "ai_coaching_specialist",
        title: "Adaptive AI & Workout Recommendation Specialist (ai_manager)",
        boundedContext: "Adaptive AI Workout Generation & Intra-Workout RPE",
        scopeFilterRegex: /src\/ai|recommendation_algorithm|epic3|ai_algorithms/i,
        fallbackScope: ["src/ai/decision_engine.py"],
        domainKeywords: [
            "ai_manager",
            "workoutgenerator",
            "decision_engine",
            "recommendation_algorithm",
            "rpe",
        ],
        domainInvariants: [
            "Garantire che WorkoutGenerator rispetti i vincoli MedicalCircuitBreaker e adatti il piano in base all'RPE.",
        ],
        microRoleCard: "[RING-2: ai_coaching_specialist] Responsabile di WorkoutGenerator, Decision Trees + RL e micro-adattamento RPE.",
    },
];
//# sourceMappingURL=fitness-pilot-ontology.js.map