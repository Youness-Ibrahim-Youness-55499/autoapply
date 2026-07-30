import { getProfileCompletion } from "../profile.utils";
import type { CandidateProfile } from "../profile.types";

export function ProfileProgress({ profile }: { profile: CandidateProfile }) {
  const completion = getProfileCompletion(profile);

  return (
    <aside className="rounded-card border border-line bg-brand-950 p-6 text-white shadow-card sm:p-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-300">
            Profile strength
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {completion.percentage}% complete
          </h2>
        </div>
        <p className="text-sm text-white/60">
          {completion.completed}/{completion.total} sections
        </p>
      </div>

      <div
        aria-label={`Profile is ${completion.percentage}% complete`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={completion.percentage}
        className="mt-5 h-2 overflow-hidden rounded-full bg-white/12"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-brand-300 transition-[width] duration-500"
          style={{ width: `${completion.percentage}%` }}
        />
      </div>

      {completion.missing.length > 0 ? (
        <>
          <p className="mt-5 text-sm font-semibold">Still to complete</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {completion.missing.map((item) => (
              <li
                className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs text-white/75"
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-5 text-sm text-brand-200">
          Your candidate profile is ready for matching.
        </p>
      )}
    </aside>
  );
}
