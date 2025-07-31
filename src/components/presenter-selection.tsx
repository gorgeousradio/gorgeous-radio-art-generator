import { useQuery } from "@tanstack/react-query";
import type { Presenter } from "@shared/schema";

interface PresenterSelectionProps {
  selected: string;
  onSelect: (presenter: string) => void;
}

export default function PresenterSelection({ selected, onSelect }: PresenterSelectionProps) {
  const { data: presenters = [], isLoading } = useQuery<Presenter[]>({
    queryKey: ['/api/presenters'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="presenter-option rounded-xl p-3 bg-gray-100 animate-pulse">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-200" />
              <div className="w-12 h-4 bg-gray-200 rounded mx-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {presenters.map((presenter) => (
        <div
          key={presenter.id}
          className={`presenter-option rounded-xl p-3 cursor-pointer transition-all duration-300 border-2 ${
            selected === presenter.name
              ? 'border-gorgeous-pink bg-gorgeous-pink/10 scale-105'
              : 'border-gray-200 bg-white/50 hover:border-gorgeous-pink/50 hover:scale-102'
          }`}
          onClick={() => onSelect(presenter.name)}
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden bg-gray-200">
              <img
                src={presenter.profileImageUrl || `/images/profiles/${presenter.name}.png`}
                alt={presenter.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-full h-full bg-gorgeous-pink/20 flex items-center justify-center text-gorgeous-pink font-semibold text-lg">${presenter.displayName[0]}</div>`;
                  }
                }}
              />
            </div>
            <span className="text-sm font-medium">{presenter.displayName}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
