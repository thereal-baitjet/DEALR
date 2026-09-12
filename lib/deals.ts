export type OfferHistory = {
  id: string; offer_id: string; actor_id: string; author: string;
  action: string; amount: number | null; message: string; created_at: string;
};
export type OfferRecord = {
  id: string; lead_id: string; buyer_id: string; price: number; cash: number;
  financing: number; days: number; message: string; expires_at: string | null;
  requested_date: string; status: string; created_at: string; history: OfferHistory[];
};
export type MessageRecord = { id: string; lead_id: string; actor_id: string; author: string; body: string; created_at: string };
export type StageEvent = { id: string; from_stage: string; to_stage: string; created_at: string };

export function offerTerms(offer: OfferRecord) {
  const counter = offer.history.filter(item => item.action === 'COUNTER').at(-1);
  const latest = offer.history.at(-1);
  return {
    amount: counter?.amount ?? offer.price,
    proposer: counter?.actor_id ?? offer.buyer_id,
    version: latest?.id ?? null,
    countered: Boolean(counter),
    expired: Boolean(offer.expires_at && Date.parse(offer.expires_at) <= Date.now()),
    closed: ['DECLINED', 'WITHDRAWN', 'ACCEPTED_FOR_DISCUSSION'].includes(offer.status),
  };
}
