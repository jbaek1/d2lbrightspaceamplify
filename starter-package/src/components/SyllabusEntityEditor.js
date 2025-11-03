import React, { useState } from 'react';

const SyllabusEntityEditor = ({ results, onConfirm }) => {
  const [entities, setEntities] = useState(results?.syllabus_entities || {});
  const [isEditing, setIsEditing] = useState({});

  const handleEdit = (field) => {
    setIsEditing({ ...isEditing, [field]: true });
  };

  const handleSave = (field, value) => {
    setEntities({ ...entities, [field]: value });
    setIsEditing({ ...isEditing, [field]: false });
  };

  const handleCancel = (field) => {
    setIsEditing({ ...isEditing, [field]: false });
  };

  const handleConfirmAndGenerate = () => {
    onConfirm(entities);
  };

  const EntityField = ({ label, field, value, multiline = false }) => {
    const [editValue, setEditValue] = useState(value || '');
    const isCurrentlyEditing = isEditing[field];

    return (
      <div className="entity-field">
        <label className="entity-label">{label}</label>
        {isCurrentlyEditing ? (
          <div className="edit-mode">
            {multiline ? (
              <textarea
                className="entity-textarea"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={4}
                autoFocus
              />
            ) : (
              <input
                className="entity-input"
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
              />
            )}
            <div className="edit-actions">
              <button
                className="btn btn-sm btn-success"
                onClick={() => handleSave(field, editValue)}
              >
                ✓ Save
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setEditValue(value || '');
                  handleCancel(field);
                }}
              >
                ✗ Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="view-mode">
            <div className="entity-value">
              {value || <span className="no-value">Not extracted</span>}
            </div>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => {
                setEditValue(value || '');
                handleEdit(field);
              }}
            >
              ✏️ Edit
            </button>
          </div>
        )}
      </div>
    );
  };

  const ArrayEntityField = ({ label, field, values = [] }) => {
    const [editValue, setEditValue] = useState(values.join('\n'));
    const isCurrentlyEditing = isEditing[field];

    return (
      <div className="entity-field">
        <label className="entity-label">{label}</label>
        {isCurrentlyEditing ? (
          <div className="edit-mode">
            <textarea
              className="entity-textarea"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={6}
              placeholder="Enter each item on a new line"
              autoFocus
            />
            <div className="edit-actions">
              <button
                className="btn btn-sm btn-success"
                onClick={() => {
                  const newValues = editValue.split('\n').filter(v => v.trim());
                  handleSave(field, newValues);
                }}
              >
                ✓ Save
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setEditValue(values.join('\n'));
                  handleCancel(field);
                }}
              >
                ✗ Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="view-mode">
            <div className="entity-value">
              {values.length > 0 ? (
                <ul className="entity-list">
                  {values.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <span className="no-value">Not extracted</span>
              )}
            </div>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => {
                setEditValue(values.join('\n'));
                handleEdit(field);
              }}
            >
              ✏️ Edit
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="syllabus-entity-editor">
      <div className="header">
        <h2>📋 Course Syllabus Details</h2>
        <p>Review and confirm the extracted course information below:</p>
      </div>

      <div className="entity-grid">
        <EntityField
          label="Course Code and Name"
          field="course_code_name"
          value={entities.course_code_name}
        />

        <EntityField
          label="Term"
          field="term"
          value={entities.term}
        />

        <EntityField
          label="Office Hours Times and Location"
          field="office_hours"
          value={entities.office_hours}
          multiline={true}
        />

        <EntityField
          label="Course Description"
          field="course_description"
          value={entities.course_description}
          multiline={true}
        />

        <EntityField
          label="Course Format"
          field="course_format"
          value={entities.course_format}
          multiline={true}
        />

        <ArrayEntityField
          label="Course Learning Objectives"
          field="learning_objectives"
          values={entities.learning_objectives}
        />

        <ArrayEntityField
          label="Course Materials"
          field="course_materials"
          values={entities.course_materials}
        />
      </div>

      <div className="confirm-section">
        <div className="extraction-status">
          <p className="extraction-note">
            ℹ️ All information above was automatically extracted from your syllabus. 
            Please review and edit any fields that need correction.
          </p>
        </div>

        <button
          className="btn btn-primary btn-large"
          onClick={handleConfirmAndGenerate}
        >
          🚀 Confirm Details & Generate Course
        </button>
      </div>
    </div>
  );
};

export default SyllabusEntityEditor;