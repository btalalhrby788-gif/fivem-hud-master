export type CustomBox = { id: string; label: string; value: string };
export type Position = { x: number; y: number };
export type Settings = {
  accent: string; scale: number; opacity: number; radius: number;
  layout: 'corners' | 'compact' | 'center'; font: string;
  showMinimap: boolean; showVoice: boolean; showStatus: boolean;
  serverName: string; welcomeText: string; speedUnit: string;
  healthLabel: string; armorLabel: string; hungerLabel: string; thirstLabel: string;
  pingLabel: string; idLabel: string; customBoxes: CustomBox[];
  positions: Record<string, Position>;
};
export const defaults: Settings = {
  accent: '#ff493d', scale: 100, opacity: 92, radius: 10, layout: 'corners', font: 'Cairo',
  showMinimap: true, showVoice: true, showStatus: true, serverName: 'B7T ROLEPLAY',
  welcomeText: 'WELCOME TO', speedUnit: 'KM/H', healthLabel: 'الصحة', armorLabel: 'الدرع',
  hungerLabel: 'الجوع', thirstLabel: 'العطش', pingLabel: 'PING', idLabel: 'ID',
  customBoxes: [], positions: {},
};
export function elementPosition(settings: Settings, id: string): Position {
  const fixed: Record<string, Position> = {
    brand: { x: 75, y: 4 }, info: { x: settings.layout === 'compact' ? 39 : 3, y: 4 },
    minimap: { x: settings.layout === 'compact' ? 76 : 3, y: 73 },
    speed: { x: 43, y: settings.layout === 'center' ? 77 : 85 },
    voice: { x: 25, y: 87 }, weapon: { x: 94, y: 46 },
  };
  const index = ['health', 'armor', 'hunger', 'thirst', ...settings.customBoxes.map(b => b.id)].indexOf(id);
  const base = settings.layout === 'center' ? 34 : 64;
  const computed = fixed[id] ?? { x: base + (index % 4) * 8, y: 87 - Math.floor(index / 4) * 10 };
  return settings.positions[id] ?? computed;
}
