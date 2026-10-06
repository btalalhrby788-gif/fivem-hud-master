import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ChevronDown,
  Download,
  Eye,
  Flame,
  ImageUp,
  LayoutGrid,
  Palette,
  Package,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Sparkles,
  Type,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";

import cityPreview from "@/assets/hud-city-preview.jpg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { defaults, type Settings, type Position } from '@/lib/hud-model';
import { previewDocument, resolvedConfig } from '@/lib/hud-renderer';
import { buildResource } from '@/lib/hud-resource';

const tabs = [
  { id: "appearance", label: "المظهر", icon: Palette },
  { id: "layout", label: "التوزيع", icon: LayoutGrid },
  { id: "elements", label: "العناصر", icon: Eye },
  { id: "typography", label: "النصوص", icon: Type },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "b7t HUD Studio | محرر هود فايف إم" },
      { name: "description", content: "واجهة احترافية لتخصيص هود فايف إم بالكامل ورفع الشعار وتصدير الإعدادات." },
      { property: "og:title", content: "b7t HUD Studio" },
      { property: "og:description", content: "خصص هود سيرفرك بالكامل من واجهة واحدة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HudStudio,
});

function HudStudio() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [activeTab, setActiveTab] = useState("appearance");
  const [logo, setLogo] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [packing, setPacking] = useState(false);
  const [packError, setPackError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("b7t-hud-settings");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Partial<Settings> & { logo?: string };
      setSettings({ ...defaults, ...parsed, positions: parsed.positions ?? {} });
      setLogo(parsed.logo);
    } catch {
      window.localStorage.removeItem("b7t-hud-settings");
    }
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((current) => ({ ...current, [key]: value }));

  const uploadLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 2_000_000) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(typeof reader.result === "string" ? reader.result : undefined);
    reader.readAsDataURL(file);
  };

  const save = () => {
    window.localStorage.setItem("b7t-hud-settings", JSON.stringify({ ...settings, logo }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const setText = (key: "serverName" | "welcomeText" | "speedUnit" | "healthLabel" | "armorLabel" | "hungerLabel" | "thirstLabel" | "pingLabel" | "idLabel", value: string) => {
    update(key, value.replace(/[<>]/g, "").slice(0, 30));
  };

  const addCustomBox = () => {
    if (settings.customBoxes.length >= 8) return;
    update("customBoxes", [...settings.customBoxes, { id: crypto.randomUUID(), label: "عنصر جديد", value: "100" }]);
  };

  const updateCustomBox = (id: string, field: "label" | "value", value: string) => {
    update("customBoxes", settings.customBoxes.map((box) => box.id === id ? { ...box, [field]: value.slice(0, 24) } : box));
  };

  const removeCustomBox = (id: string) => update("customBoxes", settings.customBoxes.filter((box) => box.id !== id));

  const downloadResource = async () => {
    setPacking(true);
    setPackError('');
    try {
      const blob = await buildResource(settings, logo);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'b7t_hud_fivem.zip';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      setPackError(error instanceof Error ? error.message : 'تعذر تحميل السكربت، حاول مرة ثانية');
    } finally {
      setPacking(false);
    }
  };

  const exportSettings = () => {
    const data = JSON.stringify({ creator: "b7t dev", ...resolvedConfig(settings, logo) }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "b7t-hud-config.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-background text-foreground" dir="rtl">
      <header className="flex h-16 items-center justify-between border-b border-border bg-panel-strong px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Flame size={20} fill="currentColor" />
          </div>
          <div>
            <div className="font-display text-lg font-bold leading-none">b7t HUD <span className="text-primary">STUDIO</span></div>
            <span className="text-[10px] text-muted-foreground">FIVEM INTERFACE CUSTOMIZER</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setSettings(defaults)} title="استعادة الافتراضي"><RotateCcw size={17} /></Button>
          <Button variant="secondary" onClick={exportSettings}><Download size={16} /><span className="hidden sm:inline">JSON</span></Button>
          <Button variant="secondary" onClick={downloadResource} disabled={packing}><Package size={16} /><span className="hidden sm:inline">{packing ? "جاري التجهيز" : "تحميل السكربت"}</span></Button>
          <Button onClick={save}><Save size={16} />{saved ? "تم الحفظ" : "حفظ"}</Button>
        </div>
      </header>

      {packError && <p role="alert" className="border-b border-destructive p-3 text-sm text-destructive">{packError}</p>}
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="order-2 border-t border-border bg-panel lg:order-1 lg:border-l lg:border-t-0">
          <div className="grid grid-cols-4 border-b border-border">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} className={cn("flex h-16 flex-col items-center justify-center gap-1 border-l border-border text-[11px] transition-colors last:border-l-0", activeTab === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
                <Icon size={17} />{label}
              </button>
            ))}
          </div>

          <div className="space-y-6 p-5">
            {activeTab === "appearance" && <>
              <Section title="الهوية البصرية" icon={Sparkles}>
                <label className="mb-2 block text-xs text-muted-foreground">لون الواجهة</label>
                <div className="flex items-center gap-3">
                  <input aria-label="لون الواجهة" type="color" value={settings.accent} onChange={(e) => update("accent", e.target.value)} className="h-10 w-12 cursor-pointer rounded border border-border bg-input p-1" />
                  <input value={settings.accent.toUpperCase()} onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && update("accent", e.target.value)} className="h-10 min-w-0 flex-1 rounded-md border border-border bg-input px-3 text-left font-mono text-sm outline-none focus:border-primary" dir="ltr" maxLength={7} />
                </div>
                <div className="mt-3 flex gap-2">
                  {["#ff493d", "#ffb020", "#28d17c", "#29b6f6", "#a855f7"].map((color) => <button key={color} aria-label={`اختيار ${color}`} onClick={() => update("accent", color)} className="h-7 flex-1 rounded border border-border" style={{ backgroundColor: color }} />)}
                </div>
              </Section>
              <Section title="الشعار" icon={ImageUp}>
                <button onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-3 rounded-md border border-dashed border-border bg-secondary p-3 text-right transition-colors hover:border-primary">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-accent">{logo ? <img src={logo} alt="الشعار المرفوع" className="h-full w-full object-contain" /> : <Upload size={18} />}</div>
                  <div><div className="text-sm font-semibold">رفع شعار السيرفر</div><div className="text-[11px] text-muted-foreground">PNG أو JPG — بحد أقصى 2MB</div></div>
                </button>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadLogo} className="hidden" />
              </Section>
              <Range label="شفافية الواجهة" value={settings.opacity} min={35} max={100} suffix="%" onChange={(v) => update("opacity", v)} />
              <Range label="حجم الهود" value={settings.scale} min={70} max={130} suffix="%" onChange={(v) => update("scale", v)} />
              <Range label="استدارة الحواف" value={settings.radius} min={0} max={24} suffix="px" onChange={(v) => update("radius", v)} />
            </>}

            {activeTab === "layout" && <Section title="مكان العناصر" icon={LayoutGrid}>
              <div className="space-y-2">{([['corners','موزع على الزوايا'],['compact','مجموعة مدمجة'],['center','توسيط سفلي']] as const).map(([value,label]) => <button key={value} onClick={() => setSettings(current => ({ ...current, layout: value, positions: {} }))} className={cn("flex w-full items-center justify-between rounded-md border px-3 py-3 text-sm", settings.layout === value ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground")}><span>{label}</span><span className="h-3 w-3 rounded-full border border-current p-0.5">{settings.layout === value && <span className="block h-full w-full rounded-full bg-current" />}</span></button>)}</div>
              <Button variant="secondary" className="mt-3 w-full" onClick={() => update("positions", {})}><RotateCcw size={15} />إعادة مواقع العناصر</Button>
            </Section>}

            {activeTab === "elements" && <>
              <Section title="إظهار وإخفاء" icon={Eye}>
                <Toggle label="خريطة مصغرة" checked={settings.showMinimap} onChange={(v) => update("showMinimap", v)} />
                <Toggle label="مؤشر الصوت" checked={settings.showVoice} onChange={(v) => update("showVoice", v)} />
                <Toggle label="مؤشرات الحالة" checked={settings.showStatus} onChange={(v) => update("showStatus", v)} />
              </Section>
              <Section title="المربعات المخصصة" icon={Plus}>
                <div className="space-y-2">{settings.customBoxes.map((box) => <div key={box.id} className="grid grid-cols-[1fr_70px_32px] gap-2"><input aria-label="اسم العنصر" value={box.label} onChange={(e) => updateCustomBox(box.id, "label", e.target.value)} className="h-9 min-w-0 rounded border border-border bg-input px-2 text-xs outline-none focus:border-primary" /><input aria-label="قيمة العنصر" value={box.value} onChange={(e) => updateCustomBox(box.id, "value", e.target.value)} className="h-9 min-w-0 rounded border border-border bg-input px-2 text-xs outline-none focus:border-primary" /><Button variant="icon" size="icon" onClick={() => removeCustomBox(box.id)} title="حذف العنصر"><Trash2 size={14} /></Button></div>)}</div>
                <Button variant="secondary" className="mt-3 w-full" onClick={addCustomBox} disabled={settings.customBoxes.length >= 8}><Plus size={15} />إضافة مربع جديد</Button>
              </Section>
            </>}

            {activeTab === "typography" && <>
              <Section title="نوع الخط" icon={Type}>
                <div className="relative"><select value={settings.font} onChange={(e) => update("font", e.target.value)} className="h-11 w-full appearance-none rounded-md border border-border bg-input px-3 text-sm outline-none focus:border-primary"><option>Cairo</option><option>Rajdhani</option><option>Arial</option><option>Tahoma</option></select><ChevronDown className="pointer-events-none absolute left-3 top-3.5" size={16} /></div>
              </Section>
              <Section title="نصوص الهود" icon={Type}>
                <div className="space-y-2"><TextField label="اسم السيرفر" value={settings.serverName} onChange={(v) => setText("serverName", v)} /><TextField label="النص العلوي" value={settings.welcomeText} onChange={(v) => setText("welcomeText", v)} /><TextField label="وحدة السرعة" value={settings.speedUnit} onChange={(v) => setText("speedUnit", v)} /><TextField label="اسم الصحة" value={settings.healthLabel} onChange={(v) => setText("healthLabel", v)} /><TextField label="اسم الدرع" value={settings.armorLabel} onChange={(v) => setText("armorLabel", v)} /><TextField label="اسم الجوع" value={settings.hungerLabel} onChange={(v) => setText("hungerLabel", v)} /><TextField label="اسم العطش" value={settings.thirstLabel} onChange={(v) => setText("thirstLabel", v)} /><TextField label="اسم البنق" value={settings.pingLabel} onChange={(v) => setText("pingLabel", v)} /><TextField label="اسم الآيدي" value={settings.idLabel} onChange={(v) => setText("idLabel", v)} /></div>
              </Section>
            </>}
          </div>
          <div className="mx-5 mb-5 border-t border-border pt-4 text-center text-[11px] text-muted-foreground">DESIGNED & DEVELOPED BY <strong className="text-primary">b7t dev</strong></div>
        </aside>

        <section className="order-1 flex min-h-[620px] flex-col bg-panel-strong lg:order-2">
          <div className="flex h-12 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 animate-pulse rounded-full bg-success" /> معاينة مباشرة</div>
            <div className="flex items-center gap-2"><span className="rounded bg-secondary px-2 py-1 text-[10px] text-muted-foreground">1920 × 1080</span><Settings2 size={15} className="text-muted-foreground" /></div>
          </div>

          <div className="hud-grid flex flex-1 items-center justify-center p-3 sm:p-7">
            <div className="panel-shadow relative aspect-video w-full max-w-6xl overflow-hidden rounded-md border border-border bg-card" style={{ fontFamily: settings.font }}>
              <img src={cityPreview} alt="مشهد مدينة ليلي لمعاينة الهود" width={1536} height={864} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/35" />
              <HudPreview settings={settings} logo={logo} onPosition={(id, position) => setSettings(current => ({ ...current, positions: { ...current.positions, [id]: position } }))} />

            </div>
          </div>
          <div className="flex h-11 items-center justify-between border-t border-border px-4 text-[11px] text-muted-foreground"><span>كل التغييرات تظهر فوراً في المعاينة</span><span className="flex items-center gap-1"><Activity size={13} className="text-success" /> النظام جاهز</span></div>
        </section>
      </div>
    </main>
  );
}

const previewValues = { health: 96, armor: 72, hunger: 84, thirst: 63, speed: 128, playerId: 204, ping: 48, time: '12:42', gear: 'D', ammo: 30 };
const hudDocument = previewDocument();
function HudPreview({ settings, logo, onPosition }: { settings: Settings; logo?: string; onPosition: (id: string, position: Position) => void }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const stateRef = useRef({ settings, logo, onPosition });
  stateRef.current = { settings, logo, onPosition };
  const configure = () => frameRef.current?.contentWindow?.postMessage({ action: 'configure', config: resolvedConfig(stateRef.current.settings, stateRef.current.logo), data: previewValues }, '*');
  useEffect(() => { configure(); }, [settings, logo]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.action === 'hud-ready') configure();
      if (event.data?.action === 'hud-position') {
        const { id, position } = event.data;
        if (typeof id !== 'string' || !position || !Number.isFinite(position.x) || !Number.isFinite(position.y)) return;
        if (!Object.hasOwn(resolvedConfig(stateRef.current.settings).positions, id)) return;
        stateRef.current.onPosition(id, { x: Math.max(0, Math.min(100, position.x)), y: Math.max(0, Math.min(100, position.y)) });
      }
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, []);
  return <iframe ref={frameRef} title="معاينة الهود" srcDoc={hudDocument} onLoad={configure} className="absolute inset-0 h-full w-full border-0" />;
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Palette; children: ReactNode }) { return <section><h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><Icon size={16} className="text-primary" />{title}</h2>{children}</section>; }
function Range({ label, value, min, max, suffix, onChange }: { label: string; value: number; min: number; max: number; suffix: string; onChange: (v: number) => void }) { return <div><div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">{label}</span><span>{value}{suffix}</span></div><input aria-label={label} type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-1.5 w-full cursor-pointer accent-primary" /></div>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <button onClick={() => onChange(!checked)} className="mb-2 flex w-full items-center justify-between rounded-md border border-border bg-secondary px-3 py-3 text-sm"><span>{label}</span><span className={cn("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-primary" : "bg-muted")}><span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition-all", checked ? "right-0.5" : "right-[18px]")} /></span></button>; }
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="grid grid-cols-[86px_1fr] items-center gap-2 text-[11px] text-muted-foreground"><span>{label}</span><input aria-label={label} value={value} maxLength={30} onChange={(e) => onChange(e.target.value)} className="h-9 min-w-0 rounded border border-border bg-input px-2 text-xs text-foreground outline-none focus:border-primary" /></label>; }