"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { useAreaTree, type AreaNode } from "@/lib/address/useArea";
import { cn } from "@/lib/utils/utils";

/**
 * AreaPicker - Province/City/District cascading selector
 * Story 5.9: AC 3 - Area selection
 */

type AreaPickerProps = {
  value?: number; // Selected district ID
  onChange?: (areaId: number, areaName: string) => void;
  error?: boolean;
  placeholder?: string;
};

export function AreaPicker({
  value,
  onChange,
  error = false,
  placeholder = "请选择省市区",
}: AreaPickerProps) {
  const { data: areaTree = [], isLoading } = useAreaTree();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<AreaNode | null>(null);
  const [selectedCity, setSelectedCity] = useState<AreaNode | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<AreaNode | null>(null);
  const [activeTab, setActiveTab] = useState<"province" | "city" | "district">("province");

  // Initialize from value
  useEffect(() => {
    if (value && areaTree.length > 0 && !selectedDistrict) {
      // Find the district and its parents
      for (const province of areaTree) {
        if (province.children) {
          for (const city of province.children) {
            if (city.children) {
              for (const district of city.children) {
                if (district.id === value) {
                  setSelectedProvince(province);
                  setSelectedCity(city);
                  setSelectedDistrict(district);
                  return;
                }
              }
            }
          }
        }
      }
    }
  }, [value, areaTree, selectedDistrict]);

  // Display text
  const displayText = useMemo(() => {
    if (selectedProvince && selectedCity && selectedDistrict) {
      return `${selectedProvince.name}${selectedCity.name}${selectedDistrict.name}`;
    }
    if (selectedProvince && selectedCity) {
      return `${selectedProvince.name}${selectedCity.name}`;
    }
    if (selectedProvince) {
      return selectedProvince.name;
    }
    return "";
  }, [selectedProvince, selectedCity, selectedDistrict]);

  // Current list to display based on active tab
  const currentList = useMemo(() => {
    if (activeTab === "province") {
      return areaTree;
    }
    if (activeTab === "city" && selectedProvince?.children) {
      return selectedProvince.children;
    }
    if (activeTab === "district" && selectedCity?.children) {
      return selectedCity.children;
    }
    return [];
  }, [activeTab, areaTree, selectedProvince, selectedCity]);

  const handleProvinceSelect = (province: AreaNode) => {
    setSelectedProvince(province);
    setSelectedCity(null);
    setSelectedDistrict(null);
    if (province.children && province.children.length > 0) {
      setActiveTab("city");
    }
  };

  const handleCitySelect = (city: AreaNode) => {
    setSelectedCity(city);
    setSelectedDistrict(null);
    if (city.children && city.children.length > 0) {
      setActiveTab("district");
    }
  };

  const handleDistrictSelect = (district: AreaNode) => {
    setSelectedDistrict(district);
    // Selection complete
    if (selectedProvince && selectedCity) {
      const fullName = `${selectedProvince.name}${selectedCity.name}${district.name}`;
      onChange?.(district.id, fullName);
    }
    setIsOpen(false);
  };

  const handleTabClick = (tab: "province" | "city" | "district") => {
    if (tab === "city" && !selectedProvince) return;
    if (tab === "district" && !selectedCity) return;
    setActiveTab(tab);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        data-testid="area-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 bg-white border rounded-md text-left",
          error ? "border-red-500" : "border-gray-200",
          "hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6]"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="size-4 text-gray-400 shrink-0" />
          <span className={cn("truncate", displayText ? "text-gray-900" : "text-gray-400")}>
            {isLoading ? "加载中..." : displayText || placeholder}
          </span>
        </div>
        <ChevronDown className={cn("size-4 text-gray-400 shrink-0 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              type="button"
              onClick={() => handleTabClick("province")}
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                activeTab === "province"
                  ? "text-[#8b5cf6] border-b-2 border-[#8b5cf6]"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {selectedProvince?.name || "选择省份"}
            </button>
            <button
              type="button"
              onClick={() => handleTabClick("city")}
              disabled={!selectedProvince}
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                activeTab === "city"
                  ? "text-[#8b5cf6] border-b-2 border-[#8b5cf6]"
                  : "text-gray-500 hover:text-gray-700",
                !selectedProvince && "opacity-50 cursor-not-allowed"
              )}
            >
              {selectedCity?.name || "选择城市"}
            </button>
            <button
              type="button"
              onClick={() => handleTabClick("district")}
              disabled={!selectedCity}
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                activeTab === "district"
                  ? "text-[#8b5cf6] border-b-2 border-[#8b5cf6]"
                  : "text-gray-500 hover:text-gray-700",
                !selectedCity && "opacity-50 cursor-not-allowed"
              )}
            >
              {selectedDistrict?.name || "选择区县"}
            </button>
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto">
            {currentList.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                {isLoading ? "加载中..." : "暂无数据"}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 p-2">
                {currentList.map((item) => {
                  const isSelected =
                    (activeTab === "province" && selectedProvince?.id === item.id) ||
                    (activeTab === "city" && selectedCity?.id === item.id) ||
                    (activeTab === "district" && selectedDistrict?.id === item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (activeTab === "province") handleProvinceSelect(item);
                        else if (activeTab === "city") handleCitySelect(item);
                        else handleDistrictSelect(item);
                      }}
                      className={cn(
                        "px-2 py-1.5 text-sm rounded text-left truncate transition-colors",
                        isSelected
                          ? "bg-[#8b5cf6]/10 text-[#8b5cf6] font-medium"
                          : "hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Close button */}
          <div className="border-t border-gray-100 p-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default AreaPicker;

