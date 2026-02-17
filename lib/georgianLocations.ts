/**
 * Georgian regions (mkhare), cities, and districts for location selection.
 * Tbilisi has district-level selection; other cities use city only.
 */

export type RegionId = string;
export type CityId = string;
export type DistrictId = string;

export interface GeorgianRegion {
  id: RegionId;
  nameEn: string;
  nameKa?: string;
}

export interface GeorgianDistrict {
  id: DistrictId;
  nameEn: string;
  nameKa?: string;
}

export interface GeorgianCity {
  id: CityId;
  nameEn: string;
  nameKa?: string;
  regionId: RegionId;
  /** Districts only for cities that have them (e.g. Tbilisi) */
  districts?: GeorgianDistrict[];
}

export const GEORGIAN_REGIONS: GeorgianRegion[] = [
  { id: "tbilisi", nameEn: "Tbilisi (Capital)", nameKa: "თბილისი" },
  { id: "adjara", nameEn: "Adjara", nameKa: "აჭარა" },
  { id: "imereti", nameEn: "Imereti", nameKa: "იმერეთი" },
  { id: "kakheti", nameEn: "Kakheti", nameKa: "კახეთი" },
  { id: "kvemo-kartli", nameEn: "Kvemo Kartli", nameKa: "ქვემო ქართლი" },
  { id: "mtskheta-mtianeti", nameEn: "Mtskheta-Mtianeti", nameKa: "მცხეთა-მთიანეთი" },
  { id: "samegrelo-zemo-svaneti", nameEn: "Samegrelo-Zemo Svaneti", nameKa: "სამეგრელო-ზემო სვანეთი" },
  { id: "samtskhe-javakheti", nameEn: "Samtskhe-Javakheti", nameKa: "სამცხე-ჯავახეთი" },
  { id: "shida-kartli", nameEn: "Shida Kartli", nameKa: "შიდა ქართლი" },
  { id: "guria", nameEn: "Guria", nameKa: "გურია" },
  { id: "racha-lechkhumi", nameEn: "Racha-Lechkhumi and Kvemo Svaneti", nameKa: "რაჭა-ლეჩხუმი და ქვემო სვანეთი" },
];

export const GEORGIAN_CITIES: GeorgianCity[] = [
  // Tbilisi (with districts)
  {
    id: "tbilisi",
    nameEn: "Tbilisi",
    nameKa: "თბილისი",
    regionId: "tbilisi",
    districts: [
      { id: "vake", nameEn: "Vake", nameKa: "ვაკე" },
      { id: "saburtalo", nameEn: "Saburtalo", nameKa: "საბურთალო" },
      { id: "didube", nameEn: "Didube", nameKa: "დიდუბე" },
      { id: "nadzaladevi", nameEn: "Nadzaladevi", nameKa: "ნაძალადევი" },
      { id: "isani", nameEn: "Isani", nameKa: "ისანი" },
      { id: "samgori", nameEn: "Samgori", nameKa: "სამგორი" },
      { id: "mtatsminda", nameEn: "Mtatsminda", nameKa: "მთაწმინდა" },
      { id: "krtsanisi", nameEn: "Krtsanisi", nameKa: "კრწანისი" },
      { id: "chugureti", nameEn: "Chugureti", nameKa: "ჩუგურეთი" },
      { id: "didgori", nameEn: "Didgori", nameKa: "დიდგორი" },
    ],
  },
  // Adjara
  { id: "batumi", nameEn: "Batumi", nameKa: "ბათუმი", regionId: "adjara" },
  { id: "kobuleti", nameEn: "Kobuleti", nameKa: "ქობულეთი", regionId: "adjara" },
  { id: "khelvachauri", nameEn: "Khelvachauri", nameKa: "ხელვაჩაური", regionId: "adjara" },
  // Imereti
  { id: "kutaisi", nameEn: "Kutaisi", nameKa: "ქუთაისი", regionId: "imereti" },
  { id: "samtredia", nameEn: "Samtredia", nameKa: "სამტრედია", regionId: "imereti" },
  { id: "zestaponi", nameEn: "Zestaponi", nameKa: "ზესტაფონი", regionId: "imereti" },
  { id: "terjola", nameEn: "Terjola", nameKa: "თერჯოლა", regionId: "imereti" },
  { id: "tkibuli", nameEn: "Tkibuli", nameKa: "ტყიბული", regionId: "imereti" },
  { id: "vani", nameEn: "Vani", nameKa: "ვანი", regionId: "imereti" },
  // Kvemo Kartli
  { id: "rustavi", nameEn: "Rustavi", nameKa: "რუსთავი", regionId: "kvemo-kartli" },
  { id: "marneuli", nameEn: "Marneuli", nameKa: "მარნეული", regionId: "kvemo-kartli" },
  { id: "bolnisi", nameEn: "Bolnisi", nameKa: "ბოლნისი", regionId: "kvemo-kartli" },
  { id: "gardabani", nameEn: "Gardabani", nameKa: "გარდაბანი", regionId: "kvemo-kartli" },
  // Shida Kartli
  { id: "gori", nameEn: "Gori", nameKa: "გორი", regionId: "shida-kartli" },
  { id: "kaspi", nameEn: "Kaspi", nameKa: "კასპი", regionId: "shida-kartli" },
  { id: "kareli", nameEn: "Kareli", nameKa: "ქარელი", regionId: "shida-kartli" },
  { id: "khashuri", nameEn: "Khashuri", nameKa: "ხაშური", regionId: "shida-kartli" },
  // Samegrelo-Zemo Svaneti
  { id: "zugdidi", nameEn: "Zugdidi", nameKa: "ზუგდიდი", regionId: "samegrelo-zemo-svaneti" },
  { id: "poti", nameEn: "Poti", nameKa: "ფოთი", regionId: "samegrelo-zemo-svaneti" },
  { id: "senaki", nameEn: "Senaki", nameKa: "სენაკი", regionId: "samegrelo-zemo-svaneti" },
  { id: "abasha", nameEn: "Abasha", nameKa: "აბაშა", regionId: "samegrelo-zemo-svaneti" },
  { id: "martvili", nameEn: "Martvili", nameKa: "მარტვილი", regionId: "samegrelo-zemo-svaneti" },
  // Kakheti
  { id: "telavi", nameEn: "Telavi", nameKa: "თელავი", regionId: "kakheti" },
  { id: "sagarejo", nameEn: "Sagarejo", nameKa: "საგარეჯო", regionId: "kakheti" },
  { id: "gurjaani", nameEn: "Gurjaani", nameKa: "გურჯაანი", regionId: "kakheti" },
  { id: "dedoplistskaro", nameEn: "Dedoplistskaro", nameKa: "დედოფლისწყარო", regionId: "kakheti" },
  // Samtskhe-Javakheti
  { id: "akhaltsikhe", nameEn: "Akhaltsikhe", nameKa: "ახალციხე", regionId: "samtskhe-javakheti" },
  { id: "borjomi", nameEn: "Borjomi", nameKa: "ბორჯომი", regionId: "samtskhe-javakheti" },
  { id: "ninotsminda", nameEn: "Ninotsminda", nameKa: "ნინოწმინდა", regionId: "samtskhe-javakheti" },
  // Mtskheta-Mtianeti
  { id: "mtskheta", nameEn: "Mtskheta", nameKa: "მცხეთა", regionId: "mtskheta-mtianeti" },
  { id: "dusheti", nameEn: "Dusheti", nameKa: "დუშეთი", regionId: "mtskheta-mtianeti" },
  { id: "kazbegi", nameEn: "Kazbegi (Stepantsminda)", nameKa: "ყაზბეგი", regionId: "mtskheta-mtianeti" },
  // Guria
  { id: "ozurgeti", nameEn: "Ozurgeti", nameKa: "ოზურგეთი", regionId: "guria" },
  { id: "lanchkhuti", nameEn: "Lanchkhuti", nameKa: "ლანჩხუთი", regionId: "guria" },
  // Racha-Lechkhumi
  { id: "ambrolauri", nameEn: "Ambrolauri", nameKa: "ამბროლაური", regionId: "racha-lechkhumi" },
  { id: "oni", nameEn: "Oni", nameKa: "ონი", regionId: "racha-lechkhumi" },
];

/** OpenStreetMap embed URL for Georgia (approx bbox) */
export const GEORGIA_MAP_BBOX = "41.0,42.2,47.0,43.8";
export const GEORGIA_MAP_CENTER = "42.3,43.4";
