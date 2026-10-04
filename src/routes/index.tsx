import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  ChevronDown,
  Crosshair,
  Download,
  Droplets,
  Eye,
  Flame,
  Gauge,
  HeartPulse,
  ImageUp,
  LayoutGrid,
  MapPin,
  Mic2,
  Palette,
  RotateCcw,
  Save,
  Settings2,
  Shield,
  Sparkles,
  Type,
  Upload,
  Utensils,
  Wifi,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

import cityPreview from "@/assets/hud-city-preview.jpg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Settings = {
  accent: string;
  scale: number;
  opacity: number;
  radius: number;
  layout: "corners" | "compact" | "center";
  font: string;
  showMinimap: boolean;
  showVoice: boolean;
  showStatus: boolean;
};

const defaults: Settings = {
  accent: "#ff493d",
  scale: 100,
  opacity: 92,
  radius: 10,
  layout: "corners",
  font: "Cairo",
  showMinimap: true,
  showVoice: true,
  showStatus: true,
};

const tabs = [
  { id: "appearance", label: "المظهر", icon: Palette },
  { id: "layout", label: "التوزيع", icon: LayoutGrid },
  { id: "elements", label: "العناصر", icon: Eye },
  { id: "typography", label: "الخطوط", icon: Type },
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
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("b7t-hud-settings");
    if (!stored) return;
    try {
      setSettings({ ...defaults, ...(JSON.parse(stored) as Partial<Settings>) });
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
    window.localStorage.setItem("b7t-hud-settings", JSON.stringify(settings));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const exportSettings = () => {
    const data = JSON.stringify({ creator: "b7t dev", ...settings }, null, 2);
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
          <Button variant="secondary" onClick={exportSettings}><Download size={16} /><span className="hidden sm:inline">تصدير الإعدادات</span></Button>
          <Button onClick={save}><Save size={16} />{saved ? "تم الحفظ" : "حفظ"}</Button>
        </div>
      </header>

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
              <div className="space-y-2">{([['corners','موزع على الزوايا'],['compact','مجموعة مدمجة'],['center','توسيط سفلي']] as const).map(([value,label]) => <button key={value} onClick={() => update("layout", value)} className={cn("flex w-full items-center justify-between rounded-md border px-3 py-3 text-sm", settings.layout === value ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground")}><span>{label}</span><span className="h-3 w-3 rounded-full border border-current p-0.5">{settings.layout === value && <span className="block h-full w-full rounded-full bg-current" />}</span></button>)}</div>
            </Section>}

            {activeTab === "elements" && <Section title="إظهار وإخفاء" icon={Eye}>
              <Toggle label="خريطة مصغرة" checked={settings.showMinimap} onChange={(v) => update("showMinimap", v)} />
              <Toggle label="مؤشر الصوت" checked={settings.showVoice} onChange={(v) => update("showVoice", v)} />
              <Toggle label="مؤشرات الحالة" checked={settings.showStatus} onChange={(v) => update("showStatus", v)} />
            </Section>}

            {activeTab === "typography" && <Section title="نوع الخط" icon={Type}>
              <div className="relative"><select value={settings.font} onChange={(e) => update("font", e.target.value)} className="h-11 w-full appearance-none rounded-md border border-border bg-input px-3 text-sm outline-none focus:border-primary"><option>Cairo</option><option>Rajdhani</option><option>Arial</option><option>Tahoma</option></select><ChevronDown className="pointer-events-none absolute left-3 top-3.5" size={16} /></div>
              <p className="mt-4 rounded-md border border-border bg-secondary p-4 text-center text-lg" style={{ fontFamily: settings.font }}>مرحبا بك في السيرفر</p>
            </Section>}
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
              <HudPreview settings={settings} logo={logo} />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[7px] font-semibold tracking-widest text-foreground/40 sm:text-[10px]">B7T DEV • PREMIUM HUD</div>
            </div>
          </div>
          <div className="flex h-11 items-center justify-between border-t border-border px-4 text-[11px] text-muted-foreground"><span>كل التغييرات تظهر فوراً في المعاينة</span><span className="flex items-center gap-1"><Activity size={13} className="text-success" /> النظام جاهز</span></div>
        </section>
      </div>
    </main>
  );
}

function HudPreview({ settings, logo }: { settings: Settings; logo?: string }) {
  const previewStyle = { "--hud-accent": settings.accent, opacity: settings.opacity / 100, transform: `scale(${settings.scale / 100})`, borderRadius: settings.radius } as React.CSSProperties;
  const compact = settings.layout === "compact";
  return <div className="absolute inset-0 text-foreground" style={previewStyle}>
    <div className="absolute right-3 top-3 flex items-center gap-2 sm:right-5 sm:top-5">
      <div className="text-left"><div className="text-[8px] text-foreground/60 sm:text-[11px]">WELCOME TO</div><div className="text-xs font-bold sm:text-lg">B7T ROLEPLAY</div></div>
      <div className="flex h-8 w-8 items-center justify-center rounded-md border border-foreground/15 bg-background/70 backdrop-blur sm:h-11 sm:w-11">{logo ? <img src={logo} alt="شعار السيرفر" className="h-full w-full object-contain p-1" /> : <Flame size={22} style={{ color: settings.accent }} />}</div>
    </div>
    <div className={cn("absolute top-3 flex gap-1.5 text-[7px] sm:top-5 sm:text-[10px]", compact ? "right-1/2 translate-x-1/2" : "left-3 sm:left-5")}>
      <Pill icon={Wifi} text="48 MS" /><Pill icon={Shield} text="ID 204" /><Pill icon={Bell} text="12:42" />
    </div>
    {settings.showStatus && <div className={cn("absolute flex gap-1.5", settings.layout === "center" ? "bottom-5 left-1/2 -translate-x-1/2" : "bottom-4 right-3 sm:bottom-6 sm:right-5")}>
      <Status icon={HeartPulse} value="96" color="var(--hud-accent)" /><Status icon={Shield} value="72" color="oklch(0.7 0.16 230)" /><Status icon={Utensils} value="84" color="oklch(0.78 0.17 75)" /><Status icon={Droplets} value="63" color="oklch(0.72 0.15 220)" />
    </div>}
    {settings.showMinimap && <div className={cn("absolute bottom-4 h-[20%] w-[19%] min-w-20 overflow-hidden border border-foreground/15 bg-background/65 backdrop-blur-sm sm:bottom-6", compact ? "right-3 sm:right-5" : "left-3 sm:left-5")} style={{ borderRadius: settings.radius }}><div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(35deg, transparent 45%, var(--hud-accent) 46%, var(--hud-accent) 49%, transparent 50%), linear-gradient(125deg, transparent 45%, currentColor 46%, currentColor 48%, transparent 49%)", backgroundSize: "45px 45px" }} /><MapPin className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full" size={18} style={{ color: settings.accent }} /></div>}
    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-end gap-2 sm:bottom-6">
      <div className="text-right"><span className="text-2xl font-bold leading-none sm:text-5xl">128</span><span className="mr-1 text-[7px] text-foreground/60 sm:text-[10px]">KM/H</span></div>
      <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-full border border-foreground/20 bg-background/65 text-xs font-bold sm:h-10 sm:w-10">D</div>
      <Gauge size={20} style={{ color: settings.accent }} />
    </div>
    {settings.showVoice && <div className="absolute bottom-4 left-[25%] flex h-7 w-7 items-center justify-center rounded-full border border-foreground/15 bg-background/65 sm:bottom-6 sm:h-9 sm:w-9"><Mic2 size={14} style={{ color: settings.accent }} /></div>}
    <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-1 sm:right-5"><Crosshair size={14} className="text-foreground/50" /><span className="h-12 w-0.5 rounded bg-foreground/15"><span className="block h-8 w-full rounded" style={{ backgroundColor: settings.accent }} /></span></div>
  </div>;
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Palette; children: React.ReactNode }) { return <section><h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><Icon size={16} className="text-primary" />{title}</h2>{children}</section>; }
function Range({ label, value, min, max, suffix, onChange }: { label: string; value: number; min: number; max: number; suffix: string; onChange: (v: number) => void }) { return <div><div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">{label}</span><span>{value}{suffix}</span></div><input aria-label={label} type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-1.5 w-full cursor-pointer accent-primary" /></div>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <button onClick={() => onChange(!checked)} className="mb-2 flex w-full items-center justify-between rounded-md border border-border bg-secondary px-3 py-3 text-sm"><span>{label}</span><span className={cn("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-primary" : "bg-muted")}><span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition-all", checked ? "right-0.5" : "right-[18px]")} /></span></button>; }
function Pill({ icon: Icon, text }: { icon: typeof Wifi; text: string }) { return <span className="flex items-center gap-1 rounded border border-foreground/15 bg-background/65 px-1.5 py-1 backdrop-blur"><Icon size={10} />{text}</span>; }
function Status({ icon: Icon, value, color }: { icon: typeof HeartPulse; value: string; color: string }) { return <div className="flex h-8 min-w-9 items-center gap-1 rounded border border-foreground/15 bg-background/70 px-1.5 backdrop-blur sm:h-10 sm:min-w-12 sm:px-2"><Icon size={13} style={{ color }} /><span className="text-[8px] font-bold sm:text-[10px]">{value}</span></div>; }