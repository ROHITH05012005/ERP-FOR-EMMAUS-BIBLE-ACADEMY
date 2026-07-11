/**
 * Generates an array of Sunday dates (YYYY-MM-DD) starting from July 5, 2026.
 * It generates dates up to the current date (plus a few future weeks just in case).
 */
export const getSundays = () => {
  const startDate = new Date('2026-07-05T00:00:00'); // Ensure time is 00:00 to avoid timezone shifts
  const sundays = [];
  let current = new Date(startDate);
  
  // Generate exactly 52 weeks (1 year)
  for (let i = 0; i < 52; i++) {
    // Format to YYYY-MM-DD safely
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    
    sundays.push(`${year}-${month}-${day}`);
    
    // Add 7 days
    current.setDate(current.getDate() + 7);
  }
  
  // Return in descending order (most recent first in the dropdown)
  return sundays.reverse();
};

/**
 * Gets the most recent Sunday from today's date (or today if it is a Sunday), 
 * constrained to be >= 2026-07-05.
 */
export const getMostRecentSunday = () => {
  const sundays = getSundays();
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  // Find the first Sunday that is <= today String
  const recent = sundays.find(s => s <= todayString);
  return recent || sundays[sundays.length - 1]; // Fallback to the first date (2026-07-05) if today is before it
};
