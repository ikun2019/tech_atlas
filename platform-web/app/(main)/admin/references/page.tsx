import { getTechnologies, getReferenceDatabases } from '@/lib/api/references'
import { AdminReferencesClient } from './AdminReferencesClient'

export default async function AdminReferencesPage() {
  const [databases, technologies] = await Promise.all([
    getReferenceDatabases(),
    getTechnologies(),
  ])

  return <AdminReferencesClient databases={databases} technologies={technologies} />
}
