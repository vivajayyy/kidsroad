"use client";

import Chip from "@/components/ui/Chip";

const AGE_OPTIONS = [
  { label: "전체", value: "" },
  { label: "0~2세", value: "0-2" },
  { label: "3~5세", value: "3-5" },
  { label: "6~9세", value: "6-9" },
  { label: "10세+", value: "10+" },
];

const CHECKLIST_OPTIONS: Array<{
  label: string;
  value: string;
  icon?: string;
  textIcon?: string;
}> = [
  { label: "무료", value: "free", textIcon: "FREE" },
  { label: "유료", value: "paid", icon: "payments" },
  { label: "실내", value: "indoor", icon: "home" },
  { label: "실외", value: "outdoor", icon: "wb_sunny" },
  { label: "주차", value: "parking", icon: "local_parking" },
  { label: "유모차", value: "stroller", icon: "stroller" },
  { label: "수유실", value: "nursing", icon: "baby_changing_station" },
];

interface FilterChipsProps {
  currentAge: string;
  currentChecklist: Record<string, boolean>;
  onFilterChange: (key: string, value: string) => void;
}

export default function FilterChips({
  currentAge,
  currentChecklist,
  onFilterChange,
}: FilterChipsProps) {
  const selectedAges = currentAge ? currentAge.split(",") : [];

  const handleAgeClick = (value: string) => {
    // "전체"는 필터 초기화
    if (value === "") {
      onFilterChange("age", "");
      return;
    }

    let newAges: string[];
    if (selectedAges.includes(value)) {
      newAges = selectedAges.filter((a) => a !== value);
    } else {
      newAges = [...selectedAges, value];
    }

    onFilterChange("age", newAges.join(","));
  };

  const handleChecklistClick = (key: string) => {
    const isActive = currentChecklist[key] || false;
    onFilterChange(key, isActive ? "" : "true");
  };

  const isAllAge = selectedAges.length === 0;

  return (
    <div className="space-y-4">
      {/* 연령 필터 */}
      <div className="flex overflow-x-auto scrollbar-hide gap-2">
        {AGE_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            active={
              option.value === ""
                ? isAllAge
                : selectedAges.includes(option.value)
            }
            onClick={() => handleAgeClick(option.value)}
          />
        ))}
      </div>

      {/* 체크리스트 필터 */}
      <div className="flex overflow-x-auto scrollbar-hide gap-2">
        {CHECKLIST_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            icon={option.icon}
            textIcon={option.textIcon}
            active={currentChecklist[option.value] || false}
            onClick={() => handleChecklistClick(option.value)}
          />
        ))}
      </div>
    </div>
  );
}
