import { useState } from "react";

interface FeildProps {
    label: string,
    value: string,
}

export const Feild = ({ label, value }: FeildProps) => {

    const [fileNumber, setFileNumber] = useState(value)


  return (
    <div className="flex flex-col gap-1  ">
      <label className="text-sm text-gray-500 uppercase">{label}</label>

      {label === "FILE NUMBER" ? (
        <input
          type="text"
          value={value}
           onChange={(e) => setFileNumber(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm bg-gray-50"
        />
      ) : (
        <p className="text-sm font-medium text-gray-800">{value}</p>
      )}

      
    </div>
  );
};
