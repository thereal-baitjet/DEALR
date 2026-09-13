-- The hosted pooled-Postgres driver JSON-encoded values that were already JSON text, so jsonb columns
-- stored strings such as "[\"Local pickup\"]" instead of arrays and objects. Unwrap those values.
-- Only strings whose content is valid JSON are changed, so genuine string values are left alone.
UPDATE dealr.listings SET images = (images #>> '{}')::jsonb WHERE jsonb_typeof(images) = 'string' AND (images #>> '{}') IS JSON;
UPDATE dealr.listings SET attributes = (attributes #>> '{}')::jsonb WHERE jsonb_typeof(attributes) = 'string' AND (attributes #>> '{}') IS JSON;
UPDATE dealr.listings SET delivery = (delivery #>> '{}')::jsonb WHERE jsonb_typeof(delivery) = 'string' AND (delivery #>> '{}') IS JSON;
UPDATE dealr.profiles SET attributes = (attributes #>> '{}')::jsonb WHERE jsonb_typeof(attributes) = 'string' AND (attributes #>> '{}') IS JSON;
UPDATE dealr.matches SET reasons = (reasons #>> '{}')::jsonb WHERE jsonb_typeof(reasons) = 'string' AND (reasons #>> '{}') IS JSON;
UPDATE dealr.broker_profiles SET categories = (categories #>> '{}')::jsonb WHERE jsonb_typeof(categories) = 'string' AND (categories #>> '{}') IS JSON;
UPDATE dealr.analytics SET metadata = (metadata #>> '{}')::jsonb WHERE jsonb_typeof(metadata) = 'string' AND (metadata #>> '{}') IS JSON;
UPDATE dealr.audit SET payload = (payload #>> '{}')::jsonb WHERE jsonb_typeof(payload) = 'string' AND (payload #>> '{}') IS JSON;
