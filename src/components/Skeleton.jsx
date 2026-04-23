// Базовый скелетон-блок
export function Skeleton({ className = "", style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ borderRadius: 8, ...style }}
    />
  );
}

// Скелетон карточки вуза
export function UniversityCardSkeleton() {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton style={{ height: 20, width: "50%", borderRadius: 20 }} />
          <Skeleton style={{ height: 16, width: "90%" }} />
          <Skeleton style={{ height: 13, width: "60%" }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Skeleton style={{ height: 52, borderRadius: 12 }} />
        <Skeleton style={{ height: 52, borderRadius: 12 }} />
      </div>
      <Skeleton style={{ height: 13, width: "70%" }} />
      <div style={{ height: 6, borderRadius: 3 }} className="skeleton" />
      <div className="flex justify-between pt-1 border-t border-slate-50">
        <Skeleton style={{ height: 13, width: "40%" }} />
        <Skeleton style={{ height: 13, width: "25%" }} />
      </div>
    </div>
  );
}

// Скелетон страницы вузов — сетка карточек
export function UniversitiesGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <UniversityCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Скелетон страницы вуза
export function UniversityPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      {/* Шапка */}
      <div className="card overflow-hidden">
        <div style={{ height: 180 }} className="skeleton" />
      </div>
      {/* Метрики */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col gap-2">
            <Skeleton style={{ height: 12, width: "60%" }} />
            <Skeleton style={{ height: 24, width: "50%" }} />
          </div>
        ))}
      </div>
      {/* Стоимость */}
      <div className="card p-6 flex flex-col gap-4">
        <Skeleton style={{ height: 16, width: "30%" }} />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton style={{ height: 88, borderRadius: 16 }} />
          <Skeleton style={{ height: 88, borderRadius: 16 }} />
        </div>
      </div>
      {/* График */}
      <div className="card p-6 flex flex-col gap-4">
        <Skeleton style={{ height: 16, width: "40%" }} />
        <Skeleton style={{ height: 180 }} />
      </div>
    </div>
  );
}

// Скелетон строки вуза в списке
export function UniversityRowSkeleton() {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton style={{ height: 20, width: "40%", borderRadius: 20 }} />
          <Skeleton style={{ height: 16, width: "85%" }} />
          <Skeleton style={{ height: 13, width: "50%" }} />
        </div>
        <Skeleton style={{ height: 13, width: 30 }} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} style={{ height: 52, borderRadius: 12 }} />
        ))}
      </div>
      <div className="flex gap-2 pt-1 border-t border-slate-50">
        <Skeleton style={{ height: 32, flex: 1, borderRadius: 8 }} />
        <Skeleton style={{ height: 32, flex: 1, borderRadius: 8 }} />
      </div>
    </div>
  );
}
