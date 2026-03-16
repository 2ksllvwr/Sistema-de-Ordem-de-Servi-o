import { useState } from 'react';
import { CompanyInfo } from '../types';
import { Save, Building2, CheckCircle } from 'lucide-react';

interface CompanySettingsProps {
  company: CompanyInfo;
  onSave: (data: CompanyInfo) => void;
}

export default function CompanySettings({ company, onSave }: CompanySettingsProps) {
  const [form, setForm] = useState<CompanyInfo>({ ...company });
  const [saved, setSaved] = useState(false);

  const set = (field: keyof CompanyInfo, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Configurações</h1>
        <p className="text-xs sm:text-sm text-slate-500">Dados da empresa que aparecem nos documentos impressos</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
            <Building2 size={22} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">Dados da Empresa</h2>
            <p className="text-[11px] sm:text-xs text-slate-500">Esses dados são exibidos nos documentos gerados</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Nome da Empresa / Razão Social</label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">CNPJ</label>
            <input type="text" value={form.cnpj} onChange={e => set('cnpj', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Telefone</label>
            <input type="text" value={form.phone} onChange={e => set('phone', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Endereço Completo</label>
          <input type="text" value={form.address} onChange={e => set('address', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
        </div>

        <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          {saved && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
              <CheckCircle size={18} />
              Configurações salvas!
            </div>
          )}
          <div className="flex-1" />
          <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-blue-500/25">
            <Save size={18} />
            Salvar Configurações
          </button>
        </div>
      </form>

      {/* Preview */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Pré-visualização do Cabeçalho</h3>
        <div className="border-2 border-slate-800 rounded-xl p-4 sm:p-5">
          <div className="border-b-4 border-slate-800 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">{form.name}</h2>
            <p className="text-xs text-slate-600 mt-1">CNPJ: {form.cnpj}</p>
            <p className="text-xs text-slate-600">{form.address}</p>
            <p className="text-xs text-slate-600">{form.phone} | {form.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
