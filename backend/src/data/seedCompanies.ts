import type { Company } from '../types/index.js'

export const SEED_COMPANIES: Company[] = [
  {
    id: 'c-reinvestwealth',
    slug: 'reinvestwealth',
    display_name: 'ReInvestWealth',
    is_own_product: true,
    capterra_url: 'https://www.capterra.com/p/10025243/ReInvestWealth/reviews/',
    g2_slug: null,
    created_at: new Date('2024-09-01').toISOString(),
  },
  {
    id: 'c-quickbooks',
    slug: 'quickbooks',
    display_name: 'QuickBooks Online',
    is_own_product: false,
    capterra_url: 'https://www.capterra.com/p/190778/QuickBooks-Online/reviews/',
    g2_slug: 'quickbooks-online',
    created_at: new Date('2024-09-01').toISOString(),
  },
  {
    id: 'c-freshbooks',
    slug: 'freshbooks',
    display_name: 'FreshBooks',
    is_own_product: false,
    capterra_url: 'https://www.capterra.com/p/142390/FreshBooks/reviews/',
    g2_slug: 'freshbooks',
    created_at: new Date('2024-09-01').toISOString(),
  },
  {
    id: 'c-wave',
    slug: 'wave',
    display_name: 'Wave',
    is_own_product: false,
    capterra_url: 'https://www.capterra.com/p/178021/Wave-Apps/reviews/',
    g2_slug: 'wave-accounting',
    created_at: new Date('2024-09-01').toISOString(),
  },
  {
    id: 'c-xero',
    slug: 'xero',
    display_name: 'Xero',
    is_own_product: false,
    capterra_url: 'https://www.capterra.com/p/196946/Xero/reviews/',
    g2_slug: 'xero',
    created_at: new Date('2024-09-01').toISOString(),
  },
]

export function findCompanyBySlug(slug: string) {
  return SEED_COMPANIES.find((c) => c.slug === slug)
}
