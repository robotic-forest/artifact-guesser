import { DashInfo } from "@/components/info/DashInfo"
import { useGames } from "@/hooks/games/useGames"
import { GiAbstract034 } from "react-icons/gi"
import useSWR from "swr"
import { gamesTheme } from "@/pages/games"
import { modes } from "@/components/gameui/ModeButton" // Import modes for colors
import { Dropdown } from "@/components/dropdown/Dropdown" // Import Dropdown
import { adjustLightness } from "./utils" // Import helper function

// Helper function adjustLightness moved to utils.js

export const Games = () => {
  // Fetch game stats including modeCounts from the updated API endpoint
  const { data: gameStats, error: gameStatsError } = useSWR('/api/games/stats');
  // Fetch platform stats separately (for anonymous games count)
  const { data: platformStats, error: platformStatsError } = useSWR('/api/platform/stats');

  // --- Process Real Mode Data & Color Adjustment ---
  const modeCounts = gameStats?.data?.modeCounts || {}; // Use real data or empty object
  const totalGamesFromModes = Object.values(modeCounts).reduce((sum, count) => sum + count, 0);

  // Group modes by color for adjustment (using real modes found in data)
  const modesByColor = {};
  Object.entries(modes).forEach(([name, details]) => {
    // Only process modes that actually exist in the fetched data
    if (modeCounts[name] !== undefined) {
      const color = details.color || '#cccccc';
      if (!modesByColor[color]) {
        modesByColor[color] = [];
      }
      modesByColor[color].push({ name, ...details });
    }
  });

  // Generate adjusted colors
  const adjustedColors = {};
  const adjustmentStep = 0.04; // Smaller step for subtle changes

  Object.values(modesByColor).forEach(group => {
    if (group.length > 1) {
      // Sort group alphabetically by name for consistent ordering
      group.sort((a, b) => a.name.localeCompare(b.name));
      const midIndex = Math.floor(group.length / 2);
      group.forEach((mode, index) => {
          // Adjust lightness relative to the middle element
          const adjustment = (index - midIndex) * adjustmentStep;
          adjustedColors[mode.name] = adjustLightness(mode.color, adjustment);
      });
    } else if (group.length === 1) {
        adjustedColors[group[0].name] = group[0].color; // No adjustment needed for single modes
    }
  });

  // Use adjusted colors and real counts in modeStats
  const modeStats = Object.entries(modeCounts)
    .map(([mode, count]) => ({
      name: mode,
      count: count,
      color: adjustedColors[mode] || modes[mode]?.color || '#cccccc', // Use adjusted color, fallback to original, then gray
      percentage: totalGamesFromModes > 0 ? (count / totalGamesFromModes) * 100 : 0,
    }))
    // Optional: Sort by count descending for potentially better visualization
    .sort((a, b) => b.count - a.count);
  // --- End Real Mode Data & Color Adjustment ---

  // Calculate total games including anonymous ones
  const totalAuthGames = gameStats?.data?.total ?? 0;
  const totalAnonGames = platformStats?.noauthGames ?? 0;
  const totalDisplayedGames = totalAuthGames + totalAnonGames;
  const gamesUrl = '/games?__sortfield=startedAt&__sortdirection=-1'; // Define URL once

  // Handle loading and error states
  if (gameStatsError || platformStatsError) return <DashInfo title="Games played" url={gamesUrl} extraInfo={<div>Error loading game stats.</div>} theme={gamesTheme} />;
  if (!gameStats || !platformStats) return (
    <DashInfo
      title="Games played"
      url={gamesUrl}
      extraInfo={<div className='p-2 w-full flex justify-center'>Loading...</div>}
      theme={gamesTheme}
    />
  )

  return (
    <DashInfo
      title={<><GiAbstract034 className='text-sm mr-3'/>Games played</>}
      count={totalDisplayedGames} // Use calculated total
      extraInfo={(
        <div className='p-3 text-sm'>
          <div>
            {/* Use data from gameStats */}
            <span className='mr-2'><span className='opacity-60 mr-1'>Auth</span> {gameStats.data.total}</span>
            <span className='mr-2'><span className='opacity-60 mr-1'>Anon</span> {totalAnonGames}</span>
            <span className='mr-2'><span className='opacity-60 mr-1'>Single</span> {gameStats.data.singlePlayerGames}</span>
            <span className='opacity-60 mr-1'>Multi</span> {gameStats.data.multiplayerGames}
          </div>
          {/* --- Mode Stats Section --- */}
          <div className='flex items-center mt-3'>
            <span className='mr-3 w-16 flex-shrink-0 text-xs opacity-80'>Modes</span>
            <div className='flex w-full h-[14px] border border-black'> {/* Container div */}
              {modeStats.map(mode => {
                // Define the button element separately
                const SegmentButton = (
                  // This outer div is necessary for the Dropdown's positioning logic
                  // but the inner div is what gets styled and displayed in the bar.
                  // We apply the width percentage here to the container.
                  <div style={{ width: '100%', height: '100%' }}>
                     <div
                        className='h-full' // Use full height of the container
                        style={{
                          backgroundColor: mode.color,
                          cursor: 'default'
                        }}
                      >
                        {/* No visible content needed here */}
                      </div>
                  </div>
                );

                return (
                  <Dropdown
                    key={mode.name} // Key on the Dropdown itself
                    onHover // Trigger on hover
                    button={SegmentButton} // Pass the defined element
                    // Apply the percentage width to the Dropdown's container
                    containerStyle={{ width: `${mode.percentage}%`, height: '100%', display: 'inline-block', verticalAlign: 'top' }}
                    dropdownStyle={{
                      width: 'auto',
                      minWidth: '100px',
                      width: 'max-content',
                      right: 0, // Manual change preserved
                      left: 'auto', // Manual change preserved
                      padding: 0,
                      border: 'none',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)', // Add a subtle shadow
                      zIndex: 110 // Ensure it's above other elements
                    }}
                    top={-80} // Manual change preserved
                  >
                    {/* Dropdown Content */}
                    <div
                      className="p-2 text-black rounded shadow-lg border border-black/20 text-sm"
                      style={{ backgroundColor: mode.color }} // Apply mode color
                    >
                      <div className="font-bold mb-1">{mode.name}</div>
                      <div>{mode.count} games</div>
                    </div>
                  </Dropdown>
                );
              })}
            </div>
          </div>
          {/* --- End Mode Stats Section --- */}
        </div>
      )}
      url={gamesUrl} // Use the defined URL variable
      theme={gamesTheme}
    />
  )
}
