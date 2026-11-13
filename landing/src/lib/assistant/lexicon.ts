import type { CalculatorId, Quality, RoomId } from '../calc-engine';
import type { LabourCode } from '../prices/labour';

export type Surface = 'floor' | 'wall' | 'ceiling';

export type MaterialTopic = {
  calc: CalculatorId;
  surface: Surface | 'length' | 'volume' | 'points';
  labour?: LabourCode;
  stems: string[];
  variants?: Partial<Record<Surface | 'cement', { calc: CalculatorId; labour?: LabourCode }>>;
};

export const ROOM_STEMS: Record<RoomId, string[]> = {
  yotoq: ['yotoq', 'спальн', 'bedroom', 'ётоқ'],
  mehmon: ['mehmon', 'зал', 'гостин', 'living', 'меҳмон', 'zal'],
  oshxona: ['oshxona', 'кухн', 'kitchen', 'ошхона'],
  hammom: ['hammom', 'vanna', 'ванн', 'санузел', 'bathroom', 'ҳаммом', 'туалет', 'hojatxona', 'toilet room'],
  koridor: ['koridor', "yo'lak", 'коридор', 'прихож', 'hallway', 'corridor', 'йўлак'],
  bolalar: ['bolalar', 'детск', 'nursery', 'kids', 'болалар'],
};

export const QUALITY_STEMS: Record<Quality, string[]> = {
  eco: ['tejam', 'arzon', 'эконом', 'дешев', 'дёшев', 'budget', 'cheap', 'economy'],
  mid: ["o'rta", 'средн', 'standard', 'medium', 'ўрта'],
  pre: ['premium', 'премиум', 'люкс', 'luxury', 'qimmatbaho', 'elit', 'элит'],
};

export const SURFACE_STEMS: Record<Surface, string[]> = {
  floor: ['pol', 'пол', 'floor', 'ерга', 'yerga'],
  wall: ['devor', 'стен', 'wall', 'девор'],
  ceiling: ['shift', 'потол', 'ceiling', 'шифт'],
};

export const MATERIALS: MaterialTopic[] = [
  {
    calc: 'kafel',
    surface: 'floor',
    labour: 'floor-tiling',
    stems: ['kafel', 'plitka', 'keramogranit', 'кафел', 'плитк', 'керамогранит', 'tile', 'кафель'],
    variants: { wall: { calc: 'devorkafel', labour: 'wall-tiling' } },
  },
  { calc: 'laminat', surface: 'floor', labour: 'laminate-laying', stems: ['laminat', 'ламинат', 'laminate'] },
  { calc: 'linoleum', surface: 'floor', labour: 'linoleum-laying', stems: ['linoleum', 'линолеум'] },
  { calc: 'nalivnoy', surface: 'floor', labour: 'self-leveling-floor', stems: ['nalivnoy', 'наливн', 'self-level', 'self level'] },
  { calc: 'styajka', surface: 'floor', labour: 'screed', stems: ['styajka', 'стяжк', 'screed'] },
  { calc: 'plintus', surface: 'length', labour: 'skirting-install', stems: ['plintus', 'плинтус', 'skirting'] },
  {
    calc: 'boyoq',
    surface: 'wall',
    labour: 'wall-painting',
    stems: ["bo'yoq", 'boyoq', "bo'ya", 'краск', 'покрас', 'paint', 'бўёқ'],
    variants: { ceiling: { calc: 'shiftboyoq', labour: 'ceiling-painting' } },
  },
  {
    calc: 'shtuk',
    surface: 'wall',
    labour: 'wall-plastering',
    stems: ['shtukatur', 'штукатур', 'plaster', 'rotband', 'ротбанд'],
    variants: { cement: { calc: 'sementshtuk', labour: 'wall-plastering' } },
  },
  { calc: 'shpak', surface: 'wall', labour: 'wall-puttying', stems: ['shpakl', 'shpatl', 'шпаклев', 'шпаклёв', 'шпатлев', 'putty'] },
  { calc: 'grunt', surface: 'wall', stems: ['grunt', 'грунт', 'primer'] },
  { calc: 'oboy', surface: 'wall', labour: 'wallpapering', stems: ['oboy', 'обои', 'обоев', 'wallpaper'] },
  { calc: 'pvx', surface: 'wall', stems: ['pvx', 'пвх', 'pvc'] },
  { calc: 'dekor', surface: 'wall', labour: 'decorative-plastering', stems: ['dekorativ', 'декоратив', 'decorative'] },
  { calc: 'gips', surface: 'ceiling', labour: 'drywall-ceiling', stems: ['gipsokarton', 'гипсокартон', 'drywall', 'gkl', 'гкл'] },
  { calc: 'natyajnoy', surface: 'ceiling', labour: 'stretch-ceiling', stems: ['natyajnoy', 'натяжн', 'stretch'] },
  { calc: 'gisht', surface: 'wall', labour: 'bricklaying', stems: ["g'isht", 'gisht', 'кирпич', 'brick', 'ғишт'] },
  { calc: 'gazoblok', surface: 'wall', labour: 'block-laying', stems: ['gazoblok', 'газоблок', 'пеноблок', 'aerated', 'gas block'] },
  { calc: 'beton', surface: 'volume', stems: ['beton', 'бетон', 'concrete'] },
  { calc: 'gidro', surface: 'floor', labour: 'waterproofing', stems: ['gidroizol', 'гидроизол', 'waterproof'] },
  { calc: 'issiq', surface: 'wall', stems: ['issiqlik', 'uteplit', 'утепл', 'insulation', 'пенопласт', 'mineral'] },
  { calc: 'elektr', surface: 'points', labour: 'electric-point', stems: ['rozetka', 'розетк', 'socket', 'elektr', 'электр', 'electric', 'kabel', 'кабел', 'cable'] },
  { calc: 'truba', surface: 'length', labour: 'plumbing-point', stems: ['truba', 'труб', 'pipe', 'santexnik', 'сантехн', 'plumbing'] },
];

export const CEMENT_STEMS = ['sement', 'цемент', 'cement'];
export const CHECK_STEMS = ['usta', 'мастер', 'master', 'brigada', 'бригад', 'прораб', 'contractor', 'builder', 'уста'];
export const ESTIMATE_STEMS = ['smeta', 'смет', 'estimate', 'remont', 'ремонт', 'renovat', 'xona', 'комнат', 'room', 'хона'];
export const GREETING_STEMS = ['salom', 'assalom', 'привет', 'здравств', 'hello', 'hi ', 'hey', 'yordam', 'помощ', 'help', 'nima qila', 'что умеешь'];
