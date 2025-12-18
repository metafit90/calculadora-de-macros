
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

// Mifflin-St Jeor Constants
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  [ActivityLevel.Sedentary]: 1.2,
  [ActivityLevel.LightlyActive]: 1.375,
  [ActivityLevel.ModeratelyActive]: 1.55,
  [ActivityLevel.VeryActive]: 1.725,
  [ActivityLevel.ExtremelyActive]: 1.9,
};

const PROTEIN_MULTIPLIERS: Record<Goal, number> = {
  [Goal.LoseWeight]: 2.0,
  [Goal.Maintain]: 1.8,
  [Goal.GainMuscle]: 2.2,
};

const FAT_MULTIPLIER = 0.8; // g/kg

// Helper to format quantity based on calorie scaling
// Base reference is approx 2000 kcal
const formatQty = (baseQty: number, currentCals: number, unit: string, isSolid: boolean = true) => {
  const factor = currentCals / 2000;
  let qty = baseQty * factor;

  // Rounding logic
  if (unit === 'fatias' || unit === 'ovos' || unit === 'unid' || unit === 'colheres') {
     // Round to nearest 0.5
     qty = Math.round(qty * 2) / 2;
     if (qty < 0.5) qty = 0.5;
  } else {
     // Round to nearest 5 or 10g
     qty = Math.round(qty / 10) * 10;
     if (qty < 10) qty = 10;
  }
  
  // Format string
  const qtyStr = qty.toString().replace('.', ',');
  return `${qtyStr} ${unit}`;
};

const generateMealPlans = (calories: number): MealPlan[] => {
  return [
    {
      name: "Opção 1: O Clássico Brasileiro",
      description: "Arroz, feijão e comida de verdade. Acessível e fácil de manter.",
      meals: {
        breakfast: {
          title: "Café da Manhã",
          items: [
            `${formatQty(2, calories, 'ovos')} mexidos ou cozidos`,
            `${formatQty(2, calories, 'fatias')} de pão integral ou francês (sem miolo)`,
            `${formatQty(1, calories, 'unid')} fruta média (banana/maçã)`,
            "Café preto ou chá (sem açúcar)"
          ]
        },
        lunch: {
          title: "Almoço",
          items: [
            `${formatQty(150, calories, 'g')} de arroz branco ou integral (cozido)`,
            `${formatQty(100, calories, 'g')} de feijão (cozido)`,
            `${formatQty(120, calories, 'g')} de frango grelhado ou carne moída magra`,
            "Salada de folhas verdes à vontade (alface, rúcula)",
            "1 colher (sopa) de azeite de oliva"
          ]
        },
        snack: {
          title: "Lanche da Tarde",
          items: [
            `${formatQty(170, calories, 'g')} de iogurte natural ou desnatado`,
            `${formatQty(30, calories, 'g')} de aveia em flocos`,
            `${formatQty(1, calories, 'unid')} fruta (ex: mamão ou melão)`
          ]
        },
        dinner: {
          title: "Jantar",
          items: [
            "Mesma base do almoço (pode reduzir o arroz pela metade se preferir)",
            "OU: Omelete com legumes (tomate, espinafre)",
            `${formatQty(120, calories, 'g')} de proteína magra`,
            "Vegetais cozidos (brócolis, cenoura)"
          ]
        }
      }
    },
    {
      name: "Opção 2: Prático e Econômico",
      description: "Foco em alimentos baratos como ovos, raízes e frango.",
      meals: {
        breakfast: {
          title: "Café da Manhã",
          items: [
            `${formatQty(80, calories, 'g')} de tapioca ou cuscuz hidratado`,
            `${formatQty(2, calories, 'ovos')} mexidos`,
            "1 fatia de queijo branco ou minas",
            "Café preto"
          ]
        },
        lunch: {
          title: "Almoço",
          items: [
            `${formatQty(200, calories, 'g')} de batata inglesa ou doce cozida/assada`,
            `${formatQty(120, calories, 'g')} de filé de frango ou sardinha`,
            "Vegetais refogados (abobrinha, berinjela)",
            "Salada crua à vontade"
          ]
        },
        snack: {
          title: "Lanche da Tarde",
          items: [
            `${formatQty(2, calories, 'fatias')} de pão de forma`,
            "Pasta de amendoim ou requeijão light",
            "1 fruta prática (banana)"
          ]
        },
        dinner: {
          title: "Jantar",
          items: [
            "Sopa de legumes com frango desfiado",
            `OU: ${formatQty(150, calories, 'g')} de batata cozida`,
            `${formatQty(3, calories, 'ovos')} cozidos ou mexidos`,
            "Salada de tomate e pepino"
          ]
        }
      }
    },
    {
      name: "Opção 3: Rápido (Marmita Friendly)",
      description: "Para quem tem pouco tempo. Sanduíches e massas práticas.",
      meals: {
        breakfast: {
          title: "Café da Manhã",
          items: [
            "Vitamina: Leite desnatado ou vegetal",
            `${formatQty(1, calories, 'unid')} banana congelada`,
            `${formatQty(30, calories, 'g')} de whey protein ou leite em pó`,
            `${formatQty(20, calories, 'g')} de aveia`
          ]
        },
        lunch: {
          title: "Almoço",
          items: [
            `${formatQty(120, calories, 'g')} de macarrão (peso cozido)`,
            `${formatQty(120, calories, 'g')} de carne moída (molho bolonhesa magro)`,
            "Vegetais misturados ao molho (cenoura ralada, tomate)",
            "1 colher de queijo parmesão ralado"
          ]
        },
        snack: {
          title: "Lanche da Tarde",
          items: [
            "Sanduíche natural:",
            `${formatQty(2, calories, 'fatias')} de pão integral`,
            "Pasta de atum ou frango desfiado com ricota",
            "Alface e tomate"
          ]
        },
        dinner: {
          title: "Jantar",
          items: [
            "Wrap (massa de tortilha integral ou pão sírio)",
            "Recheio: Frango em cubos, alface, tomate, cenoura",
            "Molho de iogurte com mostarda",
            "1 Fruta de sobremesa"
          ]
        }
      }
    }
  ];
};

export const calculateMacros = (data: UserData): CalculationResult => { // Changed return type
  let bmr: number;
  let formulaUsed: 'Mifflin-St Jeor' | 'Katch-McArdle';

  // 1. Calculate BMR
  if (data.bodyFat && data.bodyFat > 0) {
    formulaUsed = 'Katch-McArdle';
    const leanBodyMass = data.weight * (1 - data.bodyFat / 100);
    bmr = 370 + (21.6 * leanBodyMass);
  } else {
    formulaUsed = 'Mifflin-St Jeor';
    bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age;
    if (data.gender === Gender.Male) {
      bmr += 5;
    } else {
      bmr -= 161;
    }
  }

  // 2. Calculate TDEE
  const tdee = bmr * ACTIVITY_MULTIPLIERS[data.activityLevel];

  // 3. Adjust for Goal based on Weekly Rate
  const weeklyCalorieDiff = data.weeklyRate * 7700;
  const dailyCalorieDiff = Math.round(weeklyCalorieDiff / 7);

  let targetCalories = tdee;

  if (data.goal === Goal.LoseWeight) {
    targetCalories = tdee - dailyCalorieDiff;
    if (targetCalories < 1000) targetCalories = 1000; 
  } else if (data.goal === Goal.GainMuscle) {
    targetCalories = tdee + dailyCalorieDiff;
  }
  targetCalories = Math.round(targetCalories);

  // 4. Calculate Weeks to Goal
  let weeksToGoal = 0;
  if (data.targetWeight && data.goal !== Goal.Maintain && data.weeklyRate > 0) {
      const diff = Math.abs(data.targetWeight - data.weight);
      weeksToGoal = Math.ceil(diff / data.weeklyRate);
  }

  // 5. Calculate Macros
  const proteinGrams = Math.round(data.weight * PROTEIN_MULTIPLIERS[data.goal]);
  const proteinCals = proteinGrams * 4;

  const fatGrams = Math.round(data.weight * FAT_MULTIPLIER);
  const fatCals = fatGrams * 9;

  let remainingCals = targetCalories - (proteinCals + fatCals);
  if (remainingCals < 0) remainingCals = 0;
  
  const carbsGrams = Math.round(remainingCals / 4);

  const macros: MacroResult = {
    calories: targetCalories,
    protein: proteinGrams,
    fat: fatGrams,
    carbs: carbsGrams,
    formulaUsed,
    weeksToGoal,
  };

  const mealPlans = generateMealPlans(targetCalories);

  // Profile determination is technically separate but we bundle result now
  // We will call determineProfile inside the component or here. 
  // Refactoring slightly to match previous pattern: 
  // determineProfile is separate in utils, but App.tsx calls both.
  // BUT the calculateMacros function signature in App.tsx expected MacroResult.
  // I updated the return type here to CalculationResult (bundling it), 
  // so I should remove the profile call from App.tsx or include it here.
  // To keep changes minimal in App.tsx logic, let's just return macros here 
  // AND generate plans in App.tsx? No, better to encapsulate here.
  
  // Wait, determineProfile needs UserData. 
  // Let's stick to returning EVERYTHING in calculateMacros or just add generateMealPlans to export.
  
  // Revised approach for minimal code break:
  // I'll keep determineProfile exported.
  // I will make calculateMacros return just macros + plans? 
  // Let's make calculateMacros return { macros, mealPlans } and let App handle profile.
  
  return {
    macros,
    mealPlans,
    profile: determineProfile(data) // Now we bundle it all
  };
};

export const determineProfile = (data: UserData): ProfileResult => {
  const { discipline, dietHistory, trainingTime } = data;

  let profileName = '';
  let description = '';
  let advice = '';

  // Profile Logic
  if (discipline === Discipline.High) {
    profileName = 'Alta Performance Sustentável';
    description = 'Você possui a mentalidade necessária para seguir planos com rigor. Sua capacidade de execução é seu maior trunfo, permitindo estratégias mais precisas e resultados acelerados.';
  } else if (discipline === Discipline.Medium) {
    if (dietHistory === DietHistory.Many) {
        profileName = 'Inconsistente Estratégico';
        description = 'Você sabe o que fazer, mas o histórico de muitas tentativas gera um ciclo de "tudo ou nada". O foco agora não é perfeição, mas evitar a desistência total nos dias difíceis.';
    } else {
        profileName = 'Comprometido em Evolução';
        description = 'Você tem boa intenção e oscila dentro do esperado. Seu caminho para o sucesso é transformar a motivação pontual em hábitos automáticos, reduzindo a necessidade de força de vontade.';
    }
  } else {
    // Low discipline
    if (dietHistory === DietHistory.None || dietHistory === DietHistory.Few) {
        profileName = 'Iniciante Emocional';
        description = 'Tudo é novidade e suas emoções influenciam muito suas escolhas. O segredo é começar devagar, celebrando pequenas vitórias em vez de buscar o corpo perfeito em um mês.';
    } else {
        profileName = 'Inconsistente Estratégico';
        description = 'Você já tentou muito e está cansado. Sua disciplina falha porque você provavelmente tenta métodos insustentáveis. Vamos focar no "feito é melhor que perfeito".';
    }
  }

  // Behavioral Adjustment Advice
  if (discipline === Discipline.Low || dietHistory === DietHistory.Many) {
    advice = 'Priorize a consistência acima da perfeição. Se errar uma refeição, volte na próxima. Evite restrições extremas que geram compulsão. O sucesso virá de não desistir nos dias ruins.';
  } else if (discipline === Discipline.High) {
    advice = 'Seu potencial de resultado é alto. Aproveite sua disciplina para treinar com intensidade e monitorar seu progresso. Cuidado apenas para não ser rígido demais; a flexibilidade garante a longo prazo.';
  } else {
    advice = 'Você está no caminho certo. O segredo agora é transformar sua rotina em hábito automático. Planeje suas refeições com antecedência para evitar decisões impulsivas quando estiver cansado.';
  }
  
  if (trainingTime === TrainingTime.Under30 || trainingTime === TrainingTime.Between30And45) {
     advice += ' Como seu tempo é curto, a intensidade do treino e a aderência à dieta serão seus maiores aliados. Resultados vêm da constância, não de horas na academia.';
  }

  return {
    profileName,
    description,
    advice,
  };
};
