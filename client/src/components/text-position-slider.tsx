import { MoveVertical } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface TextPositionSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function TextPositionSlider({ 
  value, 
  onChange, 
  min = 50, 
  max = 90 
}: TextPositionSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <MoveVertical className="w-4 h-4 mr-2 text-gorgeous-pink" />
          Text Position
        </label>
        <span className="text-xs font-mono bg-gorgeous-pink/10 text-gorgeous-pink px-2 py-1 rounded">
          {value}%
        </span>
      </div>
      
      <div className="px-2">
        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          min={min}
          max={max}
          step={1}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Higher</span>
          <span>Lower</span>
        </div>
      </div>
      
      <div className="text-xs text-gray-600 text-center">
        Adjust the vertical position of the guest name
      </div>
    </div>
  );
}