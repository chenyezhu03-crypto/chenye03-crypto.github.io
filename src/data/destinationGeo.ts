/** 每个目的地的地理归属（对应 travelGeo 树） */
export type DestinationGeo = {
  zoneId: string
  subRegionId: string
  countryId: string
}

export const DESTINATION_GEO: Record<string, DestinationGeo> = {
  dali: { zoneId: 'cn-southwest', subRegionId: 'cn-yunnan', countryId: 'cn' },
  lijiang: { zoneId: 'cn-southwest', subRegionId: 'cn-yunnan', countryId: 'cn' },
  chengdu: { zoneId: 'cn-southwest', subRegionId: 'cn-sichuan', countryId: 'cn' },
  chongqing: { zoneId: 'cn-southwest', subRegionId: 'cn-chongqing', countryId: 'cn' },
  lhasa: { zoneId: 'cn-southwest', subRegionId: 'cn-tibet', countryId: 'cn' },
  guilin: { zoneId: 'cn-south', subRegionId: 'cn-guangxi', countryId: 'cn' },
  sanya: { zoneId: 'cn-south', subRegionId: 'cn-hainan', countryId: 'cn' },
  zhuhai: { zoneId: 'cn-south', subRegionId: 'cn-guangdong', countryId: 'cn' },
  xiamen: { zoneId: 'cn-east', subRegionId: 'cn-fujian', countryId: 'cn' },
  hangzhou: { zoneId: 'cn-east', subRegionId: 'cn-zhejiang', countryId: 'cn' },
  ningbo: { zoneId: 'cn-east', subRegionId: 'cn-zhejiang', countryId: 'cn' },
  suzhou: { zoneId: 'cn-east', subRegionId: 'cn-jiangsu', countryId: 'cn' },
  qingdao: { zoneId: 'cn-east', subRegionId: 'cn-shandong', countryId: 'cn' },
  wuyuan: { zoneId: 'cn-east', subRegionId: 'cn-jiangxi', countryId: 'cn' },
  huangshan: { zoneId: 'cn-east', subRegionId: 'cn-anhui', countryId: 'cn' },
  zhangjiajie: { zoneId: 'cn-central', subRegionId: 'cn-hunan', countryId: 'cn' },
  changsha: { zoneId: 'cn-central', subRegionId: 'cn-hunan', countryId: 'cn' },
  xian: { zoneId: 'cn-northwest', subRegionId: 'cn-shaanxi', countryId: 'cn' },
  lanzhou: { zoneId: 'cn-northwest', subRegionId: 'cn-gansu', countryId: 'cn' },
  dunhuang: { zoneId: 'cn-northwest', subRegionId: 'cn-gansu', countryId: 'cn' },
  xining: { zoneId: 'cn-northwest', subRegionId: 'cn-qinghai', countryId: 'cn' },
  harbin: { zoneId: 'cn-northeast', subRegionId: 'cn-heilongjiang', countryId: 'cn' },
  hongkong: { zoneId: 'cn-south', subRegionId: 'cn-hkmo', countryId: 'cn' },
  macau: { zoneId: 'cn-south', subRegionId: 'cn-hkmo', countryId: 'cn' },
  kyoto: { zoneId: 'asia', subRegionId: 'east-asia', countryId: 'jp' },
  osaka: { zoneId: 'asia', subRegionId: 'east-asia', countryId: 'jp' },
  seoul: { zoneId: 'asia', subRegionId: 'east-asia', countryId: 'kr' },
  jeju: { zoneId: 'asia', subRegionId: 'east-asia', countryId: 'kr' },
  bangkok: { zoneId: 'asia', subRegionId: 'southeast-asia', countryId: 'th' },
  chiangmai: { zoneId: 'asia', subRegionId: 'southeast-asia', countryId: 'th' },
  singapore: { zoneId: 'asia', subRegionId: 'southeast-asia', countryId: 'sg' },
  bali: { zoneId: 'asia', subRegionId: 'southeast-asia', countryId: 'id' },
  maldives: { zoneId: 'asia', subRegionId: 'south-asia', countryId: 'mv' },
  istanbul: { zoneId: 'asia', subRegionId: 'west-asia', countryId: 'tr' },
  dubai: { zoneId: 'asia', subRegionId: 'west-asia', countryId: 'ae' },
  paris: { zoneId: 'europe', subRegionId: 'west-europe', countryId: 'fr' },
  rome: { zoneId: 'europe', subRegionId: 'south-europe', countryId: 'it' },
  barcelona: { zoneId: 'europe', subRegionId: 'south-europe', countryId: 'es' },
  melbourne: { zoneId: 'oceania', subRegionId: 'oceania-core', countryId: 'au' },
  auckland: { zoneId: 'oceania', subRegionId: 'oceania-core', countryId: 'nz' },
}

export function getDestinationGeo(id: string): DestinationGeo | undefined {
  return DESTINATION_GEO[id]
}
