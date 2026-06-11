// Calculate attendance percentage
export const calcPercentage = (attended, total) => {
  if (total === 0) return 0;
  return parseFloat(((attended / total) * 100).toFixed(2));
};

// Calculate safe bunks (classes can bunk while staying at/above 75%)
export const calcSafeBunks = (attended, total) => {
  const safe = Math.floor(attended / 0.75 - total);
  return safe > 0 ? safe : 0;
};

// Calculate classes needed to reach 75%
export const calcClassesNeeded = (attended, total) => {
  const needed = Math.ceil((0.75 * total - attended) / 0.25);
  return needed > 0 ? needed : 0;
};

// Get status color class based on percentage
export const getStatusColor = (percentage) => {
  if (percentage >= 85) return 'text-emerald-400';
  if (percentage >= 75) return 'text-green-400';
  if (percentage >= 60) return 'text-amber-400';
  return 'text-red-400';
};

export const getProgressColor = (percentage) => {
  if (percentage >= 85) return 'bg-emerald-500';
  if (percentage >= 75) return 'bg-green-500';
  if (percentage >= 60) return 'bg-amber-500';
  return 'bg-red-500';
};

export const getGlowColor = (percentage) => {
  if (percentage >= 85) return 'shadow-emerald-500/30';
  if (percentage >= 75) return 'shadow-green-500/30';
  if (percentage >= 60) return 'shadow-amber-500/30';
  return 'shadow-red-500/30';
};

// Motivational quotes
export const quotes = [
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.", author: "Malcolm X" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Don't let what you cannot do interfere with what you can do.", author: "John Wooden" },
  { text: "Your attendance today is your success tomorrow. Stay consistent!", author: "Raunak Chirania" },
  { text: "Every class you attend brings you one step closer to your goal.", author: "Raunak Chirania" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Imagination is a power we cannot imagine.", author: "Raunak Chirania" },
  { text: "Study hard today for better tomorrow.", author: "Don't Know" },
];

export const getRandomQuote = () => quotes[Math.floor(Math.random() * quotes.length)];

// Format date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).format(date || new Date());
};

// Get greeting based on time
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};
