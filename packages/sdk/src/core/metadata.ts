import type { ZodiacMetadata, ZodiacSign } from "./types.js";

export const ZODIAC_METADATA = [
  {
    sign: "aries",
    name: "Aries",
    glyph: "♈",
    element: "fire",
    modality: "cardinal",
    dateRange: { starts: "03-21", ends: "04-19" },
    assetLine: "Identity expressed through origin, force, and first movement."
  },
  {
    sign: "taurus",
    name: "Taurus",
    glyph: "♉",
    element: "earth",
    modality: "fixed",
    dateRange: { starts: "04-20", ends: "05-20" },
    assetLine: "Symbolic endurance carried through form, value, and continuity."
  },
  {
    sign: "gemini",
    name: "Gemini",
    glyph: "♊",
    element: "air",
    modality: "mutable",
    dateRange: { starts: "05-21", ends: "06-20" },
    assetLine: "Cultural memory shaped by language, duality, and exchange."
  },
  {
    sign: "cancer",
    name: "Cancer",
    glyph: "♋",
    element: "water",
    modality: "cardinal",
    dateRange: { starts: "06-21", ends: "07-22" },
    assetLine: "Ancestral identity held through protection, memory, and belonging."
  },
  {
    sign: "leo",
    name: "Leo",
    glyph: "♌",
    element: "fire",
    modality: "fixed",
    dateRange: { starts: "07-23", ends: "08-22" },
    assetLine: "Presence preserved through radiance, authorship, and recognition."
  },
  {
    sign: "virgo",
    name: "Virgo",
    glyph: "♍",
    element: "earth",
    modality: "mutable",
    dateRange: { starts: "08-23", ends: "09-22" },
    assetLine: "Order refined through craft, discernment, and devotion."
  },
  {
    sign: "libra",
    name: "Libra",
    glyph: "♎",
    element: "air",
    modality: "cardinal",
    dateRange: { starts: "09-23", ends: "10-22" },
    assetLine: "Balance recorded through relation, judgment, and proportion."
  },
  {
    sign: "scorpio",
    name: "Scorpio",
    glyph: "♏",
    element: "water",
    modality: "fixed",
    dateRange: { starts: "10-23", ends: "11-21" },
    assetLine: "Depth conserved through secrecy, transformation, and resolve."
  },
  {
    sign: "sagittarius",
    name: "Sagittarius",
    glyph: "♐",
    element: "fire",
    modality: "mutable",
    dateRange: { starts: "11-22", ends: "12-21" },
    assetLine: "Meaning extended through journey, doctrine, and horizon."
  },
  {
    sign: "capricorn",
    name: "Capricorn",
    glyph: "♑",
    element: "earth",
    modality: "cardinal",
    dateRange: { starts: "12-22", ends: "01-19" },
    assetLine: "Institutional memory carried through structure, time, and ascent."
  },
  {
    sign: "aquarius",
    name: "Aquarius",
    glyph: "♒",
    element: "air",
    modality: "fixed",
    dateRange: { starts: "01-20", ends: "02-18" },
    assetLine: "Collective identity formed through systems, distance, and invention."
  },
  {
    sign: "pisces",
    name: "Pisces",
    glyph: "♓",
    element: "water",
    modality: "mutable",
    dateRange: { starts: "02-19", ends: "03-20" },
    assetLine: "Symbolic continuity held through image, faith, and dissolution."
  }
] as const satisfies readonly ZodiacMetadata[];

const metadataBySign = new Map<ZodiacSign, ZodiacMetadata>(
  ZODIAC_METADATA.map((metadata) => [metadata.sign, metadata])
);

export function listZodiacMetadata(): readonly ZodiacMetadata[] {
  return ZODIAC_METADATA;
}

export function getZodiacMetadata(sign: ZodiacSign): ZodiacMetadata {
  const metadata = metadataBySign.get(sign);

  if (!metadata) {
    throw new Error(`Unknown zodiac sign: ${sign}`);
  }

  return metadata;
}
