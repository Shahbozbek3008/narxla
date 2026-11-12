export type ListingSeed = {
  materialCode: string;
  storeCode: string;
  url: string;
  title: string;
  packSize: number;
};

const stroy24 = (materialCode: string, slug: string, title: string, packSize = 1): ListingSeed => ({
  materialCode,
  storeCode: '24stroy-uz',
  url: `https://24stroy.uz/${slug}.html`,
  title,
  packSize,
});

const maff = (materialCode: string, productId: number, title: string): ListingSeed => ({
  materialCode,
  storeCode: 'maff-uz',
  url: `https://maff.uz/ru/product/${productId}`,
  title,
  packSize: 1,
});

export const LISTINGS: ListingSeed[] = [
  stroy24('laminate-32', 'laminat-kastamonu-floorpan-sf32-dub-gvineya-8mm-32kl', 'Kastamonu FloorPan SF32, 8 mm, 32 kl'),
  maff('laminate-32', 182, 'Egger EPL209, 8 mm, 32 kl'),
  maff('laminate-32', 783, 'Caspian 1875 Aqua Lock, 8 mm, 32 kl'),
  stroy24('laminate-33', 'laminat-kastamonu-floorpan-fp702-dub-sidnej-8mm-33kl', 'Kastamonu FloorPan FP702, 8 mm, 33 kl'),
  maff('laminate-33', 194, 'Egger EPL242, 8 mm, 33 kl'),
  maff('laminate-33', 186, 'Egger EPL234, 8 mm, 33 kl'),
  maff('laminate-34', 906, 'Egger EL1046, 8 mm, 34 kl'),
  maff('laminate-34', 923, 'Egger EL750, 8 mm, 34 kl'),
  stroy24('underlay-3mm', 'podlozhka-3-mm-100smx50m-50-m-kv', 'Podlojka 3 mm, folgali'),
  stroy24('linoleum', 'linoleum-pvx-bez-podosnovj', 'Linoleum PVX Relin'),
  stroy24('damper-tape', 'dempfernaya-lenta-samokleyuschayasya-shirina-10-mm-dlina-10-m', 'Demfer lenta, 10 m', 10),
  stroy24('grout-2', 'fuga-dlya-zapolneniya-uzkih-shvov-ceresit-ce-33-comfort-2-kg', 'Ceresit CE 33, 2 kg'),
  stroy24('rotband-30', 'shtukaturka-gipsovaya-knauf-rotband-30-kg', 'Knauf Rotband, 25 kg', 0.833),
  stroy24('putty-25', 'shpaklevka-gipsovaya-universalnaya-knauf-fugen-25-kg', 'Knauf Fugen, 25 kg'),
  stroy24('plaster-beacon', 'mayak-shtukaturnyj-stalnoj-ocinkovannyj-6mm-3m', 'Mayoq profil 6 mm, 3 m'),
  stroy24('wallpaper-glue', 'klej-obojnyj-moment-klassik-500g', 'Moment Klassik, 500 g'),
  stroy24('drywall-12-5', 'gipsokarton-knauf-stenovoj-12-5h1200h2500-mm', 'Knauf 12,5 × 1200 × 2500 mm'),
  stroy24('metal-profile-3m', 'profil-potolochnyj-knauf-cd-60x27-mm-dlina-3m-tolschina-stal-0-6-mm', 'Knauf CD 60×27, 3 m'),
  stroy24('joint-tape-45', 'serpyanka-steklotkanevaya-samokleyuschayasya-4-5sm-x-45m', 'Serpyanka 4,5 sm × 45 m'),
  stroy24('cement-m400-50', 'cement-portland-moderna-m-400-50-kg-ferganskaya-obl', 'Moderna M400, 50 kg'),
  stroy24('mineral-wool-6m2', 'mineralnaya-vata-knauf-v-rulonah-50-mm-tr-044-16-6-m2', 'Knauf TR-044, 50 mm, 16,6 m²', 2.767),
  stroy24('insulation-dowel', 'dyubel-dlya-teploizolyacii-10100-mm-s-plastmikovym-gvozdem-i-termozaglushkoj', 'Dyubel-zontik 10 mm'),
  stroy24('socket-switch', 'vyklyuchatel-odnoklavishnyj-lezard-mira-turciya', 'Lezard Mira, bir klavishli'),
  stroy24('breaker-16a', 'avtomat-vyklyuchatel-chint-next-nxb-63-6ka-1p-16a', 'CHINT NXB-63 1P 16A'),
  stroy24('corrugated-pipe', 'gofroshlang-pvh-gofra-truba-gly-kabelya', 'Gofra truba PVX'),
  stroy24('ppr-pipe-20', 'truba-polipropilenovaya-hvs-pn-20-vero', 'VERO PN-20'),
  stroy24('pipe-clip', 'klipsa-opora-pp-vero', 'VERO klipsa'),
];
