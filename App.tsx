
import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from "jspdf";
import { ActivityLevel, CalculationResult, DietHistory, Discipline, Gender, Goal, TrainingTime, UserData } from './types';
import { calculateMacros } from './utils';
import { InputField, PrimaryButton, SelectionCard } from './components/StepWizard';
import { Brain, Coffee, Sun, Sunset, Moon, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ACTIVITY_OPTIONS = [
  { value: ActivityLevel.Sedentary, label: 'Sedentário', desc: 'Pouco ou nenhum exercício.' },
  { value: ActivityLevel.LightlyActive, label: 'Levemente Ativo', desc: 'Exercício leve 1-3 dias/sem.' },
  { value: ActivityLevel.ModeratelyActive, label: 'Moderadamente Ativo', desc: 'Moderado 3-5 dias/sem.' },
  { value: ActivityLevel.VeryActive, label: 'Muito Ativo', desc: 'Intenso 6-7 dias/sem.' },
];

const GOAL_OPTIONS = [
  { value: Goal.LoseWeight, label: 'Emagrecer', desc: 'Foco em queima de gordura.' },
  { value: Goal.Maintain, label: 'Manter', desc: 'Estabilizar o peso atual.' },
  { value: Goal.GainMuscle, label: 'Hipertrofia', desc: 'Ganho de massa muscular.' },
];

const App = () => {
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [activePlan, setActivePlan] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<UserData>({
    name: '', gender: Gender.Male, age: 30, height: 175, weight: 80,
    targetWeight: undefined, weeklyRate: 0.5,
    activityLevel: ActivityLevel.ModeratelyActive, goal: Goal.LoseWeight,
    trainingTime: TrainingTime.Between45And60, discipline: Discipline.Medium,
    dietHistory: DietHistory.Some,
    bodyFat: 0, waist: 0, neck: 0, hip: 0
  });

  useEffect(() => { topRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [step]);

  const updateField = (field: keyof UserData, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleNext = () => {
    if (step === 3) setResult(calculateMacros(formData));
    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => Math.max(1, prev - 1));

  const handleDownload = () => {
    if (!result) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = 20;

    const colors = {
      emerald: [16, 185, 129],
      slate: [30, 41, 59],
      emeraldBg: [236, 253, 245],
      slateLight: [241, 245, 249],
      textGray: [71, 85, 105],
      textLight: [148, 163, 184]
    };

    const today = new Date().toLocaleDateString('pt-BR');

    // --- PÁGINA 1 ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
    doc.text("EDUCA", (pageWidth / 2) - 15, y, { align: "center" });
    doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
    doc.text("FÍSICO", (pageWidth / 2) + 15, y, { align: "center" });

    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text(`Data do cálculo: ${today}`, pageWidth / 2, y, { align: "center" });

    y += 15;
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y, pageWidth - margin, y);

    y += 20;
    doc.setFontSize(14);
    doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`Aluno: ${formData.name.toUpperCase()}`, margin, y);
    
    y += 8;
    const goalLabel = GOAL_OPTIONS.find(o => o.value === formData.goal)?.label;
    doc.text(`Meta: ${goalLabel} - Estimativa: ${result.macros.weeksToGoal || 0} semanas`, margin, y);

    y += 20;
    doc.setFontSize(16);
    doc.text("PERFIL COMPORTAMENTAL", margin, y);

    y += 10;
    doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
    doc.setFontSize(14);
    doc.text(result.profile.profileName, margin, y);

    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(colors.textGray[0], colors.textGray[1], colors.textGray[2]);
    const profileDesc = doc.splitTextToSize(result.profile.description, contentWidth);
    doc.text(profileDesc, margin, y);
    y += (profileDesc.length * 6) + 10;

    doc.setFillColor(colors.emeraldBg[0], colors.emeraldBg[1], colors.emeraldBg[2]);
    const adviceText = doc.splitTextToSize(result.profile.advice, contentWidth - 10);
    const boxHeight = (adviceText.length * 5) + 20;
    doc.rect(margin, y, contentWidth, boxHeight, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
    doc.text("CONSELHO ESTRATÉGICO", margin + 5, y + 10);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(colors.textGray[0], colors.textGray[1], colors.textGray[2]);
    doc.text(adviceText, margin + 5, y + 18);
    
    y += boxHeight + 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
    doc.text("METAS NUTRICIONAIS", margin, y);

    y += 15;
    doc.setFontSize(36);
    doc.text(`${result.macros.calories}`, margin, y);
    doc.setFontSize(14);
    doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
    doc.text("kcal / dia", margin + 35, y);

    y += 15;
    const colWidth = contentWidth / 3;
    doc.setFontSize(9);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text("PROTEÍNA", margin, y);
    doc.text("CARBOIDRATOS", margin + colWidth, y);
    doc.text("GORDURAS", margin + (colWidth * 2), y);

    y += 10;
    doc.setFontSize(18);
    doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
    doc.text(`${result.macros.protein}g`, margin, y);
    doc.text(`${result.macros.carbs}g`, margin + colWidth, y);
    doc.text(`${result.macros.fat}g`, margin + (colWidth * 2), y);

    y += 25;
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y, pageWidth - margin, y);

    y += 15;
    doc.setFontSize(12);
    doc.text("DADOS UTILIZADOS", margin, y);
    
    y += 10;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const activityLabel = ACTIVITY_OPTIONS.find(o => o.value === formData.activityLevel)?.label;
    const bullets = [
      `• Peso Atual: ${formData.weight} kg`,
      `• Peso Desejável: ${formData.targetWeight || '-'} kg`,
      `• Altura: ${formData.height} cm`,
      `• Idade: ${formData.age} anos`,
      `• Objetivo: ${goalLabel}`,
      `• Ritmo: ${formData.weeklyRate}kg / semana`,
      `• Nível Ativ.: ${activityLabel}`
    ];
    if (formData.bodyFat && formData.bodyFat > 0) bullets.push(`• BF: ${formData.bodyFat}%`);
    
    bullets.forEach(b => {
      doc.text(b, margin, y);
      y += 5;
    });

    doc.setFontSize(8);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.setFont("helvetica", "italic");
    doc.text("Página 1/2", pageWidth - margin - 15, 285);

    // --- PÁGINA 2 ---
    doc.addPage();
    y = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
    doc.text("SUGESTÕES DE CARDÁPIO", margin, y);
    
    y += 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(colors.textGray[0], colors.textGray[1], colors.textGray[2]);
    doc.text("3 opções adaptadas para sua meta calórica, usando alimentos básicos.", margin, y);

    y += 20;

    result.mealPlans.forEach((plan, index) => {
      doc.setFillColor(colors.slateLight[0], colors.slateLight[1], colors.slateLight[2]);
      doc.rect(margin, y, contentWidth, 10, 'F');
      doc.setFont("helvetica", "bold");
      doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
      doc.text(plan.name, margin + 5, y + 7);
      
      y += 18;
      doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
      doc.setFontSize(10);

      const meals = [
        { label: "• Café da Manhã:", items: plan.meals.breakfast.items },
        { label: "• Almoço:", items: plan.meals.lunch.items },
        { label: "• Lanche da Tarde:", items: plan.meals.snack.items },
        { label: "• Jantar:", items: plan.meals.dinner.items }
      ];

      meals.forEach(m => {
        doc.setFont("helvetica", "bold");
        doc.text(m.label, margin, y);
        doc.setFont("helvetica", "normal");
        const itemsText = m.items.join(", ");
        const splitItems = doc.splitTextToSize(itemsText, contentWidth - 40);
        doc.text(splitItems, margin + 40, y);
        y += (splitItems.length * 5) + 5;
      });

      y += 10;
    });

    doc.setFontSize(9);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.setFont("helvetica", "italic");
    doc.text('"A melhor dieta é aquela que você consegue seguir."', pageWidth / 2, 280, { align: "center" });
    doc.text("Página 2/2", pageWidth - margin - 15, 285);

    doc.save(`EDUCAFISICO_PLANO_${formData.name.toUpperCase().replace(/\s+/g, '_')}.pdf`);
  };

  const renderProgressBar = () => (
    <div className="w-full bg-slate-100 h-2 mb-8 rounded-full overflow-hidden">
      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Seus Dados</h2>
        <p className="text-slate-500">Dados básicos para o ponto de partida.</p>
      </div>
      <InputField label="Nome Completo" value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="Ex: João Silva" />
      <div className="grid grid-cols-2 gap-4">
        <SelectionCard label="Masculino" selected={formData.gender === Gender.Male} onClick={() => updateField('gender', Gender.Male)} />
        <SelectionCard label="Feminino" selected={formData.gender === Gender.Female} onClick={() => updateField('gender', Gender.Female)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Idade" type="number" value={formData.age} onChange={e => updateField('age', Number(e.target.value))} unit="anos" />
        <InputField label="Altura" type="number" value={formData.height} onChange={e => updateField('height', Number(e.target.value))} unit="cm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Peso Atual" type="number" value={formData.weight} onChange={e => updateField('weight', Number(e.target.value))} unit="kg" />
        <InputField label="Peso Desejado" type="number" value={formData.targetWeight || ''} onChange={e => updateField('targetWeight', Number(e.target.value))} unit="kg" />
      </div>

      <div className="border-t border-slate-100 pt-4">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors w-full justify-center py-2"
        >
          {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          {showAdvanced ? 'Ocultar dados de bioimpedância' : 'Adicionar dados de bioimpedância (opcional)'}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-slate-50 rounded-2xl animate-fade-in">
            <InputField label="Gordura (%)" type="number" value={formData.bodyFat || ''} onChange={e => updateField('bodyFat', Number(e.target.value))} unit="%" />
            <InputField label="Cintura (cm)" type="number" value={formData.waist || ''} onChange={e => updateField('waist', Number(e.target.value))} unit="cm" />
            <InputField label="Pescoço (cm)" type="number" value={formData.neck || ''} onChange={e => updateField('neck', Number(e.target.value))} unit="cm" />
            <InputField label="Quadril (cm)" type="number" value={formData.hip || ''} onChange={e => updateField('hip', Number(e.target.value))} unit="cm" />
          </div>
        )}
      </div>

      <PrimaryButton onClick={handleNext} disabled={!formData.name || !formData.weight}>Próximo Passo</PrimaryButton>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Objetivo & Atividade</h2>
      </div>
      <div className="space-y-4">
        <label className="text-sm font-bold text-slate-700">Objetivo Principal</label>
        <div className="grid gap-3">
            {GOAL_OPTIONS.map(o => <SelectionCard key={o.value} label={o.label} description={o.desc} selected={formData.goal === o.value} onClick={() => updateField('goal', o.value)} />)}
        </div>
      </div>
      <div className="space-y-4">
        <label className="text-sm font-bold text-slate-700">Nível de Atividade</label>
        <div className="grid gap-3">
            {ACTIVITY_OPTIONS.map(o => <SelectionCard key={o.value} label={o.label} description={o.desc} selected={formData.activityLevel === o.value} onClick={() => updateField('activityLevel', o.value)} />)}
        </div>
      </div>
      <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
        <label className="text-xs font-bold text-slate-500 uppercase">Ritmo Semanal: {formData.weeklyRate}kg</label>
        <input type="range" min="0.1" max="1.0" step="0.1" value={formData.weeklyRate} onChange={e => updateField('weeklyRate', parseFloat(e.target.value))} className="w-full accent-emerald-500" />
      </div>
      <div className="flex gap-3">
        <button onClick={handleBack} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Voltar</button>
        <PrimaryButton onClick={handleNext}>Continuar</PrimaryButton>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center"><h2 className="text-2xl font-bold text-slate-800">Perfil & Rotina</h2></div>
      <div className="space-y-4">
        <label className="text-sm font-bold text-slate-700">Como é sua disciplina atual?</label>
        <div className="grid gap-3">
            <SelectionCard label="Alta" description="Sigo o plano mesmo sem vontade." selected={formData.discipline === Discipline.High} onClick={() => updateField('discipline', Discipline.High)} />
            <SelectionCard label="Média" description="Oscilo, mas tento voltar." selected={formData.discipline === Discipline.Medium} onClick={() => updateField('discipline', Discipline.Medium)} />
            <SelectionCard label="Baixa" description="Muitas dificuldades em manter." selected={formData.discipline === Discipline.Low} onClick={() => updateField('discipline', Discipline.Low)} />
        </div>
      </div>
      <PrimaryButton onClick={handleNext}>Calcular Meu Plano</PrimaryButton>
    </div>
  );

  const renderResults = () => {
    if (!result) return null;
    const chartData = [
      { name: 'Prot', value: result.macros.protein * 4, grams: result.macros.protein, perc: result.macros.proteinPerc, color: '#10b981' },
      { name: 'Carbo', value: result.macros.carbs * 4, grams: result.macros.carbs, perc: result.macros.carbsPerc, color: '#3b82f6' },
      { name: 'Gord', value: result.macros.fat * 9, grams: result.macros.fat, perc: result.macros.fatPerc, color: '#f59e0b' },
    ];
    return (
      <div className="animate-fade-in space-y-8">
        <div className="text-center">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full inline-block mb-2"><Brain size={32}/></div>
          <h2 className="text-3xl font-black text-slate-800">{result.profile.profileName}</h2>
          <p className="text-slate-500 text-sm px-4">{result.profile.description}</p>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-2xl text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl"></div>
            <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">Consumo Diário Alvo</span>
            <div className="text-5xl font-black text-emerald-400 my-2">{result.macros.calories} <span className="text-lg">kcal</span></div>
            <div className="text-xs text-slate-400 font-medium">Fórmula: {result.macros.formulaUsed}</div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {chartData.map(m => (
            <div key={m.name} className="bg-white border-2 border-slate-50 p-3 rounded-2xl text-center shadow-sm">
                <div className="text-lg font-bold text-slate-800">{m.grams}g</div>
                <div className={`text-[10px] font-black uppercase mb-1`} style={{ color: m.color }}>{m.perc}% {m.name}</div>
            </div>
          ))}
        </div>

        <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n, p: any) => [`${p.payload.grams}g (${p.payload.perc}%)`, n]} />
                </PieChart>
            </ResponsiveContainer>
        </div>

        <div className="space-y-4">
            <div className="flex p-1 bg-slate-100 rounded-xl">
                {result.mealPlans.map((p, i) => (
                    <button key={i} onClick={() => setActivePlan(i)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activePlan === i ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>Opção {i+1}</button>
                ))}
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl">
                <h4 className="font-bold text-emerald-800 mb-1">{result.mealPlans[activePlan].name}</h4>
                <p className="text-[10px] text-emerald-600 mb-4 uppercase font-bold">{result.mealPlans[activePlan].description}</p>
                <div className="space-y-4">
                    {Object.values(result.mealPlans[activePlan].meals).map((m: any, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="mt-1">{i === 0 ? <Coffee size={14}/> : i === 1 ? <Sun size={14}/> : i === 2 ? <Sunset size={14}/> : <Moon size={14}/>}</div>
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase">{m.title}</span>
                                <ul className="text-xs text-slate-700 mt-0.5">{m.items.map((it: string, j: number) => <li key={j}>• {it}</li>)}</ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-3">
            <button onClick={handleDownload} className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-4 rounded-2xl font-bold shadow-lg"><Download size={20}/> Baixar Plano PDF</button>
            <button onClick={() => setStep(1)} className="text-emerald-600 font-bold text-sm">Refazer Cálculo</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4" ref={topRef}>
      <div className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl p-8 border border-slate-100">
        <header className="mb-8 text-center"><h1 className="text-3xl font-black text-slate-800">EDUCA<span className="text-emerald-500">FÍSICO</span></h1></header>
        {step < 4 && renderProgressBar()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderResults()}
      </div>
    </div>
  );
};

export default App;
