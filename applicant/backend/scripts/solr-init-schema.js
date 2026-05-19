/**
 * Adds fields expected by GoHire search (run once per Solr core).
 * Requires: Solr running, core created, SOLR_BASE_URL in .env (optional; defaults localhost).
 *
 * Usage: node scripts/solr-init-schema.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const axios = require('axios');
const { getSolrBaseUrl } = require('../config/solr');

const base = getSolrBaseUrl();

async function addField(def) {
  const url = `${base}/schema`;
  const res = await axios.post(url, def, {
    headers: { 'Content-Type': 'application/json' },
    validateStatus: () => true,
  });
  if (res.status !== 200) {
    const err = res.data?.error?.msg || JSON.stringify(res.data);
    if (String(err).includes('already exists') || String(err).includes('duplicate')) {
      console.warn('Skip (exists):', def['add-field']?.name || def['add-field-type']?.name);
      return;
    }
    throw new Error(err);
  }
  console.log('OK:', def['add-field']?.name || def['add-field-type']?.name || JSON.stringify(def));
}

async function main() {
  console.log('Solr schema init for:', base);

  await addField({
    'add-field': {
      name: 'text_all',
      type: 'text_general',
      indexed: true,
      stored: true,
      multiValued: false,
    },
  });

  await addField({
    'add-field': {
      name: 'type_s',
      type: 'string',
      indexed: true,
      stored: true,
      multiValued: false,
    },
  });

  await addField({
    'add-field': {
      name: 'mongoId_s',
      type: 'string',
      indexed: true,
      stored: true,
      multiValued: false,
    },
  });

  console.log('Schema init finished. Reload core if Solr asks you to.');
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
