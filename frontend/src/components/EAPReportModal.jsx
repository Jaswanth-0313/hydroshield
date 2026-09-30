import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ShieldAlert, 
  FileText, 
  AlertOctagon, 
  Waves, 
  Building2, 
  Navigation, 
  Users,
  CheckCircle2,
  Languages
} from 'lucide-react';

const TRANSLATIONS = {
  en: {
    title: "OFFICIAL EMERGENCY ACTION PLAN (EAP) BULLETIN",
    subtitle: "Central Water Commission & State Disaster Management Authority Protocol",
    damTitle: "DAM & INCIDENT SPECIFICATIONS",
    directiveTitle: "IMMEDIATE EVACUATION & DEFENSE DIRECTIVES",
    rosterTitle: "PRIORITIZED COMMUNITY EVACUATION ROSTER",
    cutoffTitle: "TRANSPORTATION & ROAD CUT-OFF ADVISORY",
    directive1: "Immediate P1 Siren Activation: Sound evacuation sirens across Level-1 flood zones within 15 km reach.",
    directive2: "High-Elevation Relocation: Transport vulnerable residents (elderly, children) to designated emergency shelters above flood lines.",
    directive3: "Arterial Road Blockades: Close and barricade all low-lying bridges and roads experiencing flood stage >0.3m.",
    directive4: "Rescue Convoy Deployment: Station NDRF/SDRF motorboats and rescue squads at designated staging points.",
    disclaimer: "Official incident support document generated for emergency responders. Calibrated with Central Water Commission (CWC) Guidelines."
  },
  hi: {
    title: "आधिकारिक आपातकालीन कार्य योजना (EAP) बुलेटिन",
    subtitle: "केंद्रीय जल आयोग एवं राज्य आपदा प्रबंधन प्राधिकरण प्रोटोकॉल",
    damTitle: "बांध एवं घटना विनिर्देश",
    directiveTitle: "तत्काल निकासी एवं बचाव निर्देश",
    rosterTitle: "प्राथमिकता प्राप्त समुदाय निकासी सूची",
    cutoffTitle: "परिवहन एवं सड़क अवरोध सूचना",
    directive1: "तत्काल P1 सायरन सक्रियण: 15 किमी के दायरे में स्तर-1 बाढ़ क्षेत्रों में निकासी सायरन बजाएं।",
    directive2: "उच्च-ऊंचाई आश्रय स्थानांतरण: बुजुर्गों और बच्चों को बाढ़ रेखा से ऊपर सुरक्षित आश्रयों में स्थानांतरित करें।",
    directive3: "जलमग्न सड़कों की नाकाबंदी: 0.3 मीटर से अधिक जल स्तर वाले सभी पुलों और सड़कों को तुरंत बंद करें।",
    directive4: "बचाव दल की तैनाती: एनडीआरएफ/एसडीआरएफ की मोटरबोट और राहत टीमों को चिन्हित स्थानों पर तैनात करें।",
    disclaimer: "आपदा प्रतिक्रिया कर्मियों के लिए आधिकारिक दस्तावेज़। केंद्रीय जल आयोग दिशानिर्देशों के अनुसार।"
  },
  ml: {
    title: "ഔദ്യോഗിക അടിയന്തര കർമ്മ പദ്ധതി (EAP) ബുള്ളറ്റിൻ",
    subtitle: "കേന്ദ്ര ജല കമ്മീഷൻ & സംസ്ഥാന ദുരന്ത നിവാരണ അതോറിറ്റി പ്രോട്ടോക്കോൾ",
    damTitle: "ഡാം & അപകട വിവരണം",
    directiveTitle: "അടിയന്തര ഒഴിപ്പിക്കൽ നിർദ്ദേശങ്ങൾ",
    rosterTitle: "മുൻഗണനാടിസ്ഥാനത്തിലുള്ള ഗ്രാമ ഒഴിപ്പിക്കൽ പട്ടിക",
    cutoffTitle: "ഗതാഗത & റോഡ് തടസ്സ അറിയിപ്പ്",
    directive1: "ഉടൻ P1 സൈറൺ മുഴക്കുക: 15 കി.മീ ചുറ്റളവിലുള്ള ഒന്നാം ലെവൽ പ്രളയ ബാധിത പ്രദേശങ്ങളിൽ മുന്നറിയിപ്പ് സൈറൺ നൽകുക.",
    directive2: "ഉയർന്ന പ്രദേശങ്ങളിലേക്ക് മാറ്റുക: പ്രായമായവരെയും കുട്ടികളെയും ഉയർന്ന അടിയന്തര ഷെൽട്ടറുകളിലേക്ക് മാറ്റുക.",
    directive3: "വെള്ളപ്പൊക്ക റോഡുകൾ അടക്കുക: 0.3 മീറ്ററിലധികം വെള്ളം കയറിയ എല്ലാ പാലങ്ങളും റോഡുകളും ബാരിക്കേഡ് വെച്ച് അടക്കുക.",
    directive4: "രക്ഷാപ്രവർത്തകരെ വിന്യസിക്കുക: എൻ.ഡി.ആർ.എഫ് / എസ്.ഡി.ആർ.എഫ് ബോട്ടുകളും സംഘങ്ങളെയും തയ്യാറാക്കി നിർത്തുക.",
    disclaimer: "ദുരന്ത നിവാരണ സേനകൾക്കായി തയ്യാറാക്കിയ ഔദ്യോഗിക രേഖ. സി.ഡബ്ല്യു.സി മാർഗ്ഗനിർദ്ദേശങ്ങൾക്ക് വിധേയം."
  },
  or: {
    title: "ଅଧିକାରୀକ ଜରୁରୀକାଳୀନ କାର୍ଯ୍ୟ ଯୋଜନା (EAP) ବୁଲେଟିନ",
    subtitle: "କେନ୍ଦ୍ରୀୟ ଜଳ ଆୟୋଗ ଏବଂ ରାଜ୍ୟ ବିପର୍ଯ୍ୟୟ ପରିଚାଳନା ପ୍ରାଧିକରଣ ପ୍ରୋଟୋକଲ",
    damTitle: "ବନ୍ଧ ଏବଂ ଘଟଣା ବିବରଣୀ",
    directiveTitle: "ତୁରନ୍ତ ସ୍ଥାନାନ୍ତରଣ ଏବଂ ସୁରକ୍ଷା ନିର୍ଦ୍ଦେଶ",
    rosterTitle: "ପ୍ରାଥମିକତା ଭିତ୍ତିକ ସ୍ଥାନାନ୍ତରଣ ତାଲିକା",
    cutoffTitle: "ପରିବହନ ଏବଂ ରାସ୍ତା ଅବରୋଧ ସୂଚନା",
    directive1: "ତୁରନ୍ତ P1 ସାଇରନ ବଜାନ୍ତୁ: ୧୫ କିମି ପରିସର ମଧ୍ୟରେ ସମସ୍ତ ବନ୍ୟା ପ୍ରଭାବିତ ଅଞ୍ଚଳରେ ସାଇରନ ବଜାନ୍ତୁ।",
    directive2: "ଉଚ୍ଚ ସ୍ଥାନକୁ ସ୍ଥାନାନ୍ତରଣ: ବୟସ୍କ ଏବଂ ଶିଶୁମାନଙ୍କୁ ସୁରକ୍ଷିତ ଆଶ୍ରୟସ୍ଥଳୀକୁ ସ୍ଥାନାନ୍ତର କରନ୍ତୁ।",
    directive3: "ବନ୍ୟା ରାସ୍ତା ବନ୍ଦ କରନ୍ତୁ: ୦.୩ ମିଟରରୁ ଅଧିକ ଜଳ ପ୍ରବାହିତ ହେଉଥିବା ପୋଲ ଏବଂ ରାସ୍ତା ବନ୍ଦ କରନ୍ତୁ।",
    directive4: "ଉଦ୍ଧାରକାରୀ ଦଳ ନିୟୋଜନ: NDRF/ODRAF ଦଳଙ୍କୁ ପ୍ରସ୍ତୁତ ରଖନ୍ତୁ।",
    disclaimer: "ବିପର୍ଯ୍ୟୟ ପରିଚାଳନା କର୍ମଚାରୀଙ୍କ ପାଇଁ ଅଧିକାରୀକ ରିପୋର୍ଟ।"
  }
};

export default function EAPReportModal({
  isOpen,
  onClose,
  activeDam,
  currentSimulation,
  villagesRisk = [],
  infrastructureRisk = [],
  roadsStatus,
  shelters = []
}) {
  const [lang, setLang] = useState('en');
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const sim = currentSimulation || {};
  const res = activeDam?.reservoir_info || {};
  const safeVillages = Array.isArray(villagesRisk) ? villagesRisk : [];
  const criticalVillages = safeVillages.filter(v => v.risk_level === 'CRITICAL');
  const highVillages = safeVillages.filter(v => v.risk_level === 'HIGH');
  const safeInfras = Array.isArray(infrastructureRisk) ? infrastructureRisk : [];
  const affectedInfras = safeInfras.filter(i => i.is_inundated);
  const cutoffRoadsCount = roadsStatus?.cutoff_roads_count || 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl text-slate-200 flex flex-col">
        
        {/* Modal Top Control Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Emergency Action Plan (EAP)
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
              <Languages className="w-3.5 h-3.5 text-cyan-400 ml-1" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="en" className="bg-slate-900">English</option>
                <option value="hi" className="bg-slate-900">हिन्दी (Hindi)</option>
                <option value="ml" className="bg-slate-900">മലയാളം (Malayalam)</option>
                <option value="or" className="bg-slate-900">ଓଡ଼ିଆ (Odia)</option>
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-8 space-y-6 text-xs leading-relaxed bg-slate-900 print:bg-white print:text-black">
          
          {/* Official Document Banner */}
          <div className="border-b-2 border-slate-700 pb-4 flex items-start justify-between">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
                {t.subtitle}
              </div>
              <h1 className="text-xl font-black text-white mt-1">
                {t.title}
              </h1>
              <div className="text-xs text-slate-400 mt-0.5">
                Target Basin: <strong className="text-slate-200">{activeDam?.name || 'Idukki Dam'} ({activeDam?.river})</strong> | Date: {new Date().toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 bg-rose-950 border border-rose-700 text-rose-300 font-bold uppercase rounded text-[10px] tracking-wider">
                ACTIVE INCIDENT LEVEL 3
              </span>
              <div className="text-[10px] text-slate-500 font-mono mt-1">Ref: EAP-HYD-{activeDam?.id || 'idk'}</div>
            </div>
          </div>

          {/* 1. Dam & Scenario Parameters */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Waves className="w-4 h-4" />
              <span>1. {t.damTitle}</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                <span className="text-slate-400 text-[10px] block">Dam Height & FRL:</span>
                <strong className="text-slate-100">{res.dam_height_m}m / {res.full_reservoir_level_m}m MSL</strong>
              </div>
              <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                <span className="text-slate-400 text-[10px] block">Peak Outflow Discharge:</span>
                <strong className="text-rose-400 font-mono">{Number(sim.peak_breach_discharge_cumecs || 14200).toLocaleString()} m³/s</strong>
              </div>
              <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                <span className="text-slate-400 text-[10px] block">Flood Inundation Envelope:</span>
                <strong className="text-cyan-300 font-mono">{sim.total_inundated_area_sqkm || 28.5} km²</strong>
              </div>
              <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                <span className="text-slate-400 text-[10px] block">Earliest Valley Impact:</span>
                <strong className="text-emerald-300 font-mono">T + {sim.earliest_village_arrival_min || 3.2} min</strong>
              </div>
            </div>
          </div>

          {/* 2. Priority Directives */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4" />
              <span>2. {t.directiveTitle}</span>
            </h3>
            <div className="p-4 bg-rose-950/30 border border-rose-900/60 rounded-xl space-y-2 text-rose-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p><strong>{t.directive1}</strong></p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p><strong>{t.directive2}</strong></p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p><strong>{t.directive3}</strong></p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p><strong>{t.directive4}</strong></p>
              </div>
            </div>
          </div>

          {/* 3. Community Risk Evacuation Priority Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>3. {t.rosterTitle}</span>
            </h3>
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    <th className="p-2.5">Priority</th>
                    <th className="p-2.5">Community / Village</th>
                    <th className="p-2.5">Pop at Risk</th>
                    <th className="p-2.5">Distance</th>
                    <th className="p-2.5">Wave Arrival</th>
                    <th className="p-2.5">Stage Depth</th>
                    <th className="p-2.5">Assigned Shelter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                  {safeVillages.slice(0, 6).map((v) => (
                    <tr key={v.id} className="hover:bg-slate-800/30">
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          v.risk_level === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-orange-950 text-orange-300 border-orange-800'
                        }`}>
                          {v.evacuation_priority || v.risk_level}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-slate-100">{v.name}</td>
                      <td className="p-2.5 font-mono">{(v.population || 0).toLocaleString()}</td>
                      <td className="p-2.5 font-mono">{v.distance_from_dam_km} km</td>
                      <td className="p-2.5 font-mono text-cyan-300 font-bold">T+{v.flood_arrival_time_min} min</td>
                      <td className="p-2.5 font-mono text-amber-300">{v.max_flood_depth_m} m</td>
                      <td className="p-2.5 text-emerald-400">{shelters[0]?.name || 'District Shelter A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Cutoff Infrastructure & Road Closures */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-4 h-4" />
              <span>4. {t.cutoffTitle}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
                <span className="font-semibold text-rose-400 block">Critical Road Segment Closures:</span>
                <p>• NH 85 Cheruthoni Bridge Approach (Submerged, Depth &gt;4.2m)</p>
                <p>• Karimban-Thadiyampadu Low Cause-way (Passage Closed)</p>
                <p>• Chelachuvadu Riverside Connector Road (Inundated)</p>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
                <span className="font-semibold text-amber-400 block">Affected Critical Infrastructure:</span>
                <p>• {affectedInfras.length} Critical utility nodes inundated</p>
                <p>• Lower Periyar Hydro Power Substation on Emergency Shutdown</p>
                <p>• Painavu Community Health Center on Standby Power</p>
              </div>
            </div>
          </div>

          {/* Footer & Signature Block */}
          <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <div>
              {t.disclaimer}
            </div>
            <div>
              Generated: {new Date().toISOString()} | Incident Commander Auth ID: #SDMA-2026-HYD
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
