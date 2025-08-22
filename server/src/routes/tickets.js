import express from 'express';
import { z } from 'zod';
import Ticket from '../models/Ticket.js';
import AgentSuggestion from '../models/AgentSuggestion.js';
import AuditLog from '../models/AuditLog.js';
import { authRequired } from '../middleware/auth.js';
import { newTraceId } from '../utils/trace.js';
import { triage as stubTriage } from '../agent/stub.js';
import { AUTO_CLOSE_ENABLED, CONFIDENCE_THRESHOLD } from '../config.js';

const router = express.Router();

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['billing','tech','shipping','other']).optional()
});

router.post('/', authRequired(['user','agent','admin']), async (req, res, next) => {
  try {
    const { title, description, category } = createSchema.parse(req.body);
    const traceId = newTraceId();
    const ticket = await Ticket.create({ title, description, category: category || 'other', createdBy: req.user.sub });
    await AuditLog.create({ ticketId: ticket._id, traceId, actor: 'user', action: 'TICKET_CREATED', meta: {}, timestamp: new Date() });

    const triaged = await stubTriage(ticket);
    await AuditLog.create({ ticketId: ticket._id, traceId, actor: 'system', action: 'AGENT_CLASSIFIED', meta: { predictedCategory: triaged.predictedCategory, confidence: triaged.confidence }, timestamp: new Date() });

    const suggestion = await AgentSuggestion.create({
      ticketId: ticket._id,
      predictedCategory: triaged.predictedCategory,
      articleIds: triaged.articles.map(a => a._id),
      draftReply: triaged.draftReply,
      confidence: triaged.confidence,
      autoClosed: false,
      modelInfo: triaged.modelInfo
    });

    await AuditLog.create({ ticketId: ticket._id, traceId, actor: 'system', action: 'KB_RETRIEVED', meta: { articleIds: suggestion.articleIds }, timestamp: new Date() });
    await AuditLog.create({ ticketId: ticket._id, traceId, actor: 'system', action: 'DRAFT_GENERATED', meta: { suggestionId: suggestion._id }, timestamp: new Date() });

    let status = 'waiting_human';
    let autoClosed = false;
    if (AUTO_CLOSE_ENABLED && triaged.confidence >= CONFIDENCE_THRESHOLD) {
      status = 'resolved';
      autoClosed = true;
      await AuditLog.create({ ticketId: ticket._id, traceId, actor: 'system', action: 'AUTO_CLOSED', meta: { suggestionId: suggestion._id }, timestamp: new Date() });
    } else {
      await AuditLog.create({ ticketId: ticket._id, traceId, actor: 'system', action: 'ASSIGNED_TO_HUMAN', meta: {}, timestamp: new Date() });
    }

    ticket.status = status;
    ticket.agentSuggestionId = suggestion._id;
    await ticket.save();

    suggestion.autoClosed = autoClosed;
    await suggestion.save();

    res.status(201).json({ ticket, suggestion });
  } catch (e) { next(e); }
});

// ... GET list, GET by id, POST reply endpoints (as in scaffold)

export default router;
