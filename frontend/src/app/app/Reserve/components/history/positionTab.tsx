const PositionOverview = () => {
  const data = [
    {
      value: 200.34,
      price: 0.0000004,
      interest: 0.3,
      position: "Open",
      type: "Lend",
    },
    {
      value: 200.34,
      price: 0.0000004,
      interest: 0.3,
      position: "Closed",
      type: "Borrow",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white text-xs">
        <thead className="bg-black/10 h-[39px] rounded-t-[5px] font-medium text-left border border-gray-500">
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
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Type
            </th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white/5 border border-gray-500">
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
                  item.position === "Open" ? "text-green-500" : "text-red-500"
                }`}
              >
                {item.position}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                {item.type}
              </td>
              <td className="whitespace-nowrap px-4 py-2">
                <PositionControls
                  position={item.position as "Open" | "Closed"}
                  type={item.type as "Lend" | "Borrow"}
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
  type: "Lend" | "Borrow";
  onWithdraw: () => void;
  onRepay: () => void;
}

const PositionControls: React.FC<PositionControlsProps> = ({
  position,
  type,
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
      {position === "Open" && type === "Lend" ? (
        <Button label="Withdraw" onClick={onWithdraw} />
      ) : position === "Closed" && type === "Borrow" ? (
        <span>--</span>
      ) : (
        <Button label="Repay" onClick={onRepay} />
      )}
    </div>
  );
};
