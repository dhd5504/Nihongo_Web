export type Language = (typeof languages)[number];

const languages = [
  { name: "English", nativeName: "English", viewBox: "0 0 82 66", code: "en" },
  {
    name: "Japanese",nativeName: "日本語",viewBox: "0 264 82 66",code: "ja",},
  {
    name: "Vietnamese",nativeName: "Tiếng Việt",viewBox: "0 1188 82 66",code: "vi",
  },
  
] as const;

export default languages;
