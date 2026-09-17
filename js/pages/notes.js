/**
 * ============================================================================
 * NOTES PAGE MODULE (MVME Architecture)
 * Layer: View & View Machine (Study Notes & Notepad Manager)
 * ============================================================================
 */

(function() {
  // --------------------------------------------------------------------------
  // VIEW MACHINE: Notes State & Manipulation Actions
  // --------------------------------------------------------------------------
  window.selectedNoteIndex = 0;

  const NotesMachine = {
    selectNote: function(idx) {
      window.selectedNoteIndex = idx;
      if (window.AppState) window.AppState.notify();
    },
    clearForm: function(form) {
      if (form) {
        form.noteTitle.value = '';
        form.noteText.value = '';
      }
    },
    filterNotes: function(val) {
      const q = (val || '').toLowerCase();
      const listEl = document.getElementById('saved-notes-list-box');
      if (!listEl) return;
      const items = listEl.querySelectorAll('.saved-note-item');
      items.forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(q) ? 'block' : 'none';
      });
    },
    saveNote: function(form) {
      const user = window.AppState ? window.AppState.currentUser : null;
      if (!user) return;
      if (!user.notes) user.notes = [];

      const courses = (window.AppState.data && window.AppState.data.courses) ? window.AppState.data.courses : [];
      const c = courses.find(item => item.id === form.courseId.value);
      const badgeName = c ? c.title : 'General Studies';

      const newNote = {
        courseId: form.courseId.value,
        title: form.noteTitle.value.trim(),
        text: form.noteText.value.trim(),
        badge: badgeName,
        date: 'Today'
      };

      user.notes.unshift(newNote);
      window.selectedNoteIndex = 0;
      window.AppState.saveData();
      window.AppState.notify();
    },
    deleteNote: function(idx) {
      const user = window.AppState ? window.AppState.currentUser : null;
      if (user && user.notes) {
        user.notes.splice(idx, 1);
        window.AppState.saveData();
        window.AppState.notify();
      }
    }
  };

  // Attach global functions to window to preserve existing HTML inline event handlers
  window.selectStudentNote = NotesMachine.selectNote;
  window.clearNoteForm = NotesMachine.clearForm;
  window.filterSavedNotes = NotesMachine.filterNotes;
  window.saveStudentNote = NotesMachine.saveNote;
  window.deleteStudentNote = NotesMachine.deleteNote;

  // --------------------------------------------------------------------------
  // VIEW: Presentation Templates
  // --------------------------------------------------------------------------
  const NotesView = {
    render: function() {
      const state = window.AppState || {};
      const user = state.currentUser || {};
      if (!user.notes || user.notes.length === 0) {
        user.notes = [
          {
            courseId: 'course-math-101',
            title: 'Derivatives and Integration Fundamentals',
            text: `Fundamental Theorem of Calculus:

1. Connects differentiation and integration.
2. The integral of a function f over [a,b] can be calculated by finding an antiderivative F of f:
∫(a to b) f(x) dx = F(b) - F(a)

Key takeaways from today's lecture:
- Always check if the function is continuous on the interval before applying FTC.
- Review the power rule and chain rule for tomorrow's quiz.
- Need to ask tutor about the specific edge cases for piecewise functions.`,
            date: 'Today',
            badge: 'Advanced Calculus I'
          },
          {
            courseId: 'course-physics-101',
            title: 'Schrödinger Equation Basics',
            text: 'Notes on time-dependent and time-independent forms. Wave function collapse...',
            date: 'Yesterday',
            badge: 'Quantum Mechanics'
          },
          {
            courseId: 'course-history-101',
            title: 'Industrial Revolution Impacts',
            text: 'Socio-economic shifts in 19th century Europe. Urbanization rates and labor laws...',
            date: 'Oct 12',
            badge: 'World History'
          },
          {
            courseId: 'course-chem-101',
            title: 'Acid-Base Titrations',
            text: 'Formulas for calculating pH at equivalence point. Weak acid strong base examples...',
            date: 'Oct 10',
            badge: 'General Chemistry'
          }
        ];
      }
      const courses = (state.data && state.data.courses) ? state.data.courses : [];
      const activeNoteIndex = window.selectedNoteIndex !== undefined ? window.selectedNoteIndex : 0;
      const currentActiveNote = user.notes[activeNoteIndex] || user.notes[0] || {};

      return `
        <div class="page-header">
          <h1 class="page-title">${window.renderIcon('file-text')} My Study Notes & Notepad</h1>
          <p class="page-subtitle">Take notes, list key takeaways, and document conceptual details while watching lecture videos.</p>
        </div>

        <div class="notes-2col-layout">
          <!-- Create / Edit Note Card (Matches 5.PNG) -->
          <div class="note-editor-card">
            <form onsubmit="event.preventDefault(); window.saveStudentNote(this);">
              <div class="note-editor-header">
                <div class="note-editor-title">Create / Edit Note</div>
                <div class="note-editor-actions">
                  <button type="button" class="btn-note-clear" onclick="window.clearNoteForm(this.form)">Clear</button>
                  <button type="submit" class="btn-note-save">
                    ${window.renderIcon('save')} Save Note
                  </button>
                </div>
              </div>

              <div class="note-form-group">
                <label class="note-form-label">Select Course</label>
                <select name="courseId" class="note-select-input" required>
                  ${courses.map(c => `<option value="${c.id}" ${currentActiveNote.courseId === c.id ? 'selected' : ''}>${c.title}</option>`).join('')}
                </select>
              </div>

              <div class="note-form-group">
                <label class="note-form-label">Note Title</label>
                <input type="text" name="noteTitle" class="note-text-input" value="${currentActiveNote.title || ''}" placeholder="e.g. Derivatives and Integration Fundamentals" required>
              </div>

              <div class="note-form-group">
                <label class="note-form-label">Note Content</label>
                <div class="note-editor-toolbar">
                  <button type="button" class="toolbar-btn">B</button>
                  <button type="button" class="toolbar-btn">I</button>
                  <button type="button" class="toolbar-btn">${window.renderIcon('list')}</button>
                  <button type="button" class="toolbar-btn">${window.renderIcon('list-ordered')}</button>
                </div>
                <textarea name="noteText" class="note-textarea" placeholder="Write down notes, formulas, conceptual takeaways..." required>${currentActiveNote.text || ''}</textarea>
              </div>
            </form>
          </div>

          <!-- Saved Notes List Card (Matches 5.PNG) -->
          <div class="saved-notes-container">
            <div class="saved-notes-header">
              <div class="saved-notes-title">Saved Notes</div>
              <a href="#" onclick="event.preventDefault();" class="saved-notes-view-all">View All</a>
            </div>

            <div class="saved-notes-search">
              ${window.renderIcon('search')}
              <input type="text" placeholder="Search notes..." oninput="window.filterSavedNotes(this.value)">
            </div>

            <div class="saved-notes-list" id="saved-notes-list-box">
              ${user.notes.map((n, idx) => {
                const course = courses.find(c => c.id === n.courseId);
                const badgeName = n.badge || (course ? course.title : 'General Studies');
                return `
                  <div class="saved-note-item ${idx === activeNoteIndex ? 'active' : ''}" onclick="window.selectStudentNote(${idx})">
                    <div class="saved-note-top-line">
                      <span class="saved-note-tag">${badgeName}</span>
                      <span class="saved-note-date">${n.date || 'Today'}</span>
                    </div>
                    <div class="saved-note-heading">${n.title}</div>
                    <div class="saved-note-snippet">${n.text}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }
  };

  // Export to window
  window.NotesMachine = NotesMachine;
  window.NotesView = NotesView;
  window.renderNotesView = function() {
    return NotesView.render();
  };
})();
