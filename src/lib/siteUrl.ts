/** 线上 GitHub Pages 根地址（与仓库 chenye03-crypto.github.io 一致） */
export const PUBLIC_SITE = 'https://chenyezhu03-crypto.github.io'

export function publicPage(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${PUBLIC_SITE}${p}`
}
