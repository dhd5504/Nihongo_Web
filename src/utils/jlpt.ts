export type JLPT = (typeof jlpt)[number];

const jlpt = [
  { name: "N1" },
  { name: "N2" }, 
  { name: "N3"}, 
  { name: "N4"}, 
  { name: "N5"}, 
] as const;

export default jlpt;
