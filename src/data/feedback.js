// UI metadata for the feedback section. The actual feedback now lives in
// Nhost (see nhost/seed.sql). This file only holds the two stream types.

export const feedbackTypes = {
  improvement: { label: 'Improvement', hint: 'How to make it better', accent: 'text-spark', dot: 'bg-spark' },
  feedback: { label: 'Feedback', hint: 'Thoughts, bugs, praise', accent: 'text-iris-300', dot: 'bg-iris-400' }
}
