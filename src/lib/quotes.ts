// daily quotes + milestone quotes. engineering / aerospace / stoic flavor.

export const DAILY_QUOTES: string[] = [
  "the engineer's first duty is to the truth, not to the deadline.",
  "a problem well stated is a problem half solved.",
  "every equation you understand is a small piece of the universe you own.",
  "rockets don't care how you feel. show up anyway.",
  "the day you stop learning is the day the field leaves you behind.",
  "first principles. always.",
  "you don't rise to your goals. you fall to your habits.",
  "the gap between knowing and doing is closed only by reps.",
  "drag is real. so is lift. choose what you generate today.",
  "no one ever drowned in sweat.",
  "small daily improvements compound into stunning results.",
  "the syllabus is finite. your time is too. respect both.",
  "discipline is choosing between what you want now and what you want most.",
  "if you can't explain it simply, you don't understand it well enough.",
  "study like the exam is tomorrow. live like it isn't.",
  "the expert in anything was once a beginner who refused to quit.",
  "you are not behind. you are exactly where consistency would have put you.",
  "the only easy day was yesterday.",
  "motivation gets you started. systems keep you going.",
  "don't break the chain.",
  "an hour of focused work beats a day of distracted study.",
  "the calm sea never made a skilled sailor.",
  "feynman: the first principle is that you must not fool yourself.",
  "von braun: research is what i'm doing when i don't know what i'm doing.",
  "kalam: dream is not what you see in sleep. it is what doesn't let you sleep.",
  "edison: genius is one percent inspiration, ninety-nine percent perspiration.",
  "every topic you skip today will find you in the exam hall.",
  "you don't need more time. you need fewer tabs.",
  "thrust over drag. effort over excuse.",
  "the syllabus shrinks every time you sit down. open it.",
];

export const MILESTONE_QUOTES: Record<25 | 50 | 75 | 100, string[]> = {
  25: [
    "a quarter of the way. the takeoff roll is the loudest part.",
    "twenty-five percent. momentum is a quiet thing until it isn't.",
    "the first quarter is the hardest. you cleared it.",
  ],
  50: [
    "halfway. the view from here is the rest of the climb.",
    "fifty percent. you are no longer starting. you are continuing.",
    "the second half is paid for by the first. keep going.",
  ],
  75: [
    "three quarters. the runway is behind you now.",
    "seventy-five percent. closer to done than to start.",
    "you are in the final stretch. don't decelerate.",
  ],
  100: [
    "complete. a section closed is a small forever.",
    "one hundred percent. carry this feeling into the next.",
    "done. now revise. then move.",
  ],
};

// pick a deterministic daily quote so the same quote shows all day.
export function getDailyQuote(date = new Date()): { quote: string; key: string } {
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return { quote: DAILY_QUOTES[h % DAILY_QUOTES.length], key };
}

export function pickMilestoneQuote(threshold: 25 | 50 | 75 | 100): string {
  const arr = MILESTONE_QUOTES[threshold];
  return arr[Math.floor(Math.random() * arr.length)];
}
