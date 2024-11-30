import BN from 'bn.js';
export const searchResources = async ({
  resources,
  search,
}: {
  search: string;
  resources: any;
}) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const lowerCaseSearch = search.toLocaleLowerCase();

  return resources.filter((resource: any) =>
    Object.values(resource).some(
      (value) =>
        typeof value === "string" &&
        value.toLocaleLowerCase().includes(lowerCaseSearch),
    ),
  );
};


export const formatCurrency = (currency: number) => {
  let amount = currency / 1e18;
  return amount || 0;
}


export const formatDate = (isoString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", options);
}

export const formatDate1 = (timestamp: number): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",  
    day: "2-digit",   
    month: "short",    
    year: "numeric",     
    hour: "2-digit",      
    minute: "2-digit",   
    hour12: true,        
    timeZone: "UTC",     
    timeZoneName: "short" 
  };

  const date = new Date(
    timestamp.toString().length === 10 ? timestamp * 1000 : timestamp
  );

  if (isNaN(date.getTime())) {
    console.error("Invalid timestamp:", timestamp);
    return "Invalid Date";
  }

  return date.toLocaleString("en-US", options);
};

export const felt252ToHex = (feltValue: any) => {
  // Check if the input is a valid FELT252 integer
  const MAX_FELT252_VALUE = BigInt(2 ** 252) - BigInt(1);

  if (typeof feltValue !== "bigint" && typeof feltValue !== "number") {
    throw new Error("Invalid input type. Expected a BigInt or Number.");
  }

  const bigIntValue = BigInt(feltValue);
  
  if (bigIntValue < 0 || bigIntValue > MAX_FELT252_VALUE) {
    throw new Error("Input is out of range for FELT252.");
  }

  // Convert to hexadecimal and return, removing the '0x' prefix
  return "0x" + bigIntValue.toString(16);
};


function asciiToHex(str: string) {
  if (typeof str !== 'string') {
      throw new TypeError('Input must be a string');
  }
  return '0x' + Buffer.from(str).toString('hex');
}


export function toHex(value: string) {
  if (typeof value !== 'string') {
    throw new TypeError('Input must be a string');
  }
  if (value.length === 0) return '';
  // Strict hex format validation
  if (/^0x[0-9a-fA-F]+$/.test(value)) {
        return value;
    }

  // Strict numeric validation
  if (/^[0-9]+$/.test(value)) {
      try {
          const bnValue = new BN(value, 10);
          // Pad to 32 bytes (64 hex characters) for Ethereum compatibility
            const hex = bnValue.toString(16);
            const paddedHex = hex.padStart(64, '');
            return `0x${paddedHex}`;
      } catch (error) {
          throw new Error(`Invalid numeric value: ${value}`);
      }
    }
    return asciiToHex(value);
  }

  export function TokentoHex(value: string) {
    if (typeof value !== 'string') {
      throw new TypeError('Input must be a string');
    }
    if (value.length === 0) return '';
    // Strict hex format validation
    if (/^0x[0-9a-fA-F]+$/.test(value)) {
          return value;
      }
  
    // Strict numeric validation
    if (/^[0-9]+$/.test(value)) {
        try {
            const bnValue = new BN(value, 10);
            // Pad to 32 bytes (64 hex characters) for Ethereum compatibility
              const hex = bnValue.toString(16);
              const paddedHex = hex.padStart(64, '0');
              return `0x${paddedHex}`;
        } catch (error) {
            throw new Error(`Invalid numeric value: ${value}`);
        }
      }
      return asciiToHex(value);
    }

  let cachedPrices: any = null;
  let lastFetchTime = 0;
  
  export async function getCryptoPrices() {
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    const now = Date.now();
  
    // Check if we have recent cached data (within the last hour)
    if (cachedPrices && now - lastFetchTime < oneHour) {
      return cachedPrices;
    }
  
    // If cached data is outdated or doesn't exist, fetch new data
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,starknet&vs_currencies=usd');
      const data = await response.json();
  
      // Update the cache with new data and timestamp
      cachedPrices = {
        eth: data?.ethereum?.usd ?? 3500,
        strk: data?.starknet?.usd ?? 0.62,
      };
      lastFetchTime = now;
  
      return cachedPrices;
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
  
      // Return cached data if available, or fallback if no cache exists
      return cachedPrices || { eth: 0, strk: 0 };
    }
  }
  
  export function removeQuotesAndConvert(value: any) {
    // Remove surrounding single or double quotes if present
    const cleanedValue = value.trim().replace(/^['"]|['"]$/g, '');

    // Check if it looks like a hex value (starts with 0x or contains only valid hex chars)
    if (/^0x[0-9a-fA-F]+$/.test(cleanedValue)) {
        return cleanedValue; // Return as-is, it's a valid hex string
    }

    // Try to convert to number (int or float)
    if (!isNaN(cleanedValue)) {
        return cleanedValue.includes('.') ? parseFloat(cleanedValue) : parseInt(cleanedValue, 10);
    }

    return cleanedValue; // Return original if not a number or hex
}

export function stringToFelt(str: any) {
  const encoder = new TextEncoder(); // For encoding strings to bytes
  const utf8Bytes = encoder.encode(str); // Encode string to UTF-8 bytes
  let feltValue = BigInt(0);

  for (let i = 0; i < utf8Bytes.length; i++) {
    feltValue = feltValue * BigInt(256) + BigInt(utf8Bytes[i]); // Convert byte-by-byte
  }

  return feltValue.toString();
}
