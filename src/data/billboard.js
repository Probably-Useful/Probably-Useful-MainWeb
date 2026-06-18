// UI metadata for the billboard. The actual ideas now live in Nhost
// (see nhost/seed.sql for the initial data). This file only holds
// presentation maps and the anonymous-handle word lists.

// Builder response states you can set on any idea (from the admin panel).
export const builderStatuses = {
  considering: { label: 'Liked · considering', emoji: '👀', dot: 'bg-iris-400', text: 'text-iris-300', ring: 'border-iris-400/40' },
  planned: { label: 'Planned', emoji: '📌', dot: 'bg-amber-400', text: 'text-amber-300', ring: 'border-amber-400/40' },
  building: { label: 'Building now', emoji: '🔨', dot: 'bg-spark', text: 'text-spark', ring: 'border-spark/40' },
  shipped: { label: 'Shipped', emoji: '🚀', dot: 'bg-emerald-400', text: 'text-emerald-300', ring: 'border-emerald-400/40' }
}

// adjective + animal → friendly anonymous handles (probably-fox, ...)
export const handleParts = {
  adjectives: ['quiet', 'brave', 'lucky', 'tiny', 'clever', 'calm', 'swift', 'odd', 'keen', 'warm'],
  animals: ['fox', 'wren', 'otter', 'lynx', 'heron', 'sable', 'moth', 'koi', 'crow', 'ibex']
}
