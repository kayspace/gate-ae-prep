import type { ViewKey } from "@/types";

export type TourStep = {
  // value of a `data-tour="..."` attribute on the target element.
  // when omitted, the step renders as a centered modal with no spotlight.
  selector?: string;
  // switch to this view before locating the target.
  view?: ViewKey;
  // scroll the target into view after switching (used for the guide deep-link).
  scrollIntoView?: boolean;
  title: string;
  body: string;
};

export const tourSteps: TourStep[] = [
  {
    title: "welcome",
    body: "a 30-second tour of where things live. you can skip anytime with esc.",
  },
  {
    selector: "progress",
    title: "your progress",
    body: "topics ticked over total topics. the thin bar below tracks it live as you study.",
  },
  {
    selector: "theme",
    title: "light or dark",
    body: "toggle the theme anytime. your choice persists across refreshes.",
  },
  {
    selector: "tour-btn",
    title: "replay this tour",
    body: "click here whenever you want to walk through the app again.",
  },
  {
    selector: "nav",
    title: "six views",
    body: "syllabus, books, resources, revise, log, guide. click any tab to switch. each one has a distinct job.",
  },
  {
    selector: "yt-key",
    view: "resources",
    title: "youtube data api key",
    body: "paste a free key here to unlock playlist loading. it's stored only in your browser, never sent anywhere except google.",
  },
  {
    selector: "guide-yt-section",
    view: "guide",
    scrollIntoView: true,
    title: "full setup steps",
    body: "step-by-step instructions to create that api key live right here in the guide. come back anytime.",
  },
  {
    title: "you're set",
    body: "happy prepping. tick topics, watch videos, queue revisions, track progress. replay this tour from the header whenever you need.",
  },
];
