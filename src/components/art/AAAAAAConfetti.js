import React, { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styled from '@emotion/styled';
import { generateInsult } from '@/hooks/useInsult';

// Dynamically import the RecursiveAAAAAA component
const RecursiveAAAAAADynamic = dynamic(() => import('@/components/art/RecursiveAAAAAA'), {
  ssr: false,
});

// Keyframes for the fountain animation (upwards and fade)
const confettiAnimation = `
  @keyframes confetti-fountain {
    0% { transform: translateY(0vh) translateX(-50%) rotate(0deg); opacity: 1; } /* Start at bottom center */
    100% { transform: translateY(-110vh) translateX(var(--x-end)) rotate(var(--rotate-end)); opacity: 0; } /* Move up off screen and fade */
  }
`;

// Styled component for individual confetti pieces
const ConfettiPiece = styled.div`
  position: fixed; /* Position relative to viewport */
  bottom: 0; /* Start at the bottom */
  left: 50%; /* Start horizontally centered */
  transform: translateX(-50%); /* Adjust for centering */
  transform-origin: center center;
  will-change: transform, opacity;
  /* Use new animation name and adjust duration */
  animation: confetti-fountain 6s linear forwards; /* Increased duration to 6s */
  animation-delay: var(--delay); // Apply random delay

  /* Inject keyframes */
  ${confettiAnimation}
`;

// Removed ConfettiContainer
// Removed Button

export default function AAAAAAConfetti() {
  const [confetti, setConfetti] = useState([]);
  const intervalRef = useRef(null); // Ref to hold interval ID

  // Helper function to build the recursive JSX structure
  const buildRecursiveJsx = (currentDepth) => {
    if (currentDepth <= 0) {
      // Base case: Innermost component
      return <RecursiveAAAAAADynamic initialAngry={true} initialText={null} />;
    } else {
      // Recursive step: Wrap the next level
      return (
        <RecursiveAAAAAADynamic
          initialAngry={true}
          initialText={buildRecursiveJsx(currentDepth - 1)} // Recurse
        />
      );
    }
  };

  const addConfettiPiece = useCallback(() => {
    const id = Date.now() + Math.random(); // Unique ID
    const xEnd = `${(Math.random() - 0.5) * 50}vw`; // Increased horizontal drift to 50vw
    const rotateEnd = `${(Math.random() - 0.5) * 720}deg`; // Random rotation
    const delay = `0s`; // No delay for continuous stream

    let pieceJsx;
    // Randomly choose between recursive structure and insult
    if (Math.random() < 0.3) { // 10% chance for recursive
      // Generate a random depth (1 to 10) for the *entire structure* of this piece
      const structureDepth = Math.floor(Math.random() * 6) + 1;
      // Build the complete nested JSX for this piece
      pieceJsx = buildRecursiveJsx(structureDepth);
    } else { // 80% chance for insult
      const insult = generateInsult('name'); // Call without arguments
      // Create a single component with the insult as text (depth 0)
      pieceJsx = <RecursiveAAAAAADynamic initialAngry={true} initialText={insult} depth={0} />;
    }

    // Remove the confetti piece after animation (matches animation duration)
    setTimeout(() => {
      setConfetti(current => current.filter(c => c.id !== id));
    }, 6000); /* Increased timeout to 6s */

    // Store the generated JSX (either type) along with animation properties
    setConfetti(current => [...current, { id, xEnd, rotateEnd, delay, recursiveJsx: pieceJsx }]);
  }, []); // generateInsult is likely stable, removing from deps unless it causes issues

  useEffect(() => {
    // Start interval to add confetti pieces continuously
    intervalRef.current = setInterval(addConfettiPiece, 50); // Add pieces faster (every 50ms)

    // Cleanup function to clear interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [addConfettiPiece]); // Rerun effect if addConfettiPiece changes (it shouldn't due to useCallback)

  return (
    <div> {/* No button needed, container just holds the pieces */}
      {/* Render confetti pieces directly */}
      {/* Destructure recursiveJsx */}
      {confetti.map(({ id, xEnd, rotateEnd, delay, recursiveJsx }) => (
        <ConfettiPiece
          key={id}
          // Removed rotateMid as it's less relevant for upward trajectory
          style={{
            '--x-end': xEnd,
            '--rotate-end': rotateEnd,
            '--delay': delay,
          }}
        >
          {/* Render the pre-built recursive JSX structure */}
          {recursiveJsx}
        </ConfettiPiece>
      ))}
    </div>
  );
}
