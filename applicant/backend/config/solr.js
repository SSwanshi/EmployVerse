require('dotenv').config();

/**
 * Solr is optional at runtime: if SOLR_ENABLED is not "true", search falls back to Fuse.js.
 *
 * Manual setup (after installing Apache Solr locally or on a server):
 * 1. Create an empty core named e.g. "gohire" (see scripts/solr-core-setup.txt).
 * 2. Run: npm run solr:init   (adds fields via Schema API)
 * 3. Run: npm run solr:index (loads jobs + internships from MongoDB into Solr)
 * 4. Set env: SOLR_ENABLED=true and SOLR_BASE_URL=http://localhost:8983/solr/gohire
 */

function getSolrBaseUrl() {
  const raw = process.env.SOLR_BASE_URL || 'http://localhost:8983/solr/gohire';
  return raw.replace(/\/$/, '');
}

function isSolrEnabled() {
  return String(process.env.SOLR_ENABLED || '').toLowerCase() === 'true';
}

module.exports = {
  getSolrBaseUrl,
  isSolrEnabled,
};
