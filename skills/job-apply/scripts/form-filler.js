/**
 * Generic best-effort form filler. Matches visible <label>/placeholder/name
 * text against a field map, fills what it recognizes, uploads the resume to
 * file inputs, and leaves everything else untouched for the human to finish.
 * It never clicks a final "Submit"/"Apply" button itself unless autoSubmit
 * is explicitly true AND the caller has already shown the filled form to
 * the user for approval.
 */
const FIELD_ALIASES = {
  fullName: ['full name', 'name', 'your name', 'candidate name'],
  firstName: ['first name'],
  lastName: ['last name', 'surname'],
  email: ['email', 'e-mail'],
  phone: ['phone', 'mobile', 'contact number'],
  address: ['address', 'location', 'city'],
  linkedin: ['linkedin'],
  portfolio: ['portfolio', 'website', 'github'],
  experienceYears: ['years of experience', 'total experience'],
  currentCompany: ['current company', 'current employer'],
  currentCtc: ['current ctc', 'current salary'],
  expectedCtc: ['expected ctc', 'expected salary'],
  noticePeriod: ['notice period'],
  coverLetter: ['cover letter', 'why do you want', 'message to hiring manager'],
};

export async function fillKnownFields(page, profile) {
  const filled = [];
  const skipped = [];

  const inputs = await page.$$('input, textarea, select');
  for (const el of inputs) {
    const label = await getFieldLabel(page, el);
    if (!label) continue;
    const key = matchAlias(label);
    if (!key || profile[key] === undefined) {
      skipped.push(label);
      continue;
    }
    const tag = await el.evaluate((node) => node.tagName.toLowerCase());
    const type = await el.evaluate((node) => node.type || '');
    if (type === 'file') continue; // handled separately via uploadResume
    try {
      if (tag === 'select') {
        await el.selectOption({ label: String(profile[key]) }).catch(() => {});
      } else {
        await el.fill(String(profile[key]));
      }
      filled.push({ label, key });
    } catch {
      skipped.push(label);
    }
  }
  return { filled, skipped };
}

export async function uploadResume(page, resumePath) {
  const fileInputs = await page.$$('input[type="file"]');
  for (const input of fileInputs) {
    await input.setInputFiles(resumePath).catch(() => {});
  }
}

async function getFieldLabel(page, el) {
  const id = await el.getAttribute('id');
  if (id) {
    const label = await page.$(`label[for="${id}"]`);
    if (label) return (await label.textContent())?.trim().toLowerCase();
  }
  const placeholder = await el.getAttribute('placeholder');
  if (placeholder) return placeholder.trim().toLowerCase();
  const ariaLabel = await el.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel.trim().toLowerCase();
  const name = await el.getAttribute('name');
  return name ? name.replace(/[_-]/g, ' ').toLowerCase() : null;
}

function matchAlias(label) {
  for (const [key, aliases] of Object.entries(FIELD_ALIASES)) {
    if (aliases.some((a) => label.includes(a))) return key;
  }
  return null;
}
