const PositionOverview = () => {
  const data = [
    {
      value: 200.34,
      price: 0.0000004,
      interest: 0.3,
      position: "Open",
    },
    {
      value: 200.34,
      price: 0.0000004,
      interest: 0.3,
      position: "Closed",
    },
  ];

  return (
    <div className="overflow-x-auto animate-fadeInBottom">
      <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-xs">
        <thead className="bg-black/5 h-[39px] rounded-t-[5px] font-medium text-left">
          <tr>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Value
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Price
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Interest
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Position
            </th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white/5">
          {data.map((item, index) => (
            <tr key={index}>
              <td className="whitespace-nowrap px-4 py-2 flex flex-col font-medium text-gray-900">
                {item.value.toFixed(2)}M <small>${item.value.toFixed(1)}</small>
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                ${item.price.toFixed(7)}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                {(item.interest * 100).toFixed(1)}%
              </td>
              <td
                className={`whitespace-nowrap px-4 py-2 ${
                  item.position === "Open" ? "text-green-500" : "text-black/50"
                }`}
              >
                {item.position}
              </td>
              <td className="whitespace-nowrap px-4 py-2">
                <PositionControls
                  position={item.position as "Open" | "Closed"}
                  onWithdraw={() => alert("Withdraw")}
                  onRepay={() => alert("Repay")}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PositionOverview;

interface PositionControlsProps {
  position: "Open" | "Closed";
  onWithdraw: () => void;
  onRepay: () => void;
}

const PositionControls: React.FC<PositionControlsProps> = ({
  position,
  onWithdraw,
  onRepay,
}) => {
  const Button = ({
    label,
    onClick,
  }: {
    label: string;
    onClick: () => void;
  }) => (
    <button
      className="bg-black/80 text-white w-[96px] px-5 py-3 rounded-3xl"
      onClick={onClick}
    >
      {label}
    </button>
  );
  return (
    <div className="flex justify-end">
      {position === "Open" && <Button label="Withdraw" onClick={onWithdraw} />}
      {position === "Closed" && <Button label="Repay" onClick={onRepay} />}
    </div>
  );
};
