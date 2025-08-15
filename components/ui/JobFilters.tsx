import { JobType } from "@/types/job";

type Filters = {
  skills: string[];
  priceRange: { min: number; max: number };
  type: string | null;
};

interface JobFiltersProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

export function JobFilters({ filters, setFilters }: JobFiltersProps) {
  // Example skills and types; replace with dynamic data if needed
  const allSkills = ["Solidity", "Web3.js", "React", "Rust"];
  const jobTypes = [
    JobType.FULL_TIME,
    JobType.PART_TIME,
    JobType.CONTRACT,
    JobType.FREELANCE,
  ];

  const handleSkillChange = (skill: string) => {
    setFilters({
      ...filters,
      skills: filters.skills.includes(skill)
        ? filters.skills.filter((s) => s !== skill)
        : [...filters.skills, skill],
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, type: e.target.value || null });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, bound: "min" | "max") => {
    setFilters({
      ...filters,
      priceRange: { ...filters.priceRange, [bound]: Number(e.target.value) },
    });
  };

  return (
    <aside className="p-4 space-y-4 border rounded bg-slate-50 dark:bg-slate-900">
      <div>
        <label className="block mb-1 font-semibold">Skills</label>
        <div className="flex flex-wrap gap-2">
          {allSkills.map((skill) => (
            <label key={skill} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={filters.skills.includes(skill)}
                onChange={() => handleSkillChange(skill)}
              />
              {skill}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Price Range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.priceRange.min}
            min={0}
            max={filters.priceRange.max}
            onChange={(e) => handlePriceChange(e, "min")}
            className="w-20 px-1 border rounded"
          />
          <span>-</span>
          <input
            type="number"
            value={filters.priceRange.max}
            min={filters.priceRange.min}
            onChange={(e) => handlePriceChange(e, "max")}
            className="w-20 px-1 border rounded"
          />
        </div>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Job Type</label>
        <select value={filters.type || ""} onChange={handleTypeChange} className="px-2 py-1 border rounded">
          <option value="">All</option>
          {jobTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}