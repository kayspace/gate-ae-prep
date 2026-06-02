// recommended starter resources by section
import type { Resources } from "@/types";

export const DEFAULT_RESOURCES: Resources = {
  aptitude: [
    {
      id: "default-aptitude-youtube",
      title: "Aptitude playlist",
      url: "https://youtube.com/playlist?list=PLC36xJgs4dxE43Au1FGRQvwHTr7NbgDCS",
      kind: "playlist",
      source: "recommended",
    },
  ],
  math: [
    {
      id: "default-math-youtube",
      title: "Engineering Mathematics playlist",
      url: "https://youtube.com/playlist?list=PLvTTv60o7qj_tdY9zH7YceES7jfXiZkAz",
      kind: "playlist",
      source: "recommended",
    },
    {
      id: "default-math-vector",
      title: "Vector algebra playlist",
      url: "https://youtube.com/playlist?list=PLqjFFrfKcY5yy_1N4MpMZjUHrlqDLVYEh",
      kind: "playlist",
      source: "recommended",
    },
  ],
  aero: [
    {
      id: "default-aero-fluid",
      title: "Fluid mechanics playlist",
      url: "https://youtube.com/playlist?list=PL9RcWoqXmzaLnlGN39w2-1jyFyI_ALVa3",
      kind: "playlist",
      source: "recommended",
    },
  ],
  structures: [
    {
      id: "default-structures-som",
      title: "Strength of Materials playlist",
      url: "https://youtube.com/playlist?list=PL9RcWoqXmzaLlfmNg2Ku1SdZtvXnYrLbc",
      kind: "playlist",
      source: "recommended",
    },
    {
      id: "default-structures-som-topics",
      title: "SOM Topics Visualized playlist",
      url: "https://youtube.com/playlist?list=PLEYqyyrm-hQ1kTm4Ce5uQzsHG89fXsIa5",
      kind: "playlist",
      source: "recommended",
    },
  ],
};
