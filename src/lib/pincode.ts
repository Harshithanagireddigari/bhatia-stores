// Indian Pincode location lookup and delivery validation helper

interface PincodeData {
  pincode: string;
  city: string;
  district: string;
  state: string;
  deliverable: boolean;
  estimatedDays: string;
}

// Comprehensive mapping of major Indian postal regions and pincode prefixes
const PINCODE_PREFIX_MAP: Record<string, { city: string; district: string; state: string; days: string }> = {
  // Delhi NCR & Northern Hubs
  "110": { city: "New Delhi", district: "Central Delhi", state: "Delhi", days: "2-3 business days" },
  "121": { city: "Faridabad", district: "Faridabad", state: "Haryana", days: "2-3 business days" },
  "122": { city: "Gurugram", district: "Gurgaon", state: "Haryana", days: "2-3 business days" },
  "201": { city: "Noida / Ghaziabad", district: "Gautam Buddha Nagar", state: "Uttar Pradesh", days: "2-3 business days" },
  "141": { city: "Ludhiana", district: "Ludhiana", state: "Punjab", days: "3-4 business days" },
  "143": { city: "Amritsar", district: "Amritsar", state: "Punjab", days: "3-4 business days" },
  "160": { city: "Chandigarh", district: "Chandigarh", state: "Chandigarh", days: "2-3 business days" },
  "302": { city: "Jaipur", district: "Jaipur", state: "Rajasthan", days: "3-4 business days" },
  "342": { city: "Jodhpur", district: "Jodhpur", state: "Rajasthan", days: "3-5 business days" },
  "313": { city: "Udaipur", district: "Udaipur", state: "Rajasthan", days: "3-5 business days" },

  // Uttar Pradesh & Central Hubs
  "226": { city: "Lucknow", district: "Lucknow", state: "Uttar Pradesh", days: "2-4 business days" },
  "208": { city: "Kanpur", district: "Kanpur Nagar", state: "Uttar Pradesh", days: "2-4 business days" },
  "221": { city: "Varanasi", district: "Varanasi", state: "Uttar Pradesh", days: "3-4 business days" },
  "211": { city: "Prayagraj", district: "Prayagraj", state: "Uttar Pradesh", days: "3-4 business days" },
  "282": { city: "Agra", district: "Agra", state: "Uttar Pradesh", days: "2-4 business days" },
  "248": { city: "Dehradun", district: "Dehradun", state: "Uttarakhand", days: "3-4 business days" },

  // Western Hubs (Maharashtra & Gujarat)
  "400": { city: "Mumbai", district: "Mumbai City", state: "Maharashtra", days: "2-4 business days" },
  "411": { city: "Pune", district: "Pune", state: "Maharashtra", days: "2-4 business days" },
  "440": { city: "Nagpur", district: "Nagpur", state: "Maharashtra", days: "3-4 business days" },
  "380": { city: "Ahmedabad", district: "Ahmedabad", state: "Gujarat", days: "2-3 business days" },
  "395": { city: "Surat", district: "Surat", state: "Gujarat", days: "2-4 business days" },
  "390": { city: "Vadodara", district: "Vadodara", state: "Gujarat", days: "2-4 business days" },
  "360": { city: "Rajkot", district: "Rajkot", state: "Gujarat", days: "2-4 business days" },
  "363": { city: "Morbi", district: "Morbi", state: "Gujarat", days: "1-2 business days" }, // Ceramic tile capital!

  // Southern Hubs
  "560": { city: "Bengaluru", district: "Bengaluru Urban", state: "Karnataka", days: "3-4 business days" },
  "500": { city: "Hyderabad", district: "Hyderabad", state: "Telangana", days: "3-4 business days" },
  "600": { city: "Chennai", district: "Chennai", state: "Tamil Nadu", days: "3-5 business days" },
  "641": { city: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", days: "4-5 business days" },
  "682": { city: "Kochi", district: "Ernakulam", state: "Kerala", days: "4-5 business days" },
  "695": { city: "Thiruvananthapuram", district: "Thiruvananthapuram", state: "Kerala", days: "4-5 business days" },

  // Eastern & Central Hubs
  "700": { city: "Kolkata", district: "Kolkata", state: "West Bengal", days: "3-5 business days" },
  "800": { city: "Patna", district: "Patna", state: "Bihar", days: "3-5 business days" },
  "751": { city: "Bhubaneswar", district: "Khordha", state: "Odisha", days: "3-5 business days" },
  "462": { city: "Bhopal", district: "Bhopal", state: "Madhya Pradesh", days: "3-4 business days" },
  "452": { city: "Indore", district: "Indore", state: "Madhya Pradesh", days: "3-4 business days" },
  "492": { city: "Raipur", district: "Raipur", state: "Chhattisgarh", days: "3-5 business days" },
  "834": { city: "Ranchi", district: "Ranchi", state: "Jharkhand", days: "3-5 business days" },
  "781": { city: "Guwahati", district: "Kamrup Metropolitan", state: "Assam", days: "4-6 business days" },
};

// General state mapping by first 2 digits
const TWO_DIGIT_STATE_MAP: Record<string, string> = {
  "11": "Delhi",
  "12": "Haryana",
  "13": "Haryana",
  "14": "Punjab",
  "15": "Punjab",
  "16": "Chandigarh",
  "17": "Himachal Pradesh",
  "18": "Jammu and Kashmir",
  "19": "Jammu and Kashmir",
  "20": "Uttar Pradesh",
  "21": "Uttar Pradesh",
  "22": "Uttar Pradesh",
  "23": "Uttar Pradesh",
  "24": "Uttar Pradesh",
  "25": "Uttar Pradesh",
  "26": "Uttar Pradesh",
  "27": "Uttar Pradesh",
  "28": "Uttar Pradesh",
  "30": "Rajasthan",
  "31": "Rajasthan",
  "32": "Rajasthan",
  "33": "Rajasthan",
  "34": "Rajasthan",
  "36": "Gujarat",
  "37": "Gujarat",
  "38": "Gujarat",
  "39": "Gujarat",
  "40": "Maharashtra",
  "41": "Maharashtra",
  "42": "Maharashtra",
  "43": "Maharashtra",
  "44": "Maharashtra",
  "45": "Madhya Pradesh",
  "46": "Madhya Pradesh",
  "47": "Madhya Pradesh",
  "48": "Madhya Pradesh",
  "49": "Chhattisgarh",
  "50": "Telangana",
  "51": "Andhra Pradesh",
  "52": "Andhra Pradesh",
  "53": "Andhra Pradesh",
  "56": "Karnataka",
  "57": "Karnataka",
  "58": "Karnataka",
  "59": "Karnataka",
  "60": "Tamil Nadu",
  "61": "Tamil Nadu",
  "62": "Tamil Nadu",
  "63": "Tamil Nadu",
  "64": "Tamil Nadu",
  "67": "Kerala",
  "68": "Kerala",
  "69": "Kerala",
  "70": "West Bengal",
  "71": "West Bengal",
  "72": "West Bengal",
  "73": "West Bengal",
  "74": "West Bengal",
  "75": "Odisha",
  "76": "Odisha",
  "77": "Odisha",
  "78": "Assam",
  "79": "North Eastern States",
  "80": "Bihar",
  "81": "Bihar",
  "82": "Jharkhand",
  "83": "Jharkhand",
  "84": "Bihar",
  "85": "Bihar",
};

export function lookupPincode(pincode: string): PincodeData | null {
  const cleanPin = pincode.replace(/\D/g, "");

  if (cleanPin.length !== 6) {
    return null;
  }

  // First digit of Indian pincode must be 1 to 9 (0 is invalid)
  const firstDigit = parseInt(cleanPin[0], 10);
  if (isNaN(firstDigit) || firstDigit < 1 || firstDigit > 9) {
    return null;
  }

  // Check 3-digit prefix
  const prefix3 = cleanPin.substring(0, 3);
  if (PINCODE_PREFIX_MAP[prefix3]) {
    const loc = PINCODE_PREFIX_MAP[prefix3];
    return {
      pincode: cleanPin,
      city: loc.city,
      district: loc.district,
      state: loc.state,
      deliverable: true,
      estimatedDays: loc.days,
    };
  }

  // Check 2-digit prefix state
  const prefix2 = cleanPin.substring(0, 2);
  const state = TWO_DIGIT_STATE_MAP[prefix2];

  if (state) {
    return {
      pincode: cleanPin,
      city: state,
      district: state,
      state,
      deliverable: true,
      estimatedDays: "3-5 business days",
    };
  }

  // Non-deliverable or invalid area
  return {
    pincode: cleanPin,
    city: "Unknown Area",
    district: "Unknown District",
    state: "India",
    deliverable: false,
    estimatedDays: "Unavailable",
  };
}
