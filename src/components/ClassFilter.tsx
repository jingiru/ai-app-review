type ClassFilterProps = {
  classes: string[];
  selectedClass: string;
  onSelect: (classNo: string) => void;
};

export function ClassFilter({ classes, selectedClass, onSelect }: ClassFilterProps) {
  const filters = ["전체", ...classes];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((classNo) => {
        const active = selectedClass === classNo;
        return (
          <button
            key={classNo}
            type="button"
            onClick={() => onSelect(classNo)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800"
            }`}
          >
            {classNo === "전체" ? "전체" : `${classNo}반`}
          </button>
        );
      })}
    </div>
  );
}
