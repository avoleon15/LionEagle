// A name for a player who has not picked one yet: an animal, an adjective and two digits ("LeónPulgoso42").
// The longest combination (Zanate + Jardinero + 2 digits) is 17 letters, so MAX_NICK must stay at 17 or more.
const ANIMALS = ['León', 'Topo', 'Zanate', 'Jaguar', 'Tigre', 'Ratón']
const TRAITS = ['Pulgoso', 'Jardinero', 'Ciego', 'Comelón', 'Peludo', 'Lampiño']
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]

export const randomNick = () => `${pick(ANIMALS)}${pick(TRAITS)}${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`

/** Lets a long name wrap between its words ("JaguarJardinero00" -> "Jaguar" / "Jardinero00") instead of in the middle of one. */
export const softBreaks = (nick: string) => nick.replace(/([a-záéíóúñü])([A-ZÁÉÍÓÚÑÜ])/g, '$1\u200B$2')
