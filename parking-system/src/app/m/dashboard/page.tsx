import ViewToggle from '@/app/components/ViewToggle'

export default async function MobileDashboard() {
  return (
    <div className="mobile-dashboard">
      <h2>Mobile Dashboard</h2>
        <ViewToggle />
    </div>
  )
}