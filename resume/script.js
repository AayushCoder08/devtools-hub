const form = document.getElementById('resumeForm');
const preview = document.getElementById('resumePreview');
const byName = (name) => form.elements.namedItem(name);
const val = (name) => (byName(name)?.value || '').trim();
const setText = (id, value, fallback = '') => {
  const el = document.getElementById(id);
  el.textContent = value || fallback;
};
const showSection = (sectionId, hasContent) => {
  document.getElementById(sectionId).hidden = !hasContent;
};
function updatePreview() {
  setText('pName', val('fullName'), 'Your Name');
  setText('pRole', val('role'), 'Fresher / Entry-Level Candidate');
  const contact = [val('email'), val('phone'), val('location'), val('links')].filter(Boolean);
  const contactEl = document.getElementById('pContact');
  contactEl.replaceChildren();
  contact.forEach((item, i) => {
    const span = document.createElement('span');
    span.textContent = item;
    contactEl.appendChild(span);
    if (i < contact.length - 1) {
      const sep = document.createElement('span');
      sep.textContent = '•';
      contactEl.appendChild(sep);
    }
  });
  setText('pSummary', val('summary'));
  showSection('summarySection', !!val('summary'));
  setText('pEducation', val('education'));
  setText('pCollege', val('college'));
  setText('pGradYear', val('gradYear'));
  setText('pMarks', val('marks'));
  showSection('educationSection', !!(val('education') || val('college') || val('gradYear') || val('marks')));
  const skillsEl = document.getElementById('pSkills');
  skillsEl.replaceChildren();
  const skills = val('skills').split(',').map(s => s.trim()).filter(Boolean);
  skills.forEach(skill => {
    const li = document.createElement('li');
    li.textContent = skill;
    skillsEl.appendChild(li);
  });
  showSection('skillsSection', skills.length > 0);
  setText('pProjectTitle', val('projectTitle'));
  setText('pProjectDesc', val('projectDesc'));
  showSection('projectSection', !!(val('projectTitle') || val('projectDesc')));
  setText('pCertifications', val('certifications'));
  showSection('certSection', !!val('certifications'));
  setText('pLanguages', val('languages'));
  showSection('languagesSection', !!val('languages'));
}
form.addEventListener('input', updatePreview);
document.getElementById('previewBtn').addEventListener('click', () => {
  updatePreview();
  document.querySelector('.preview-panel').scrollIntoView({behavior: 'smooth', block: 'start'});
});
document.getElementById('downloadBtn').addEventListener('click', () => {
  updatePreview();
  window.print();
});
document.getElementById('templateSelect').addEventListener('change', event => {
  preview.classList.remove('classic', 'modern', 'compact');
  preview.classList.add(event.target.value);
});
document.getElementById('clearBtn').addEventListener('click', () => {
  if (!confirm('Clear all resume fields? This cannot be undone.')) return;
  form.reset();
  updatePreview();
});
updatePreview();
