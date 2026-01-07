import React, { useState } from 'react';
import { Map, Plus } from 'lucide-react';
import SimpleJourneyEntryModal from './SimpleJourneyEntryModal';

const JourneyEntryButton = ({ session, onEntryCreated, compact = false }) => {
  const [showModal, setShowModal] = useState(false);

  const handleSave = (entry) => {
    onEntryCreated?.(entry);
    setShowModal(false);
  };

  if (compact) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          title="Add Journey Entry"
        >
          <Map size={16} />
        </button>

        <SimpleJourneyEntryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          session={session}
          userId={session.userId?._id || session.userId}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors font-medium"
        title="Add Journey Entry"
      >
        <Map size={16} />
        Add Journey Entry
      </button>

      <SimpleJourneyEntryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        session={session}
        userId={session.userId?._id || session.userId}
      />
    </>
  );
};

export default JourneyEntryButton;