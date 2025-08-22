import Article from '../models/Article.js';

function keywordCategory(text) {
  const t = (text || '').toLowerCase();
  let cat = 'other', score = 0;
  const kw = [
    { c: 'billing', words: ['refund','invoice','charge','billing','payment'] },
    { c: 'tech', words: ['error','bug','stack','exception','crash','login'] },
    { c: 'shipping', words: ['delivery','shipment','shipping','package','courier','track'] }
  ];
  for (const k of kw) {
    let matches = 0;
    for (const w of k.words) if (t.includes(w)) matches++;
    if (matches > 0 && matches >= score) { cat = k.c; score = matches; }
  }
  const confidence = Math.min(1, 0.4 + score * 0.2);
  return { predictedCategory: cat, confidence };
}

export async function retrieveKB(query, limit = 3) {
  const text = (query || '').trim();
  if (!text) return [];
  const byText = await Article.find(
    { $text: { $search: text } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } }).limit(limit);

  if (byText.length) return byText;
  const regex = new RegExp(text.split(/\s+/).join('|'), 'i');
  return await Article.find({ $or: [{ title: regex }, { body: regex }, { tags: regex }] }).limit(limit);
}

export function draftReply(ticket, articles) {
  const cites = articles.map((a, i) => `${i+1}. ${a.title}`).join('\n');
  const refs = articles.map((a, i) => `[${i+1}]`).join(' ');
  const body = `Hello,

We reviewed your request: "${ticket.title}". Based on our knowledge base ${refs}, here are next steps:
- Please refer to the articles above and try the suggested steps.
- If this does not resolve the issue, reply to this ticket and an agent will assist you.

References:
${cites}

Regards,
Smart Helpdesk Bot`;
  return { draftReply: body, citations: articles.map(a => String(a._id)) };
}

export async function triage(ticket) {
  const start = Date.now();
  const classification = keywordCategory(`${ticket.title} ${ticket.description}`);
  const kb = await retrieveKB(`${ticket.title} ${ticket.description}`, 3);
  const drafted = draftReply(ticket, kb);
  const latencyMs = Date.now() - start;
  return {
    ...classification,
    articles: kb,
    draftReply: drafted.draftReply,
    citations: drafted.citations,
    modelInfo: { provider: 'stub', model: 'deterministic-v1', promptVersion: 'v1', latencyMs }
  };
}
