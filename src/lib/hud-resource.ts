import JSZip from 'jszip';
import type { Settings } from './hud-model';
import { fontFiles, hudCss, hudJs, resolvedConfig } from './hud-renderer';

export const clientLua = `
local Config = nil
local hunger, thirst, ping = nil, nil, nil
local customStatus = false
local qb = nil
local function percent(value)
  if type(value) ~= 'number' then return nil end
  return math.max(0, math.min(100, value))
end
local function loadConfig()
  local raw = LoadResourceFile(GetCurrentResourceName(), 'html/config.json')
  Config = raw and json.decode(raw) or {}
end
loadConfig()

-- Custom frameworks may call exports['b7t_hud']:SetNeeds(hunger, thirst).
exports('SetNeeds', function(h, t)
  customStatus = true
  hunger, thirst = percent(h), percent(t)
end)
AddEventHandler('b7t_hud:setNeeds', function(h, t)
  customStatus = true
  hunger, thirst = percent(h), percent(t)
end)
RegisterNetEvent('hud:client:UpdateNeeds', function(h, t)
  hunger, thirst = percent(h), percent(t)
end)
RegisterNetEvent('QBCore:Player:SetPlayerData', function(data)
  local m = data and data.metadata or {}
  hunger, thirst = percent(m.hunger), percent(m.thirst)
end)
RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
  hunger, thirst = nil, nil
end)
RegisterNetEvent('b7t_hud:ping', function(value) ping = value end)

CreateThread(function()
  while true do
    if not customStatus then
      if GetResourceState('qbx_core') == 'started' then
        hunger, thirst = percent(LocalPlayer.state.hunger), percent(LocalPlayer.state.thirst)
        if hunger == nil or thirst == nil then
          local ok, data = pcall(function() return exports.qbx_core:GetPlayerData() end)
          if ok and data and data.metadata then
            hunger, thirst = percent(data.metadata.hunger), percent(data.metadata.thirst)
          end
        end
      elseif GetResourceState('qb-core') == 'started' then
        local ok, data = pcall(function()
          if not qb then qb = exports['qb-core']:GetCoreObject() end
          return qb.Functions.GetPlayerData()
        end)
        if ok and data then
          local m = data.metadata or {}
          hunger, thirst = percent(m.hunger), percent(m.thirst)
        end
      elseif GetResourceState('esx_status') == 'started' then
        TriggerEvent('esx_status:getStatus', 'hunger', function(s)
          if s then hunger = percent(s.getPercent and s.getPercent() or (s.val / 10000)) end
        end)
        TriggerEvent('esx_status:getStatus', 'thirst', function(s)
          if s then thirst = percent(s.getPercent and s.getPercent() or (s.val / 10000)) end
        end)
      else
        hunger, thirst = nil, nil
      end
    end
    TriggerServerEvent('b7t_hud:requestPing')
    Wait(2000)
  end
end)

-- Use left/top alignment to share the editor's normalized top-left coordinates.
local function placeRadar()
  local p = Config.positions and Config.positions.minimap or {x = 3, y = 73}
  local scale = (Config.scale or 100) / 100
  local aspect = GetAspectRatio(false)
  local width, height = 0.19 * scale, 0.1125 * aspect * scale
  local x, y = p.x / 100, p.y / 100
  -- Cancel the safe-zone offset applied by the native HUD alignment.
  local safe = (1.0 - GetSafeZoneSize()) * 0.5
  x, y = x - safe, y - safe
  SetMinimapComponentPosition('minimap', 'L', 'T', x, y, width, height)
  SetMinimapComponentPosition('minimap_mask', 'L', 'T', x, y, width, height)
  SetMinimapComponentPosition('minimap_blur', 'L', 'T', x - 0.01, y - 0.01, width + 0.02, height + 0.02)
  SetRadarBigmapEnabled(true, false)
  Wait(0)
  SetRadarBigmapEnabled(false, false)
end
CreateThread(function()
  Wait(1000)
  local lastAspect, lastSafe = 0, 0
  while true do
    local aspect, safe = GetAspectRatio(false), GetSafeZoneSize()
    if aspect ~= lastAspect or safe ~= lastSafe then
      placeRadar()
      lastAspect, lastSafe = aspect, safe
    end
    DisplayRadar(Config.showMinimap == true and not IsPauseMenuActive())
    Wait(500)
  end
end)

CreateThread(function()
  while true do
    local ped = PlayerPedId()
    local vehicle = GetVehiclePedIsIn(ped, false)
    local inVehicle = vehicle ~= 0
    local maxHealth = math.max(1, GetEntityMaxHealth(ped) - 100)
    local health = math.max(0, math.min(100, (GetEntityHealth(ped) - 100) / maxHealth * 100))
    local _, clip = GetAmmoInClip(ped, GetSelectedPedWeapon(ped))
    local gear = inVehicle and GetVehicleCurrentGear(vehicle) or 0
    local speed = inVehicle and GetEntitySpeed(vehicle) or 0
    if gear == 0 then gear = speed > 0.5 and 'R' or 'N' end
    local multiplier = string.upper(Config.speedUnit or 'KM/H') == 'MPH' and 2.236936 or 3.6
    SendNUIMessage({action = 'update', health = health, armor = GetPedArmour(ped),
      hunger = hunger or false, thirst = thirst or false, ping = ping or false,
      speed = math.floor(speed * multiplier), gear = gear, inVehicle = inVehicle,
      playerId = GetPlayerServerId(PlayerId()), talking = NetworkIsPlayerTalking(PlayerId()),
      ammo = clip or 0, armed = IsPedArmed(ped, 4),
      time = string.format('%02d:%02d', GetClockHours(), GetClockMinutes()),
      visible = not IsPauseMenuActive() and NetworkIsPlayerActive(PlayerId())})
    Wait(150)
  end
end)
-- Remove Rockstar health/armor bars from the actual radar.
CreateThread(function()
  local minimap = RequestScaleformMovie('minimap')
  while not HasScaleformMovieLoaded(minimap) do Wait(50) end
  while true do
    BeginScaleformMovieMethod(minimap, 'SETUP_HEALTH_ARMOUR')
    ScaleformMovieMethodAddParamInt(3)
    EndScaleformMovieMethod()
    Wait(0)
  end
end)
AddEventHandler('onResourceStop', function(name)
  if name ~= GetCurrentResourceName() then return end
  SetMinimapComponentPosition('minimap', 'L', 'B', -0.0045, -0.022, 0.150, 0.188888)
  SetMinimapComponentPosition('minimap_mask', 'L', 'B', 0.02, 0.032, 0.111, 0.159)
  SetMinimapComponentPosition('minimap_blur', 'L', 'B', -0.03, 0.022, 0.266, 0.237)
  DisplayRadar(true)
end)
`;
export const serverLua = `
local lastRequest = {}
RegisterNetEvent('b7t_hud:requestPing', function()
  local player = source
  local now = GetGameTimer()
  if lastRequest[player] and now - lastRequest[player] < 1500 then return end
  lastRequest[player] = now
  TriggerClientEvent('b7t_hud:ping', player, GetPlayerPing(player))
end)
AddEventHandler('playerDropped', function() lastRequest[source] = nil end)
`;

export async function buildResource(settings: Settings, logo?: string) {
  const zip = new JSZip();
  const root = zip.folder('b7t_hud');
  if (!root) throw new Error('تعذر تجهيز السكربت');
  let logoPath: string | undefined;
  const match = logo?.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/);
  if (match?.[1] && match[2]) {
    logoPath = `logo.${match[1] === 'jpeg' ? 'jpg' : match[1]}`;
    root.file(`html/${logoPath}`, match[2], { base64: true });
  }
  root.file('html/config.json', JSON.stringify({ creator: 'b7t dev', ...resolvedConfig(settings, logoPath) }, null, 2));
  root.file('fxmanifest.lua', `fx_version 'cerulean'\ngame 'gta5'\nauthor 'b7t dev'\nversion '2.0.0'\nui_page 'html/index.html'\nfiles { 'html/**' }\nclient_script 'client.lua'\nserver_script 'server.lua'\n`);
  root.file('client.lua', clientLua);
  root.file('server.lua', serverLua);
  root.file('html/index.html', '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>b7t HUD</title><link rel="stylesheet" href="style.css"></head><body><div id="hud" hidden></div><script src="app.js"></script></body></html>');
  root.file('html/style.css', hudCss);
  root.file('html/app.js', hudJs);
  await Promise.all(Object.entries(fontFiles).map(async ([name, url]) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('تعذر تضمين خطوط الهود');
    root.file(`html/fonts/${name}`, await response.arrayBuffer());
  }));
  root.file('README.txt', `b7t HUD — حقوق التطوير b7t dev\n\nالتركيب: فك الضغط وضع مجلد b7t_hud في resources ثم أضف ensure b7t_hud إلى server.cfg بعد سكربتات الكور والحالة. أوقف الهود القديم لتجنب التداخل. أعد تشغيل المورد بعد استبدال الملفات.\n\nالصحة والدرع والصوت والسلاح والسرعة والخريطة من بيانات FiveM الفعلية، والبنق من السيرفر. عداد السرعة يظهر بالمركبة ومؤشر الذخيرة عند حمل السلاح.\n\nالجوع والعطش: دعم تلقائي qb-core وqbx_core وesx_status. عند عدم وجود مصدر يظهر — وليس رقمًا وهميًا. للكور المخصص استخدم من client: exports['b7t_hud']:SetNeeds(hunger, thirst) بقيم 0 إلى 100، أو TriggerEvent('b7t_hud:setNeeds', hunger, thirst).\n\nالخريطة في المحرر تمثيلية؛ داخل اللعبة هي خريطة GTA الحقيقية. تغير دقتها وشكلها حسب اللعبة والدقة ومنطقة الأمان؛ الموارد التي تتحكم بالخريطة قد تتعارض. اختبر موضعها داخل سيرفرك.\n\nالمواضع نسبية ومصدرة في html/config.json مع جميع النصوص والإعدادات والشعار والخطوط.\n`);
  return zip.generateAsync({ type: 'blob' });
}
