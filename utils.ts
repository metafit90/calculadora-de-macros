
import {
  ActivityLevel,
  CalculationResult,
  DietHistory,
  Discipline,
  Gender,
  Goal,
  MacroResult,
  MealPlan,
  ProfileResult,
  TrainingTime,
  UserData,
} from './types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  [ActivityLevel.Sedentary]: 1.2,
  [ActivityLevel.LightlyActive]: 1.375,
  [ActivityLevel.ModeratelyActive]: 1.55,
  [ActivityLevel.VeryActive]: 1.725,
  [ActivityLevel.ExtremelyActive]: 1.9,
};

const PROTEIN_MULTIPLIERS: Record<Goal, number> = {
  [Goal.LoseWeight]: 2.2,
  [Goal.Maintain]: 1.8,
  [Goal.GainMuscle]: 2.0,
};

const FAT_MULTIPLIER = 0.8;

const formatQty = (baseQty: number, currentCals: number, unit: string) => {
  const factor = currentCals / 2000;
  let qty = baseQty * factor;

  if (unit === 'fatias' || unit === 'ovos' || unit === 'unid' || unit === 'colheres') {
     qty = Math.round(qty * 2) / 2;
     if (qty < 0.5) qty = 0.5;
  } else {
     qty = Math.round(qty / 10) * 10;
     if (qty < 10) qty = 10;
  }
  return `${qty.toString().replace('.', ',')} ${unit}`;
};

const generateMealPlans = (calories: number): MealPlan[] => [
  {
    name: "Opção 1: O Clássico Brasileiro",
    description: "Arroz, feijão e proteína magra. O básico que funciona.",
    meals: {
      breakfast: { title: "Café da Manhã", items: [`${formatQty(2, calories, 'ovos')} mexidos`, `${formatQty(2, calories, 'fatias')} de pão integral`, "Café s/ açúcar"] },
      lunch: { title: "Almoço", items: [`${formatQty(150, calories, 'g')} de arroz`, `${formatQty(100, calories, 'g')} de feijão`, `${formatQty(130, calories, 'g')} de frango`, "Salada livre"] },
      snack: { title: "Lanche", items: [`${formatQty(170, calories, 'g')} de iogurte`, `${formatQty(30, calories, 'g')} de aveia`, "1 Fruta"] },
      dinner: { title: "Jantar", items: [`${formatQty(100, calories, 'g')} de batata`, `${formatQty(130, calories, 'g')} de carne ou peixe`, "Legumes cozidos"] }
    }
  },
  {
    name: "Opção 2: Econômico & Raízes",
    description: "Foco em tubérculos e ovos. Ótimo custo-benefício.",
    meals: {
      breakfast: { title: "Café da Manhã", items: [`${formatQty(100, calories, 'g')} de cuscuz`, `${formatQty(2, calories, 'ovos')}`, "Fruta"] },
      lunch: { title: "Almoço", items: [`${formatQty(200, calories, 'g')} de mandioca ou batata`, `${formatQty(130, calories, 'g')} de peito de frango`, "Refogado de legumes"] },
      snack: { title: "Lanche", items: [`${formatQty(2, calories, 'fatias')} de pão`, "Ovo ou Pasta de frango", "Café"] },
      dinner: { title: "Jantar", items: ["Omelete de 3 ovos com tomate", `${formatQty(120, calories, 'g')} de vegetais`, "1 Fruta pequena"] }
    }
  },
  {
    name: "Opção 3: Praticidade Máxima",
    description: "Para rotinas corridas. Sanduíches e shakes nutritivos.",
    meals: {
      breakfast: { title: "Café da Manhã", items: ["Vitamina: Leite desnatado + Aveia + Fruta", "2 Ovos cozidos"] },
      lunch: { title: "Almoço", items: [`${formatQty(130, calories, 'g')} de macarrão`, `${formatQty(120, calories, 'g')} de carne moída`, "Cenoura ralada"] },
      snack: { title: "Lanche", items: ["Sanduíche natural: Frango + Ricota + Pão integral", "Folhas"] },
      dinner: { title: "Jantar", items: ["Wrap de tortilha integral", "Frango em cubos e salada dentro", "Molho de iogurte"] }
    }
  }
];

export const calculateMacros = (data: UserData): CalculationResult => {
  let bmr: number;
  let formulaUsed: 'Mifflin-St Jeor' | 'Katch-McArdle';

  if (data.bodyFat && data.bodyFat > 0) {
    formulaUsed = 'Katch-McArdle';
    bmr = 370 + (21.6 * (data.weight * (1 - data.bodyFat / 100)));
  } else {
    formulaUsed = 'Mifflin-St Jeor';
    bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + (data.gender === Gender.Male ? 5 : -161);
  }

  const tdee = bmr * ACTIVITY_MULTIPLIERS[data.activityLevel];
  const targetCalories = Math.round(data.goal === Goal.LoseWeight ? tdee - (data.weeklyRate * 7700 / 7) : data.goal === Goal.GainMuscle ? tdee + (data.weeklyRate * 7700 / 7) : tdee);

  const proteinGrams = Math.round(data.weight * PROTEIN_MULTIPLIERS[data.goal]);
  const fatGrams = Math.round(data.weight * FAT_MULTIPLIER);
  const carbsGrams = Math.max(0, Math.round((targetCalories - (proteinGrams * 4 + fatGrams * 9)) / 4));

  const pPerc = Math.round((proteinGrams * 4 / targetCalories) * 100);
  const cPerc = Math.round((carbsGrams * 4 / targetCalories) * 100);
  const fPerc = 100 - pPerc - cPerc;

  return {
    macros: { calories: targetCalories, protein: proteinGrams, fat: fatGrams, carbs: carbsGrams, proteinPerc: pPerc, carbsPerc: cPerc, fatPerc: fPerc, formulaUsed, weeksToGoal: data.targetWeight ? Math.ceil(Math.abs(data.targetWeight - data.weight) / data.weeklyRate) : 0 },
    mealPlans: generateMealPlans(targetCalories),
    profile: determineProfile(data)
  };
};

export const determineProfile = (data: UserData): ProfileResult => {
  if (data.discipline === Discipline.High) return { profileName: 'Alta Performance', description: 'Foco total e disciplina rigorosa.', advice: 'Siga o plano à risca. Sua consistência é sua maior arma.' };
  if (data.discipline === Discipline.Medium) return { profileName: 'Equilibrado', description: 'Busca resultados sem abrir mão do social.', advice: 'Planeje os finais de semana para não sabotar o progresso da semana.' };
  return { profileName: 'Iniciante Consciente', description: 'Começando agora com foco em saúde.', advice: 'Não busque perfeição, busque constância. Se errar, apenas volte na próxima refeição.' };
};
