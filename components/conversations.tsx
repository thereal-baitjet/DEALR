'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Flag, Handshake, MessageCircle, RefreshCw, Send, Shield, Sparkles } from 'lucide-react';
import { request, useRemote } from '@/lib/client';
import type { Conversation as ConversationData, Copilot, Dashboard } from '@/lib/contracts';
import type { OfferRecord } from '@/lib/deals';
import { offerTerms } from '@/lib/deals';
import { dollars, STAGES } from '@/lib/domain';
import { Gate, useSession } from './session';
import { Button, Empty, ErrorNotice, Field, Loading, Modal } from './ui';
import { LeadList } from './dashboard';

function timestamp(value: string) { return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
export function Inbox() { return <div className="container"><Gate><InboxContent /></Gate></div>; }
function InboxContent() {
  const { state } = useSession();
  const result = useRemote<Dashboard>('dashboard', state.actor?.id);
  return <><div className="page-heading"><div><span className="eyebrow">KEEP THINGS MOVING</span><h1>Good things start with hello.</h1><p>Your inquiries, offers, and next steps, all together.</p></div><Button variant="secondary" onClick={result.reload} disabled={result.loading}><RefreshCw size={15} />Refresh</Button></div><section className="section">{result.loading ? <Loading /> : result.error ? <ErrorNotice>{result.error}</ErrorNotice> : result.data && <LeadList leads={result.data.leads} />}</section></>;
}
export function Conversation({ id }: { id: string }) { return <div className="container"><Gate><Thread key={id} id={id} /></Gate></div>; }

function Thread({ id }: { id: string }) {
  const { state, notify } = useSession();
  const result = useRemote<ConversationData>('conversations/' + id, state.actor?.id);
  const [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [report, setReport] = useState<string | null>(null), [brokerOpen, setBrokerOpen] = useState(false), [blockOpen, setBlockOpen] = useState(false);
  const latestMessage = result.data?.messages.at(-1)?.id;
  useEffect(() => {
    if (!latestMessage) return;
    void request('conversations/' + id + '/read', { messageId: latestMessage }).catch(() => {});
  }, [id, latestMessage, state.actor?.id]);
  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    try { await request('conversations/' + id + '/messages', { message }); setMessage(''); result.reload(); }
    catch (error) { setError((error as Error).message); } finally { setBusy(false); }
  }
  if (result.loading) return <Loading />;
  if (result.error || !result.data?.listing) return <Empty title="This conversation isn’t available." href="/messages" action="Back to messages">{result.error || 'Open a conversation from your inbox to continue.'}</Empty>;
  const data = result.data, listing = data.listing!, userId = state.actor!.id;
  const participant = [data.lead.buyer_id, data.lead.seller_id].includes(userId);
  const otherId = userId === data.lead.buyer_id ? data.lead.seller_id : data.lead.buyer_id;
  const blockedByMe = data.blockedByMe;
  return <>
    <div className="listing-breadcrumb"><Link href="/messages"><ArrowLeft size={15} />Messages</Link><span>/</span><span>{listing.title}</span></div>
    <div className="conversation-layout">
      <section className="thread-panel">
        <div className="thread-heading"><div><span className="eyebrow">{listing.category}</span><h1>{listing.title}</h1><Link href={'/listing/' + listing.id}>View listing · {dollars(listing.price)}<ArrowRight size={13} /></Link></div><Button variant="ghost" onClick={result.reload}><RefreshCw size={15} />Refresh</Button></div>
        <div className="message-stream" role="log" aria-label="Conversation messages">
          {!data.messages.length && <p className="notice">No messages yet. Start by asking about the listing or the proposed terms.</p>}
          {data.messages.map(item => <article className={'message-bubble ' + (item.actor_id === userId ? 'message-mine' : '')} key={item.id}><div><strong>{item.actor_id === userId ? 'You' : item.author}</strong><time dateTime={item.created_at}>{timestamp(item.created_at)}</time></div><p>{item.body}</p>{item.actor_id !== userId && <button className="message-report" aria-label={'Report message from ' + item.author} onClick={() => setReport(item.id)}><Flag size={12} />Report</button>}</article>)}
        </div>
        <form className="message-compose" onSubmit={send}><Field label="Your message"><textarea value={message} onChange={event => setMessage(event.target.value)} maxLength={3000} required placeholder="Ask a question. Share a detail. Move things forward." disabled={data.blocked} /></Field>{data.blocked && <p className="notice">Messaging is unavailable while either participant has blocked the other.</p>}{error && <ErrorNotice>{error}</ErrorNotice>}<div className="inline"><small>{message.length}/3,000 · Refresh to see new replies.</small><Button type="submit" disabled={busy || !message.trim() || data.blocked}>{busy ? 'Sending…' : 'Send message'}<Send size={15} /></Button></div></form>
      </section>
      <aside className="deal-sidebar">
        <section className="panel"><div className="section-heading"><h2><Handshake size={20} />Offers & negotiation</h2></div><p className="small muted">Offers are for discussion. No payment or binding contract is created here.</p>{data.offers.length ? data.offers.map(offer => <OfferCard key={offer.id + ':' + offer.status + ':' + offer.history.length} offer={offer} userId={userId} buyerId={data.lead.buyer_id} sellerId={data.lead.seller_id} category={listing.category} onChange={result.reload} />) : <p className="notice">No offers yet. The next move can start with a question.</p>}{userId === data.lead.buyer_id && listing.transaction_type !== 'Wanted' && <Button asChild variant="secondary" className="full-width"><Link href={'/listing/' + listing.id}>Open listing to make an offer<ArrowRight size={14} /></Link></Button>}</section>
        <section className="panel"><h2>Need another perspective?</h2>{data.lead.broker_id ? <><p className="small">Broker assistance is assigned to this conversation.</p><span className="badge">{data.lead.stage}</span></> : <><p className="small">Bring an available broker into this conversation. They will be able to review the listing, messages, offers, and buyer preferences.</p>{participant && <Button variant="secondary" onClick={() => setBrokerOpen(true)}><Handshake size={15} />Request broker help</Button>}</>}</section>
        {data.lead.broker_id === userId && <BrokerTools data={data} reload={result.reload} />}
        {participant && <Button variant="ghost" onClick={() => setBlockOpen(true)}><Shield size={15} />{blockedByMe ? 'Unblock this account' : 'Block this account'}</Button>}
      </aside>
    </div>
    <Modal open={brokerOpen} onOpenChange={setBrokerOpen} title="Bring a broker into the conversation." description="The selected broker can access this conversation and the buyer’s saved preferences.">{state.brokers.length ? <form className="stack" onSubmit={async event => { event.preventDefault(); setBusy(true); const form = new FormData(event.currentTarget); try { await request('conversations/' + id + '/broker', { brokerId: form.get('brokerId') }); setBrokerOpen(false); result.reload(); notify('Broker assistance requested.'); } catch (error) { notify((error as Error).message); } finally { setBusy(false); } }}><Field label="Available broker"><select name="brokerId">{state.brokers.map(broker => <option key={broker.id} value={broker.id}>{broker.name} · {broker.location || 'Location not listed'}</option>)}</select></Field><Button type="submit" disabled={busy}>Share conversation and request help</Button></form> : <p>No brokers are available in this marketplace yet. You can continue directly with the other participant.</p>}</Modal>
    <Modal open={Boolean(report)} onOpenChange={open => { if (!open) setReport(null); }} title="Report a message." description="Explain what the marketplace administrator should review."><form className="stack" onSubmit={async event => { event.preventDefault(); setBusy(true); const form = new FormData(event.currentTarget); try { await request('reports', { targetType: 'message', targetId: report, reason: form.get('reason') }); setReport(null); notify('Report submitted for review.'); } catch (error) { notify((error as Error).message); } finally { setBusy(false); } }}><Field label="Reason"><textarea name="reason" minLength={10} maxLength={1500} required /></Field><Button type="submit" disabled={busy}>Submit report</Button></form></Modal>
    <Modal open={blockOpen} onOpenChange={setBlockOpen} title={blockedByMe ? 'Unblock this account?' : 'Block this account?'} description="Blocking prevents new messages and inquiries between these two accounts. Existing records remain available."><Button variant={blockedByMe ? 'primary' : 'danger'} disabled={busy} onClick={async () => { setBusy(true); try { await request('blocks', { actorId: otherId, blocked: !blockedByMe }); setBlockOpen(false); result.reload(); notify(blockedByMe ? 'Account unblocked.' : 'Account blocked.'); } catch (error) { notify((error as Error).message); } finally { setBusy(false); } }}>{blockedByMe ? 'Unblock account' : 'Block account'}</Button></Modal>
  </>;
}

function OfferCard({ offer, userId, buyerId, sellerId, category, onChange }: { offer: OfferRecord; userId: string; buyerId: string; sellerId: string; category: string; onChange: () => void }) {
  const terms = offerTerms(offer), { notify } = useSession();
  const [action, setAction] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const party = [buyerId, sellerId].includes(userId), canRespond = party && terms.proposer !== userId && !terms.closed && !terms.expired;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); const form = new FormData(event.currentTarget);
    try { await request('offers/' + offer.id, { action, ...(action === 'COUNTER' ? { amount: form.get('amount') } : {}), message: form.get('message') || '', expectedHistoryId: terms.version }); setAction(''); onChange(); notify(action === 'ACCEPT_FOR_DISCUSSION' ? 'Accepted for discussion. Agree on the final terms separately.' : 'Offer response saved.'); }
    catch (error) { setError((error as Error).message); } finally { setBusy(false); }
  }
  return <article className="offer-card"><div className="inline"><span className="badge badge-neutral">{terms.expired && !terms.closed ? 'EXPIRED' : offer.status.replaceAll('_', ' ')}</span><time dateTime={offer.created_at}>{timestamp(offer.created_at)}</time></div><h3>{dollars(terms.amount)}<small>{terms.countered ? 'Latest counteroffer' : 'Original offer'}</small></h3>{terms.countered && <p className="small muted">Original offer: {dollars(offer.price)}</p>}{offer.message && <p className="small description">{offer.message}</p>}{category === 'Businesses' && <p className="small muted">Original terms: {dollars(offer.cash)} cash + {dollars(offer.financing)} financing · {offer.days} days diligence.{terms.countered && ' Reconfirm the financing structure for the new amount.'}</p>}{offer.requested_date && <p className="small">Requested date: {offer.requested_date}</p>}{offer.expires_at && <p className="small">Expires: {timestamp(offer.expires_at)}</p>}{offer.history.length > 0 && <details className="offer-history"><summary>Negotiation history ({offer.history.length})</summary>{offer.history.map(item => <div key={item.id}><strong>{item.author} · {item.action.replaceAll('_', ' ')}</strong>{item.amount !== null && <span>{dollars(item.amount)}</span>}{item.message && <p>{item.message}</p>}<time dateTime={item.created_at}>{timestamp(item.created_at)}</time></div>)}</details>}{party && !terms.closed && !terms.expired && <div className="offer-actions">{canRespond && <><Button variant="secondary" onClick={() => { setError(''); setAction('COUNTER'); }}>Counter</Button><Button variant="ghost" onClick={() => { setError(''); setAction('ACCEPT_FOR_DISCUSSION'); }}>Accept for discussion</Button></>}{userId === sellerId && <Button variant="ghost" onClick={() => { setError(''); setAction('DECLINE'); }}>Decline</Button>}{userId === buyerId && <Button variant="ghost" onClick={() => { setError(''); setAction('WITHDRAW'); }}>Withdraw</Button>}</div>}<Modal open={Boolean(action)} onOpenChange={open => { if (!open) setAction(''); }} title={action === 'COUNTER' ? 'Propose a counteroffer.' : action === 'ACCEPT_FOR_DISCUSSION' ? 'Accept for discussion?' : action === 'WITHDRAW' ? 'Withdraw your offer?' : 'Decline this offer?'} description={'Current amount: ' + dollars(terms.amount) + '. This action does not create a binding agreement.'}><form className="stack" onSubmit={submit}>{action === 'COUNTER' && <Field label="Counteroffer ($)"><input name="amount" inputMode="decimal" required defaultValue={terms.amount / 100} /></Field>}<Field label="Message (optional)"><textarea name="message" maxLength={3000} /></Field>{error && <ErrorNotice>{error}</ErrorNotice>}<Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Confirm response'}</Button></form></Modal></article>;
}

function BrokerTools({ data, reload }: { data: ConversationData; reload: () => void }) {
  const { state, notify } = useSession(), [busy, setBusy] = useState(false), [stage, setStage] = useState('');
  const result = useRemote<Copilot>('conversations/' + data.lead.id + '/copilot', state.actor?.id);
  const currentIndex = STAGES.indexOf(data.lead.stage as typeof STAGES[number]);
  const nextStage = !['WON', 'LOST'].includes(data.lead.stage) ? STAGES[currentIndex + 1] : null;
  return <><section className="panel copilot-panel"><span className="eyebrow"><Sparkles size={13} />BROKER COPILOT</span><h2>A clear next step.</h2>{result.loading ? <Loading /> : result.error ? <ErrorNotice>{result.error}</ErrorNotice> : result.data && <><dl className="deal-metrics"><div><dt>Asking</dt><dd>{dollars(result.data.asking)}</dd></div><div><dt>Latest proposed amount</dt><dd>{dollars(result.data.offer === null ? null : Number(result.data.offer))}</dd></div><div><dt>Gap</dt><dd>{dollars(result.data.gap)}</dd></div><div><dt>Illustrative fee ({result.data.commissionBps / 100}%)</dt><dd>{dollars(result.data.commission)}</dd></div></dl><p>{result.data.suggestion}</p><small>{result.data.notice}</small></>}<details className="buyer-details"><summary>Buyer preferences & match</summary><p>{data.buyer?.name}</p><p className="small">Budget: {dollars(data.profile.budget)} · Cash: {dollars(data.profile.cash)}</p><p className="small">{data.profile.location || 'No preferred location recorded.'}</p>{data.match.reasons.map(reason => <p className="small" key={reason}>{reason}</p>)}</details></section><section className="panel"><h2>Keep the deal moving.</h2><span className="badge">{data.lead.stage}</span>{nextStage && <div className="stack stage-actions"><Button disabled={busy} onClick={() => setStage(nextStage)}>Move to {nextStage.toLowerCase()}<ArrowRight size={14} /></Button><Button variant="ghost" disabled={busy} onClick={() => setStage('LOST')}>Mark as lost</Button></div>}{data.events.length > 0 && <details className="offer-history"><summary>Stage history</summary>{data.events.map(event => <div key={event.id}><strong>{event.from_stage} → {event.to_stage}</strong><time dateTime={event.created_at}>{timestamp(event.created_at)}</time></div>)}</details>}</section><Modal open={Boolean(stage)} onOpenChange={open => { if (!open) setStage(''); }} title={'Move deal to ' + stage.toLowerCase() + '?'} description="This records your manual assessment of progress. It does not accept an offer or execute a transaction."><Button disabled={busy} onClick={async () => { setBusy(true); try { await request('conversations/' + data.lead.id + '/stage', { fromStage: data.lead.stage, stage }); setStage(''); reload(); notify('Deal stage updated.'); } catch (error) { notify((error as Error).message); reload(); } finally { setBusy(false); } }}>Confirm stage</Button></Modal></>;
}
