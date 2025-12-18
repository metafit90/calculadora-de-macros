
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { jsPDF } from "jspdf";
import { ActivityLevel, CalculationResult, DietHistory, Discipline, Gender, Goal, TrainingTime, UserData } from './types';
import { calculateMacros } from './utils'; // calculateMacros now returns everything
import { InputField, PrimaryButton, SelectionCard } from './components/StepWizard';
import { Activity, Target, Brain, Flame, Utensils, Zap, TrendingUp, ChevronDown, ChevronUp, Ruler, Download, Scale, Calendar, User, Coffee, Sun, Sunset, Moon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- Constants ---
const ACTIVITY_OPTIONS = [
  { value: ActivityLevel.Sedentary, label: 'Sedentário', desc: 'Trabalho de escritório, pouco exercício.' },
  { value: ActivityLevel.LightlyActive, label: 'Levemente Ativo', desc: 'Treino leve 1-3 dias/semana.' },
  { value: ActivityLevel.ModeratelyActive, label: 'Moderadamente Ativo', desc: 'Treino moderado 3-5 dias/semana.' },
  { value: ActivityLevel.VeryActive, label: 'Muito Ativo', desc: 'Treino pesado 6-7 dias/semana.' },
  { value: ActivityLevel.ExtremelyActive, label: 'Extremamente Ativo', desc: 'Trabalho físico pesado ou atleta.' },
];

const GOAL_OPTIONS = [
  { value: Goal.LoseWeight, label: 'Emagrecer', desc: 'Perder gordura de forma saudável.' },
  { value: Goal.Maintain, label: 'Manter Peso', desc: 'Manter a composição corporal atual.' },
  { value: Goal.GainMuscle, label: 'Ganhar Massa', desc: 'Hipertrofia e ganho de força.' },
];

const TIME_OPTIONS = [
  { value: TrainingTime.Under30, label: 'Menos de 30 min', desc: 'Treinos curtos e intensos.' },
  { value: TrainingTime.Between30And45, label: '30 a 45 min', desc: 'Tempo moderado.' },
  { value: TrainingTime.Between45And60, label: '45 a 60 min', desc: 'Treino padrão.' },
  { value: TrainingTime.Over60, label: 'Mais de 60 min', desc: 'Disponibilidade alta.' },
];

const DISCIPLINE_OPTIONS = [
  { value: Discipline.Low, label: 'Baixa', desc: 'Começo empolgado e paro logo.' },
  { value: Discipline.Medium, label: 'Média', desc: 'Oscilo, mas tento voltar.' },
  { value: Discipline.High, label: 'Alta', desc: 'Sigo o plano mesmo sem vontade.' },
];

const HISTORY_OPTIONS = [
  { value: DietHistory.None, label: 'Nenhuma', desc: 'Primeira vez tentando algo sério.' },
  { value: DietHistory.Few, label: '1 a 2', desc: 'Algumas experiências passadas.' },
  { value: DietHistory.Some, label: '3 a 5', desc: 'Já tentei várias abordagens.' },
  { value: DietHistory.Many, label: 'Mais de 5', desc: 'Vivo em efeito sanfona.' },
];

// --- Main Component ---
const App = () => {
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [activePlan, setActivePlan] = useState(0); // For toggling meal plans
  const topRef = useRef<HTMLDivElement>(null);
  
  // Toggle for advanced fields
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [formData, setFormData] = useState<UserData>({
    name: '',
    gender: Gender.Male,
    age: 30,
    height: 175,
    weight: 80,
    targetWeight: undefined,
    weeklyRate: 0.5, // default 0.5kg
    activityLevel: ActivityLevel.ModeratelyActive,
    goal: Goal.LoseWeight,
    trainingTime: TrainingTime.Between45And60,
    discipline: Discipline.Medium,
    dietHistory: DietHistory.Some,
    bodyFat: undefined,
    waist: undefined,
    neck: undefined,
    hip: undefined,
  });

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [step]);

  const updateField = (field: keyof UserData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 3) {
      // Logic updated: calculateMacros now returns everything including profile and meal plans
      const fullResult = calculateMacros(formData);
      setResult(fullResult);
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleDownload = () => {
    if (!result) return;

    const activityLabel = ACTIVITY_OPTIONS.find(o => o.value === formData.activityLevel)?.label;
    const goalLabel = GOAL_OPTIONS.find(o => o.value === formData.goal)?.label;
    const dateStr = new Date().toLocaleDateString('pt-BR');

    // Calculate Percentages for PDF
    const totalCals = result.macros.calories;
    const pPerc = Math.round((result.macros.protein * 4 / totalCals) * 100);
    const cPerc = Math.round((result.macros.carbs * 4 / totalCals) * 100);
    const fPerc = 100 - pPerc - cPerc;

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = 20;

    // Colors
    const colorEmerald = [5, 150, 105]; // Emerald 600
    const colorSlate = [30, 41, 59];    // Slate 800
    const colorGray = [100, 116, 139];  // Slate 500

    // --- PAGE 1: MACROS & STRATEGY ---
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
    doc.text("EDUCA", pageWidth / 2, yPos, { align: "center" });
    const textWidth = doc.getTextWidth("EDUCA");
    doc.setTextColor(colorEmerald[0], colorEmerald[1], colorEmerald[2]);
    doc.text("FÍSICO", (pageWidth / 2) + (textWidth/2) - 2, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
    doc.text(`Data do cálculo: ${dateStr}`, pageWidth / 2, yPos, { align: "center" });

    yPos += 15;
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // Profile info box
    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
    doc.text(`Aluno: ${formData.name}`, margin, yPos);
    
    yPos += 8;
    doc.setFontSize(12);
    if(result.macros.weeksToGoal && result.macros.weeksToGoal > 0) {
        doc.text(`Meta: ${goalLabel} - Estimativa: ${result.macros.weeksToGoal} semanas`, margin, yPos);
    } else {
        doc.text(`Meta: ${goalLabel}`, margin, yPos);
    }
    
    // Profile Section
    yPos += 15;
    doc.setFontSize(16);
    doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
    doc.text("PERFIL COMPORTAMENTAL", margin, yPos);
    
    yPos += 10;
    doc.setFontSize(14);
    doc.setTextColor(colorEmerald[0], colorEmerald[1], colorEmerald[2]);
    doc.text(result.profile.profileName, margin, yPos);

    yPos += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
    const splitDesc = doc.splitTextToSize(result.profile.description, pageWidth - (margin * 2));
    doc.text(splitDesc, margin, yPos);
    yPos += (splitDesc.length * 5) + 5;

    // Advice Box (Background)
    doc.setFillColor(240, 253, 244); // Emerald 50
    doc.rect(margin, yPos, pageWidth - (margin * 2), 35, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(colorEmerald[0], colorEmerald[1], colorEmerald[2]);
    doc.text("CONSELHO ESTRATÉGICO", margin + 5, yPos + 10);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
    const splitAdvice = doc.splitTextToSize(result.profile.advice, pageWidth - (margin * 2) - 10);
    doc.text(splitAdvice, margin + 5, yPos + 18);
    yPos += 50;

    // Macros Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("METAS NUTRICIONAIS", margin, yPos);
    yPos += 15;

    // Calories (Big Display)
    doc.setFontSize(32);
    doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
    doc.text(`${result.macros.calories}`, margin, yPos);
    doc.setFontSize(12);
    doc.setTextColor(colorEmerald[0], colorEmerald[1], colorEmerald[2]);
    doc.text("kcal / dia", margin + 45, yPos);

    // Macros Grid
    yPos += 15;
    const colWidth = (pageWidth - (margin * 2)) / 3;
    
    // Proteína
    doc.setFontSize(10);
    doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
    doc.text("PROTEÍNA", margin, yPos);
    doc.setFontSize(18);
    doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
    doc.text(`${result.macros.protein}g (${pPerc}%)`, margin, yPos + 8);

    // Carbo
    doc.setFontSize(10);
    doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
    doc.text("CARBOIDRATOS", margin + colWidth, yPos);
    doc.setFontSize(18);
    doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
    doc.text(`${result.macros.carbs}g (${cPerc}%)`, margin + colWidth, yPos + 8);

    // Gordura
    doc.setFontSize(10);
    doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
    doc.text("GORDURAS", margin + (colWidth * 2), yPos);
    doc.setFontSize(18);
    doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
    doc.text(`${result.macros.fat}g (${fPerc}%)`, margin + (colWidth * 2), yPos + 8);

    yPos += 25;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // User Data Summary
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DADOS UTILIZADOS", margin, yPos);
    yPos += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
    
    const dataPoints = [
        `Peso Atual: ${formData.weight} kg`,
        `Peso Desejável: ${formData.targetWeight || '-'} kg`,
        `Altura: ${formData.height} cm`,
        `Idade: ${formData.age} anos`,
        `Objetivo: ${goalLabel}`,
        `Ritmo: ${formData.goal === Goal.Maintain ? 'Manutenção' : `${formData.weeklyRate}kg / semana`}`,
        `Nível Ativ.: ${activityLabel}`,
    ];

    dataPoints.forEach((point) => {
        doc.text(`• ${point}`, margin, yPos);
        yPos += 6;
    });

    // Footer Quote Page 1
    yPos = doc.internal.pageSize.getHeight() - 15;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
    doc.text(`Página 1/2`, pageWidth - margin, yPos, { align: "right" });

    // --- PAGE 2: MEAL PLANS ---
    doc.addPage();
    yPos = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
    doc.text("SUGESTÕES DE CARDÁPIO", margin, yPos);
    yPos += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
    doc.text("3 opções adaptadas para sua meta calórica, usando alimentos básicos.", margin, yPos);
    yPos += 15;

    result.mealPlans.forEach((plan, index) => {
        // Check for page break
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
        }

        // Plan Header
        doc.setFillColor(241, 245, 249); // Slate 100
        doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(colorEmerald[0], colorEmerald[1], colorEmerald[2]);
        doc.text(plan.name, margin + 2, yPos + 7);
        yPos += 18;

        // Plan Meals
        doc.setFont("helvetica", "normal");
        doc.setTextColor(colorSlate[0], colorSlate[1], colorSlate[2]);
        doc.setFontSize(10);

        const meals = [plan.meals.breakfast, plan.meals.lunch, plan.meals.snack, plan.meals.dinner];
        
        meals.forEach((meal) => {
             // Subheader (Meal Title)
             doc.setFont("helvetica", "bold");
             doc.text(`• ${meal.title}:`, margin, yPos);
             
             // Items
             doc.setFont("helvetica", "normal");
             const itemsStr = meal.items.join(", ");
             const splitItems = doc.splitTextToSize(itemsStr, pageWidth - (margin * 2) - 35);
             doc.text(splitItems, margin + 35, yPos);
             
             yPos += (splitItems.length * 5) + 4;
        });
        
        yPos += 10; // Spacing between plans
    });

    // Footer Page 2
    yPos = doc.internal.pageSize.getHeight() - 15;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
    doc.text(`"A melhor dieta é aquela que você consegue seguir." - Página 2/2`, pageWidth / 2, yPos, { align: "center" });

    // Save
    doc.save(`EDUCAFISICO_${formData.name.replace(/\s+/g, '_')}_Plano_Completo.pdf`);
  };

  const renderProgressBar = () => (
    <div className="w-full bg-slate-100 h-2 mb-8 mt-2 rounded-full overflow-hidden">
      <div
        className="h-full bg-emerald-500 transition-all duration-500 ease-out"
        style={{ width: `${(step / 4) * 100}%` }}
      />
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Seus Dados Pessoais</h2>
        <p className="text-slate-500">Para começar, precisamos conhecer o básico sobre você.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <InputField
            label="Nome Completo"
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Ex: João da Silva"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SelectionCard
          label="Masculino"
          selected={formData.gender === Gender.Male}
          onClick={() => updateField('gender', Gender.Male)}
        />
        <SelectionCard
          label="Feminino"
          selected={formData.gender === Gender.Female}
          onClick={() => updateField('gender', Gender.Female)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Idade"
          type="number"
          value={formData.age}
          onChange={(e) => updateField('age', Number(e.target.value))}
          placeholder="30"
          unit="anos"
        />
        <InputField
          label="Altura"
          type="number"
          value={formData.height}
          onChange={(e) => updateField('height', Number(e.target.value))}
          placeholder="175"
          unit="cm"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Peso Atual"
          type="number"
          value={formData.weight}
          onChange={(e) => updateField('weight', Number(e.target.value))}
          placeholder="80"
          unit="kg"
        />
        <InputField
          label="Peso Desejável"
          type="number"
          value={formData.targetWeight || ''}
          onChange={(e) => updateField('targetWeight', e.target.value ? Number(e.target.value) : undefined)}
          placeholder="70"
          unit="kg"
        />
      </div>

      {/* Advanced Data Section */}
      <div className="pt-2">
        <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-emerald-700 font-medium text-sm hover:text-emerald-800 transition-colors w-full p-2 rounded-lg hover:bg-emerald-50"
        >
            <Ruler className="w-4 h-4" />
            {showAdvanced ? 'Ocultar dados avançados' : 'Tenho dados de composição corporal (Bioimpedância/Dobras)'}
            {showAdvanced ? <ChevronUp className="w-4 h-4 ml-auto"/> : <ChevronDown className="w-4 h-4 ml-auto"/>}
        </button>

        {showAdvanced && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-fade-in">
                <p className="text-xs text-slate-500 mb-2">Preencha se tiver acesso a esses dados para aumentar a precisão do cálculo.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <InputField
                        label="% Gordura (BF)"
                        type="number"
                        value={formData.bodyFat || ''}
                        onChange={(e) => updateField('bodyFat', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Ex: 15"
                        unit="%"
                    />
                     <InputField
                        label="Cintura"
                        type="number"
                        value={formData.waist || ''}
                        onChange={(e) => updateField('waist', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Umbigo"
                        unit="cm"
                    />
                     <InputField
                        label="Quadril"
                        type="number"
                        value={formData.hip || ''}
                        onChange={(e) => updateField('hip', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Parte maior"
                        unit="cm"
                    />
                     <InputField
                        label="Pescoço"
                        type="number"
                        value={formData.neck || ''}
                        onChange={(e) => updateField('neck', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Parte média"
                        unit="cm"
                    />
                </div>
            </div>
        )}
      </div>

      <PrimaryButton onClick={handleNext} disabled={!formData.name || !formData.age || !formData.height || !formData.weight}>
        Próximo Passo
      </PrimaryButton>
    </div>
  );

  const renderStep2 = () => {
    // Validate target weight logic roughly to adjust goal if needed, 
    // but we trust the user's explicit goal selection mostly.
    
    const isWeightLoss = formData.goal === Goal.LoseWeight;
    const isGain = formData.goal === Goal.GainMuscle;
    const isMaintain = formData.goal === Goal.Maintain;

    const maxRate = isWeightLoss ? 1.0 : 0.5; // Max loss 1kg, max gain 0.5kg
    const minRate = 0.1;

    return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Nível de Atividade & Objetivo</h2>
        <p className="text-slate-500">Como é o seu dia a dia e onde você quer chegar?</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500"/> Nível de Atividade
        </h3>
        <div className="grid gap-3">
          {ACTIVITY_OPTIONS.map((opt) => (
            <SelectionCard
              key={opt.value}
              label={opt.label}
              description={opt.desc}
              selected={formData.activityLevel === opt.value}
              onClick={() => updateField('activityLevel', opt.value)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500"/> Objetivo Principal
        </h3>
        <div className="grid gap-3">
          {GOAL_OPTIONS.map((opt) => (
            <SelectionCard
              key={opt.value}
              label={opt.label}
              description={opt.desc}
              selected={formData.goal === opt.value}
              onClick={() => {
                updateField('goal', opt.value);
                // Reset weekly rate to sensible default when switching
                updateField('weeklyRate', opt.value === Goal.GainMuscle ? 0.25 : 0.5);
              }}
            />
          ))}
        </div>
      </div>
      
      {!isMaintain && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
             <h3 className="font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-2"><Scale className="w-5 h-5 text-emerald-500"/> Velocidade do Resultado</span>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full text-sm">
                    {formData.weeklyRate} kg / semana
                </span>
            </h3>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <input 
                    type="range" 
                    min={minRate} 
                    max={maxRate} 
                    step={0.1}
                    value={formData.weeklyRate}
                    onChange={(e) => updateField('weeklyRate', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                    <span>Lento & Sustentável ({minRate}kg)</span>
                    <span>Intenso ({maxRate}kg)</span>
                </div>
                <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                    {isWeightLoss 
                        ? `Para perder ${formData.weeklyRate}kg por semana, precisamos gerar um déficit de ~${Math.round((formData.weeklyRate * 7700)/7)} calorias por dia.`
                        : `Para ganhar ${formData.weeklyRate}kg por semana, precisamos adicionar ~${Math.round((formData.weeklyRate * 7700)/7)} calorias por dia.`
                    }
                </p>
            </div>
          </div>
      )}

      <div className="flex gap-3 pt-4">
        <button onClick={handleBack} className="px-6 py-3 rounded-xl font-medium text-slate-500 hover:bg-slate-100">
            Voltar
        </button>
        <PrimaryButton onClick={handleNext}>Continuar</PrimaryButton>
      </div>
    </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Perfil Comportamental</h2>
        <p className="text-slate-500">Entender sua rotina e mentalidade é a chave para a constância.</p>
      </div>

      <div className="space-y-5">
        
        {/* Training Time */}
        <div className="space-y-3">
            <label className="block font-medium text-slate-700">Tempo real disponível para treino por dia:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIME_OPTIONS.map((opt) => (
                <SelectionCard
                    key={opt.value}
                    label={opt.label}
                    selected={formData.trainingTime === opt.value}
                    onClick={() => updateField('trainingTime', opt.value)}
                />
                ))}
            </div>
        </div>

        {/* Discipline */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="block font-medium text-slate-700">Como é sua disciplina hoje?</label>
            <div className="grid gap-3">
                {DISCIPLINE_OPTIONS.map((opt) => (
                <SelectionCard
                    key={opt.value}
                    label={opt.label}
                    description={opt.desc}
                    selected={formData.discipline === opt.value}
                    onClick={() => updateField('discipline', opt.value)}
                />
                ))}
            </div>
        </div>

        {/* Diet History */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="block font-medium text-slate-700">Quantas dietas já tentou?</label>
            <div className="grid grid-cols-2 gap-3">
                {HISTORY_OPTIONS.map((opt) => (
                <SelectionCard
                    key={opt.value}
                    label={opt.label}
                    description={opt.desc}
                    selected={formData.dietHistory === opt.value}
                    onClick={() => updateField('dietHistory', opt.value)}
                />
                ))}
            </div>
        </div>

      </div>

      <div className="flex gap-3 pt-6">
        <button onClick={handleBack} className="px-6 py-3 rounded-xl font-medium text-slate-500 hover:bg-slate-100">
            Voltar
        </button>
        <PrimaryButton onClick={handleNext}>Calcular Meu Plano</PrimaryButton>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!result) return null;

    // Calculate Percentages for UI
    const totalCals = result.macros.calories;
    const proteinPerc = Math.round((result.macros.protein * 4 / totalCals) * 100);
    const carbsPerc = Math.round((result.macros.carbs * 4 / totalCals) * 100);
    // Ensure total is 100% despite rounding
    const fatPerc = 100 - proteinPerc - carbsPerc;

    const chartData = [
      { name: 'Proteínas', value: result.macros.protein * 4, grams: result.macros.protein, perc: proteinPerc, color: '#10b981' }, // emerald-500
      { name: 'Gorduras', value: result.macros.fat * 9, grams: result.macros.fat, perc: fatPerc, color: '#f59e0b' },    // amber-500
      { name: 'Carboidratos', value: result.macros.carbs * 4, grams: result.macros.carbs, perc: carbsPerc, color: '#3b82f6' }, // blue-500
    ];

    const currentPlan = result.mealPlans[activePlan];

    return (
      <div className="animate-fade-in space-y-8 pb-12">
        <div className="text-center">
            <div className="inline-flex items-center justify-center gap-2 mb-4 bg-slate-100 px-4 py-2 rounded-full">
                <User className="w-5 h-5 text-slate-500" />
                <span className="font-semibold text-slate-700">{formData.name}</span>
            </div>
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 text-emerald-700 rounded-full mb-4 mx-auto block w-14 h-14">
            <Brain className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">{result.profile.profileName}</h2>
          <p className="text-slate-600 max-w-lg mx-auto leading-relaxed">{result.profile.description}</p>
        </div>

        {/* Estimation Card */}
        {result.macros.weeksToGoal && result.macros.weeksToGoal > 0 && (
            <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Estimativa para atingir {formData.targetWeight}kg</p>
                        <p className="text-lg font-bold text-slate-800">{result.macros.weeksToGoal} semanas</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">{formData.weeklyRate}kg/sem</p>
                </div>
            </div>
        )}

        {/* Behavioral Advice Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-indigo-600"/> Estratégia Comportamental
            </h3>
            <p className="text-indigo-800 leading-relaxed text-sm md:text-base">
                {result.profile.advice}
            </p>
        </div>

        {/* Main Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Left: Calories */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="relative z-10 text-center">
                    <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Meta Diária</span>
                    <div className="text-5xl font-black mt-2 mb-1 tracking-tight">{result.macros.calories}</div>
                    <div className="flex justify-center items-center gap-2">
                        <span className="text-emerald-400 font-bold">Kcal</span>
                        {result.macros.formulaUsed === 'Katch-McArdle' && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                                Precisão Máxima (BF%)
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Chart */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center h-64 relative">
                 <h4 className="text-slate-500 text-sm font-bold absolute top-4 left-4">Distribuição Calórica</h4>
                 <div className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: number, name: string, props: any) => [
                                    `${props.payload.grams}g (${props.payload.perc}%)`, 
                                    name
                                ]} 
                            />
                        </PieChart>
                    </ResponsiveContainer>
                 </div>
                 {/* Legend overlay in center */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs text-slate-400 font-medium">Macros %</span>
                 </div>
            </div>
        </div>

        {/* Macros Detail Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                <div className="text-emerald-600 mb-1 flex justify-center"><Utensils className="w-6 h-6"/></div>
                <div className="text-2xl font-bold text-slate-800">{result.macros.protein}g</div>
                <div className="text-xs font-bold text-emerald-600 mb-1">({proteinPerc}%)</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Proteína</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                <div className="text-blue-600 mb-1 flex justify-center"><Zap className="w-6 h-6"/></div>
                <div className="text-2xl font-bold text-slate-800">{result.macros.carbs}g</div>
                <div className="text-xs font-bold text-blue-600 mb-1">({carbsPerc}%)</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Carbo</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                <div className="text-amber-600 mb-1 flex justify-center"><Flame className="w-6 h-6"/></div>
                <div className="text-2xl font-bold text-slate-800">{result.macros.fat}g</div>
                <div className="text-xs font-bold text-amber-600 mb-1">({fatPerc}%)</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Gordura</div>
            </div>
        </div>

        {/* Meal Plans Section */}
        <div className="pt-8 border-t border-slate-100">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Sugestões de Cardápio</h3>
                <p className="text-slate-500 text-sm">Adaptados para sua meta calórica</p>
            </div>

            {/* Plan Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                {result.mealPlans.map((plan, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActivePlan(idx)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                            activePlan === idx 
                            ? 'bg-white text-emerald-700 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Opção {idx + 1}
                    </button>
                ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="mb-4 pb-4 border-b border-slate-100">
                    <h4 className="text-lg font-bold text-emerald-800">{currentPlan.name}</h4>
                    <p className="text-sm text-slate-500">{currentPlan.description}</p>
                </div>
                
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="mt-1"><Coffee className="w-5 h-5 text-amber-500"/></div>
                        <div>
                            <h5 className="font-semibold text-slate-800 text-sm uppercase tracking-wide mb-1">{currentPlan.meals.breakfast.title}</h5>
                            <ul className="text-slate-600 text-sm space-y-1">
                                {currentPlan.meals.breakfast.items.map((item, i) => <li key={i}>• {item}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="mt-1"><Sun className="w-5 h-5 text-orange-500"/></div>
                        <div>
                            <h5 className="font-semibold text-slate-800 text-sm uppercase tracking-wide mb-1">{currentPlan.meals.lunch.title}</h5>
                            <ul className="text-slate-600 text-sm space-y-1">
                                {currentPlan.meals.lunch.items.map((item, i) => <li key={i}>• {item}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="mt-1"><Sunset className="w-5 h-5 text-indigo-400"/></div>
                        <div>
                            <h5 className="font-semibold text-slate-800 text-sm uppercase tracking-wide mb-1">{currentPlan.meals.snack.title}</h5>
                            <ul className="text-slate-600 text-sm space-y-1">
                                {currentPlan.meals.snack.items.map((item, i) => <li key={i}>• {item}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="mt-1"><Moon className="w-5 h-5 text-slate-700"/></div>
                        <div>
                            <h5 className="font-semibold text-slate-800 text-sm uppercase tracking-wide mb-1">{currentPlan.meals.dinner.title}</h5>
                            <ul className="text-slate-600 text-sm space-y-1">
                                {currentPlan.meals.dinner.items.map((item, i) => <li key={i}>• {item}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Message & Actions */}
        <div className="text-center pt-8 border-t border-slate-100">
            <p className="text-lg font-medium text-slate-700 italic mb-8">
                “Números funcionam, mas resultados vêm de comportamento + constância.”
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-slate-500/20 active:scale-95"
                >
                    <Download className="w-5 h-5" />
                    Baixar meu Plano (PDF)
                </button>
                
                <button 
                    onClick={() => { setStep(1); setResult(null); setActivePlan(0); }}
                    className="px-6 py-3 text-emerald-600 font-semibold hover:bg-emerald-50 rounded-xl transition-colors"
                >
                    Refazer cálculo
                </button>
            </div>
        </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-900" ref={topRef}>
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 flex items-center justify-center gap-4">
            <h1 className="text-3xl font-black tracking-tight text-slate-800">
                EDUCA<span className="text-emerald-600">FÍSICO</span>
            </h1>
        </header>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8 relative overflow-hidden">
            {step < 4 && renderProgressBar()}
            
            <div className="relative z-10">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderResults()}
            </div>
        </div>

      </div>
    </div>
  );
};

export default App;
