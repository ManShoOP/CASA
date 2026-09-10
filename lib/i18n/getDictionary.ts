import { getLocale } from "./actions";
import { dictionaries, Locale } from "./dictionaries";

export async function getDictionary() {
  const locale = (await getLocale()) as Locale;
  return dictionaries[locale] || dictionaries.en;
}
