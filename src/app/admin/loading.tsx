function LoadingCard() {
  return (
    <div className="admin-card p-5 sm:p-6">
      <div className="h-3 w-24 rounded-full bg-[color:var(--admin-card-strong)]" />
      <div className="mt-4 h-8 w-3/4 rounded-full bg-[color:var(--admin-card-strong)]" />
      <div className="mt-6 space-y-3">
        <div className="h-4 w-full rounded-full bg-[color:var(--admin-card-strong)]" />
        <div className="h-4 w-5/6 rounded-full bg-[color:var(--admin-card-strong)]" />
        <div className="h-4 w-2/3 rounded-full bg-[color:var(--admin-card-strong)]" />
      </div>
    </div>
  )
}

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse lg:space-y-8">
      <section className="admin-card p-6 sm:p-8">
        <div className="h-3 w-28 rounded-full bg-[color:var(--admin-card-strong)]" />
        <div className="mt-5 h-12 w-full max-w-2xl rounded-[24px] bg-[color:var(--admin-card-strong)]" />
        <div className="mt-4 h-4 w-full max-w-3xl rounded-full bg-[color:var(--admin-card-strong)]" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="h-28 rounded-[24px] bg-[color:var(--admin-card-strong)]" />
          <div className="h-28 rounded-[24px] bg-[color:var(--admin-card-strong)]" />
          <div className="h-28 rounded-[24px] bg-[color:var(--admin-card-strong)]" />
          <div className="h-28 rounded-[24px] bg-[color:var(--admin-card-strong)]" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <LoadingCard />
        <LoadingCard />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <LoadingCard />
        <LoadingCard />
      </section>
    </div>
  )
}
