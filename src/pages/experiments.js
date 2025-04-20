import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the new AAAAAAConfetti component
const AAAAAAConfettiDynamic = dynamic(() => import('@/components/art/AAAAAAConfetti'), {
  ssr: false, // Ensure it runs client-side
});

export default () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', paddingTop: '50px' }}>
      {/* Render the confetti component */}
      <AAAAAAConfettiDynamic />
    </div>
  );
};
