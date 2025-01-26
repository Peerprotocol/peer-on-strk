import React from 'react'

const TransactionHistory = () => {
    const data = [
        {
          type: "Lend",
          quantity: 200.34,
          value: 200.4,
          interest: 0.3,
        },
        {
            type: "Lend",
            quantity: 200.34,
            value: 200.4,
            interest: 0.3,
          },
      ];
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-[10px]">
        <thead className="bg-black/10 h-[39px] rounded-t-[5px] font-medium text-left">
          <tr>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Transaction Type
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Quantity
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Value($)
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Interest
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white/5 text-xs">
          {data.map((item, index) => (
            <tr key={index}>
              <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                {item.type}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                {item.quantity}M
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                ${item.value}%
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                ${item.interest}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionHistory